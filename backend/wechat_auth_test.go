package main

import (
	"context"
	"database/sql"
	"net/http/httptest"
	"testing"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func TestAuthTokenRoundTrip(t *testing.T) {
	t.Setenv("AUTH_TOKEN_SECRET", "test-secret")
	request := httptest.NewRequest("GET", "/", nil)
	request.Header.Set("Authorization", "Bearer "+authToken("user-1"))
	userID, ok := authenticatedUserID(request)
	if !ok || userID != "user-1" {
		t.Fatalf("authenticatedUserID() = %q, %v", userID, ok)
	}
	request.Header.Set("Authorization", "Bearer tampered.token")
	if _, ok = authenticatedUserID(request); ok {
		t.Fatal("tampered token was accepted")
	}
}

func TestLoginInputValidation(t *testing.T) {
	if !validMainlandPhone("13900000000") || validMainlandPhone("12900000000") || validMainlandPhone("1390000000a") {
		t.Fatal("phone validation returned an unexpected result")
	}
	if !validDevelopmentCode("1234") || !validDevelopmentCode("123456") || validDevelopmentCode("123") || validDevelopmentCode("12a4") {
		t.Fatal("development code validation returned an unexpected result")
	}
}

func TestMergeUserProfiles(t *testing.T) {
	db, err := sql.Open("pgx", databaseURL())
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	if err = db.Ping(); err != nil {
		t.Skipf("PostgreSQL is unavailable: %v", err)
	}
	var schemaReady bool
	if err = db.QueryRow(`SELECT to_regclass('profile') IS NOT NULL`).Scan(&schemaReady); err != nil || !schemaReady {
		t.Skip("lbb_mall schema is unavailable")
	}

	tx, err := db.BeginTx(context.Background(), nil)
	if err != nil {
		t.Fatal(err)
	}
	defer tx.Rollback()
	suffix := time.Now().UnixNano()
	sourceID := newID("merge-source")
	targetID := newID("merge-target")
	openID := newID("openid")
	phone := "139" + time.Unix(0, suffix).Format("15040500")
	if _, err = tx.Exec(`INSERT INTO profile(id,open_id,nickname,avatar,phone,points,coupons,favorites,created_at,updated_at) VALUES($1,$2,'微信昵称','avatar','',20,1,2,NOW(),NOW()),($3,NULL,'','','',30,3,4,NOW(),NOW())`, sourceID, openID, targetID); err != nil {
		t.Fatal(err)
	}
	if _, err = tx.Exec(`UPDATE profile SET phone=$1 WHERE id=$2`, phone, targetID); err != nil {
		t.Fatal(err)
	}
	if _, err = tx.Exec(`INSERT INTO point_records(id,user_id,title,occurred_at,change,created_at,updated_at) VALUES($1,$2,'测试记录',NOW(),20,NOW(),NOW())`, newID("merge-point"), sourceID); err != nil {
		t.Fatal(err)
	}
	if _, err = tx.Exec(`INSERT INTO user_addresses(id,user_id,province,city,district,detail,contact_name,contact_phone,created_at,updated_at) VALUES($1,$2,'福建省','泉州市','丰泽区','来源地址','来源用户','13900000000',NOW(),NOW()),($3,$4,'福建省','泉州市','丰泽区','目标地址','目标用户','13900000001',NOW(),NOW())`, newID("source-address"), sourceID, newID("target-address"), targetID); err != nil {
		t.Fatal(err)
	}
	if _, err = tx.Exec(`INSERT INTO daily_check_ins(id,user_id,check_in_date,points,created_at,updated_at) VALUES($1,$2,CURRENT_DATE,10,NOW(),NOW()),($3,$4,CURRENT_DATE,10,NOW(),NOW())`, newID("source-checkin"), sourceID, newID("target-checkin"), targetID); err != nil {
		t.Fatal(err)
	}

	if err = mergeUserProfiles(context.Background(), tx, sourceID, targetID); err != nil {
		t.Fatal(err)
	}
	var nickname, avatar, mergedOpenID string
	var points, coupons, favorites int
	if err = tx.QueryRow(`SELECT nickname,avatar,open_id,points,coupons,favorites FROM profile WHERE id=$1`, targetID).Scan(&nickname, &avatar, &mergedOpenID, &points, &coupons, &favorites); err != nil {
		t.Fatal(err)
	}
	if nickname != "微信昵称" || avatar != "avatar" || mergedOpenID != openID || points != 50 || coupons != 4 || favorites != 6 {
		t.Fatalf("unexpected merged profile: %q %q %q %d %d %d", nickname, avatar, mergedOpenID, points, coupons, favorites)
	}
	for name, query := range map[string]string{
		"source profile": `SELECT COUNT(*) FROM profile WHERE id=$1`,
		"point record":   `SELECT COUNT(*) FROM point_records WHERE user_id=$1`,
		"address":        `SELECT COUNT(*) FROM user_addresses WHERE user_id=$1`,
		"check-in":       `SELECT COUNT(*) FROM daily_check_ins WHERE user_id=$1`,
	} {
		var count int
		if err = tx.QueryRow(query, targetID).Scan(&count); err != nil {
			t.Fatal(err)
		}
		expected := 1
		if name == "source profile" {
			if err = tx.QueryRow(query, sourceID).Scan(&count); err != nil {
				t.Fatal(err)
			}
			expected = 0
		}
		if count != expected {
			t.Fatalf("%s count = %d, want %d", name, count, expected)
		}
	}
}
