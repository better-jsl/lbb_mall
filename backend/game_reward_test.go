package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func TestValidGameRewardRequestID(t *testing.T) {
	for _, test := range []struct {
		name      string
		requestID string
		want      bool
	}{
		{name: "empty", requestID: "", want: false},
		{name: "regular", requestID: "xiaoxiaole-123-456", want: true},
		{name: "maximum length", requestID: strings.Repeat("a", 128), want: true},
		{name: "too long", requestID: strings.Repeat("a", 129), want: false},
		{name: "invalid characters", requestID: "request id", want: false},
	} {
		t.Run(test.name, func(t *testing.T) {
			if got := validGameRewardRequestID(test.requestID); got != test.want {
				t.Fatalf("validGameRewardRequestID() = %v, want %v", got, test.want)
			}
		})
	}
}

func TestAPIHealthEndpoint(t *testing.T) {
	response := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/api/v1/health", nil)
	(&app{}).routes().ServeHTTP(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("health status = %d, body = %s", response.Code, response.Body.String())
	}
}

func TestGameRewardEndpointsAreIdempotent(t *testing.T) {
	db := gameRewardTestDatabase(t)
	t.Setenv("AUTH_TOKEN_SECRET", "game-reward-test-secret")

	suffix := time.Now().UnixNano()
	userID := fmt.Sprintf("reward-user-%d", suffix)
	gameID := fmt.Sprintf("reward-game-%d", suffix)
	otherGameID := fmt.Sprintf("reward-other-game-%d", suffix)
	requestID := fmt.Sprintf("%s-request-%d", gameID, suffix)

	if _, err := db.Exec(`INSERT INTO profile(id,points,coupons,favorites,created_at,updated_at) VALUES($1,100,0,0,NOW(),NOW())`, userID); err != nil {
		t.Fatal(err)
	}
	for _, id := range []string{gameID, otherGameID} {
		if _, err := db.Exec(`INSERT INTO games(id,title,reward_points,points,daily_limit,team_size,sort_order,active,created_at,updated_at) VALUES($1,'测试游戏',17,0,1,1,999,TRUE,NOW(),NOW())`, id); err != nil {
			t.Fatal(err)
		}
	}
	t.Cleanup(func() {
		_, _ = db.Exec(`DELETE FROM game_rewards WHERE user_id=$1`, userID)
		_, _ = db.Exec(`DELETE FROM point_records WHERE user_id=$1`, userID)
		_, _ = db.Exec(`DELETE FROM games WHERE id IN ($1,$2)`, gameID, otherGameID)
		_, _ = db.Exec(`DELETE FROM profile WHERE id=$1`, userID)
	})

	api := (&app{db: db}).routes()
	config := performGameRequest(t, api, http.MethodGet, "/api/v1/games/"+gameID+"/reward-config", userID, nil)
	if config.Code != http.StatusOK {
		t.Fatalf("reward config status = %d, body = %s", config.Code, config.Body.String())
	}
	var configPayload struct {
		Data struct {
			GameID       string `json:"gameId"`
			RewardPoints int    `json:"rewardPoints"`
		} `json:"data"`
	}
	decodeTestResponse(t, config, &configPayload)
	if configPayload.Data.GameID != gameID || configPayload.Data.RewardPoints != 17 {
		t.Fatalf("unexpected reward config: %+v", configPayload.Data)
	}

	invalidPrefix := performGameRequest(t, api, http.MethodPost, "/api/v1/games/"+gameID+"/reward", userID, map[string]string{"requestId": "another-game-request"})
	if invalidPrefix.Code != http.StatusBadRequest {
		t.Fatalf("invalid-prefix reward status = %d, body = %s", invalidPrefix.Code, invalidPrefix.Body.String())
	}

	body := map[string]string{"requestId": requestID}
	first := performGameRequest(t, api, http.MethodPost, "/api/v1/games/"+gameID+"/reward", userID, body)
	if first.Code != http.StatusCreated {
		t.Fatalf("first reward status = %d, body = %s", first.Code, first.Body.String())
	}
	assertRewardResponse(t, first, true, 17, 117)

	duplicate := performGameRequest(t, api, http.MethodPost, "/api/v1/games/"+gameID+"/reward", userID, body)
	if duplicate.Code != http.StatusOK {
		t.Fatalf("duplicate reward status = %d, body = %s", duplicate.Code, duplicate.Body.String())
	}
	assertRewardResponse(t, duplicate, false, 17, 117)

	crossGame := performGameRequest(t, api, http.MethodPost, "/api/v1/games/"+otherGameID+"/reward", userID, body)
	if crossGame.Code != http.StatusConflict {
		t.Fatalf("cross-game reward status = %d, body = %s", crossGame.Code, crossGame.Body.String())
	}

	var balance, rewardCount, recordCount int
	if err := db.QueryRow(`SELECT points FROM profile WHERE id=$1`, userID).Scan(&balance); err != nil {
		t.Fatal(err)
	}
	if err := db.QueryRow(`SELECT COUNT(*) FROM game_rewards WHERE user_id=$1`, userID).Scan(&rewardCount); err != nil {
		t.Fatal(err)
	}
	if err := db.QueryRow(`SELECT COUNT(*) FROM point_records WHERE user_id=$1`, userID).Scan(&recordCount); err != nil {
		t.Fatal(err)
	}
	if balance != 117 || rewardCount != 1 || recordCount != 1 {
		t.Fatalf("balance = %d, rewards = %d, records = %d", balance, rewardCount, recordCount)
	}
}

func gameRewardTestDatabase(t *testing.T) *sql.DB {
	t.Helper()
	orm, err := gorm.Open(postgres.Open(databaseURL()), &gorm.Config{})
	if err != nil {
		t.Skipf("PostgreSQL is unavailable: %v", err)
	}
	db, err := orm.DB()
	if err != nil {
		t.Fatal(err)
	}
	if err = db.Ping(); err != nil {
		t.Skipf("PostgreSQL is unavailable: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	if err = migrate(orm); err != nil {
		t.Fatal(err)
	}
	return db
}

func performGameRequest(t *testing.T, handler http.Handler, method, path, userID string, body any) *httptest.ResponseRecorder {
	t.Helper()
	var encoded []byte
	if body != nil {
		var err error
		encoded, err = json.Marshal(body)
		if err != nil {
			t.Fatal(err)
		}
	}
	request := httptest.NewRequest(method, path, bytes.NewReader(encoded))
	request.Header.Set("Authorization", "Bearer "+authToken(userID))
	if body != nil {
		request.Header.Set("Content-Type", "application/json")
	}
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	return response
}

func assertRewardResponse(t *testing.T, response *httptest.ResponseRecorder, awarded bool, reward, points int) {
	t.Helper()
	var payload struct {
		Data struct {
			Awarded bool `json:"awarded"`
			Reward  int  `json:"reward"`
			Points  int  `json:"points"`
		} `json:"data"`
	}
	decodeTestResponse(t, response, &payload)
	if payload.Data.Awarded != awarded || payload.Data.Reward != reward || payload.Data.Points != points {
		t.Fatalf("unexpected reward response: %+v", payload.Data)
	}
}

func decodeTestResponse(t *testing.T, response *httptest.ResponseRecorder, target any) {
	t.Helper()
	if err := json.Unmarshal(response.Body.Bytes(), target); err != nil {
		t.Fatalf("decode response %q: %v", response.Body.String(), err)
	}
}
