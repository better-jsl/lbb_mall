package main

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const authTokenLifetime = 30 * 24 * time.Hour

type wechatProfile struct {
	ID       string `json:"id"`
	Nickname string `json:"nickname"`
	Avatar   string `json:"avatar"`
	Phone    string `json:"phone"`
}

type authSession struct {
	Token        string        `json:"token"`
	Profile      wechatProfile `json:"profile"`
	NeedsProfile bool          `json:"needsProfile"`
}

type authClaims struct {
	UserID    string `json:"sub"`
	ExpiresAt int64  `json:"exp"`
}

func authToken(userID string) string {
	claims, _ := json.Marshal(authClaims{UserID: userID, ExpiresAt: time.Now().Add(authTokenLifetime).Unix()})
	payload := base64.RawURLEncoding.EncodeToString(claims)
	mac := hmac.New(sha256.New, []byte(env("AUTH_TOKEN_SECRET", "lbb-mall-development-secret")))
	_, _ = mac.Write([]byte(payload))
	return payload + "." + base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}

func authenticatedUserID(r *http.Request) (string, bool) {
	parts := strings.Fields(r.Header.Get("Authorization"))
	if len(parts) != 2 || parts[0] != "Bearer" {
		return "", false
	}
	tokenParts := strings.Split(parts[1], ".")
	if len(tokenParts) != 2 {
		return "", false
	}
	claimsRaw, err := base64.RawURLEncoding.DecodeString(tokenParts[0])
	if err != nil || len(claimsRaw) == 0 {
		return "", false
	}
	providedSignature, err := base64.RawURLEncoding.DecodeString(tokenParts[1])
	if err != nil {
		return "", false
	}
	mac := hmac.New(sha256.New, []byte(env("AUTH_TOKEN_SECRET", "lbb-mall-development-secret")))
	_, _ = mac.Write([]byte(tokenParts[0]))
	if !hmac.Equal(providedSignature, mac.Sum(nil)) {
		return "", false
	}
	var claims authClaims
	if json.Unmarshal(claimsRaw, &claims) != nil || claims.UserID == "" || claims.ExpiresAt <= time.Now().Unix() {
		return "", false
	}
	return claims.UserID, true
}

func requestUserID(r *http.Request) string {
	if userID, ok := authenticatedUserID(r); ok {
		return userID
	}
	return ""
}

func (a *app) requireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := authenticatedUserID(r)
		if !ok {
			respond(w, http.StatusUnauthorized, map[string]string{"message": "请先登录"})
			return
		}
		var exists bool
		if err := a.db.QueryRowContext(r.Context(), `SELECT EXISTS(SELECT 1 FROM profile WHERE id=$1)`, userID).Scan(&exists); err != nil {
			serverError(w, err)
			return
		}
		if !exists {
			respond(w, http.StatusUnauthorized, map[string]string{"message": "登录状态已失效，请重新登录"})
			return
		}
		next(w, r)
	}
}

func profileByID(ctx context.Context, db interface {
	QueryRowContext(context.Context, string, ...any) *sql.Row
}, userID string) (wechatProfile, error) {
	profile := wechatProfile{}
	err := db.QueryRowContext(ctx, `SELECT id,nickname,avatar,phone FROM profile WHERE id=$1`, userID).Scan(&profile.ID, &profile.Nickname, &profile.Avatar, &profile.Phone)
	return profile, err
}

func sessionForProfile(profile wechatProfile) authSession {
	return authSession{
		Token:        authToken(profile.ID),
		Profile:      profile,
		NeedsProfile: profile.Nickname == "" || profile.Avatar == "" || profile.Phone == "",
	}
}

func (a *app) phoneLogin(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Phone string `json:"phone"`
		Code  string `json:"code"`
	}
	if json.NewDecoder(r.Body).Decode(&input) != nil {
		badRequest(w, "登录信息格式不正确")
		return
	}
	phone := strings.TrimSpace(input.Phone)
	code := strings.TrimSpace(input.Code)
	if !validMainlandPhone(phone) {
		badRequest(w, "请输入正确的手机号")
		return
	}
	if !validDevelopmentCode(code) {
		badRequest(w, "请输入4至6位验证码")
		return
	}

	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		serverError(w, err)
		return
	}
	defer tx.Rollback()
	if _, err = tx.ExecContext(r.Context(), `SELECT pg_advisory_xact_lock(hashtext($1))`, phone); err != nil {
		serverError(w, err)
		return
	}
	var userID string
	err = tx.QueryRowContext(r.Context(), `SELECT id FROM profile WHERE phone=$1 ORDER BY created_at LIMIT 1 FOR UPDATE`, phone).Scan(&userID)
	if err == sql.ErrNoRows {
		userID = newID("phone-user")
		_, err = tx.ExecContext(r.Context(), `INSERT INTO profile(id,nickname,avatar,phone,points,coupons,favorites,created_at,updated_at) VALUES($1,'乐伴伴会员','',$2,0,0,0,NOW(),NOW())`, userID, phone)
	}
	if err != nil {
		serverError(w, err)
		return
	}
	profile, err := profileByID(r.Context(), tx, userID)
	if err != nil {
		serverError(w, err)
		return
	}
	if err = tx.Commit(); err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusOK, sessionForProfile(profile))
}

func validMainlandPhone(phone string) bool {
	if len(phone) != 11 || phone[0] != '1' || phone[1] < '3' || phone[1] > '9' {
		return false
	}
	for _, value := range phone {
		if value < '0' || value > '9' {
			return false
		}
	}
	return true
}

func validDevelopmentCode(code string) bool {
	if len(code) < 4 || len(code) > 6 {
		return false
	}
	for _, value := range code {
		if value < '0' || value > '9' {
			return false
		}
	}
	return true
}

func wechatCredentials() (string, string, bool) {
	appID := env("WECHAT_APP_ID", "wxccc12a8af236fe20")
	secret := strings.TrimSpace(os.Getenv("WECHAT_APP_SECRET"))
	return appID, secret, appID != "" && secret != ""
}

func wechatGET(r *http.Request, endpoint string, values url.Values, target any) error {
	request, err := http.NewRequestWithContext(r.Context(), http.MethodGet, endpoint+"?"+values.Encode(), nil)
	if err != nil {
		return err
	}
	response, err := (&http.Client{Timeout: 8 * time.Second}).Do(request)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		return fmt.Errorf("wechat response status %d", response.StatusCode)
	}
	return json.NewDecoder(io.LimitReader(response.Body, 1<<20)).Decode(target)
}

func (a *app) wechatLogin(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Code string `json:"code"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil || strings.TrimSpace(input.Code) == "" {
		badRequest(w, "微信登录凭证无效")
		return
	}
	appID, secret, configured := wechatCredentials()
	if !configured {
		respond(w, http.StatusServiceUnavailable, map[string]string{"message": "服务端尚未配置 WECHAT_APP_SECRET"})
		return
	}
	var session struct {
		OpenID  string `json:"openid"`
		ErrCode int    `json:"errcode"`
		ErrMsg  string `json:"errmsg"`
	}
	if err := wechatGET(r, "https://api.weixin.qq.com/sns/jscode2session", url.Values{"appid": {appID}, "secret": {secret}, "js_code": {strings.TrimSpace(input.Code)}, "grant_type": {"authorization_code"}}, &session); err != nil {
		serverError(w, err)
		return
	}
	if session.ErrCode != 0 || session.OpenID == "" {
		respond(w, http.StatusBadGateway, map[string]string{"message": "微信登录失败：" + session.ErrMsg})
		return
	}

	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		serverError(w, err)
		return
	}
	defer tx.Rollback()
	if _, err = tx.ExecContext(r.Context(), `SELECT pg_advisory_xact_lock(hashtext($1))`, "wechat:"+session.OpenID); err != nil {
		serverError(w, err)
		return
	}
	profile := wechatProfile{}
	err = tx.QueryRowContext(r.Context(), `SELECT id, nickname, avatar, phone FROM profile WHERE open_id = $1 ORDER BY created_at LIMIT 1 FOR UPDATE`, session.OpenID).Scan(&profile.ID, &profile.Nickname, &profile.Avatar, &profile.Phone)
	if err == sql.ErrNoRows {
		profile.ID = newID("wx-user")
		if _, err = tx.ExecContext(r.Context(), `INSERT INTO profile(id, open_id, nickname, avatar, phone, points, coupons, favorites, created_at, updated_at) VALUES($1,$2,'','','',0,0,0,NOW(),NOW())`, profile.ID, session.OpenID); err != nil {
			serverError(w, err)
			return
		}
	} else if err != nil {
		serverError(w, err)
		return
	}
	if err = tx.Commit(); err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusOK, sessionForProfile(profile))
}

func (a *app) updateWechatProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedUserID(r)
	if !ok {
		respond(w, http.StatusUnauthorized, map[string]string{"message": "请先登录"})
		return
	}
	var input struct {
		Nickname string `json:"nickname"`
		Avatar   string `json:"avatar"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		badRequest(w, "用户资料格式不正确")
		return
	}
	if strings.TrimSpace(input.Nickname) == "" || strings.TrimSpace(input.Avatar) == "" {
		badRequest(w, "请完成头像和昵称授权")
		return
	}
	if _, err := a.db.ExecContext(r.Context(), `UPDATE profile SET nickname=$1, avatar=$2, updated_at=NOW() WHERE id=$3`, strings.TrimSpace(input.Nickname), strings.TrimSpace(input.Avatar), userID); err != nil {
		serverError(w, err)
		return
	}
	var phone string
	if err := a.db.QueryRowContext(r.Context(), `SELECT phone FROM profile WHERE id=$1`, userID).Scan(&phone); err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusOK, wechatProfile{ID: userID, Nickname: strings.TrimSpace(input.Nickname), Avatar: strings.TrimSpace(input.Avatar), Phone: phone})
}

func (a *app) authorizeWechatPhone(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedUserID(r)
	if !ok {
		respond(w, http.StatusUnauthorized, map[string]string{"message": "请先登录"})
		return
	}
	var input struct {
		PhoneCode string `json:"phoneCode"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil || strings.TrimSpace(input.PhoneCode) == "" {
		badRequest(w, "手机号授权未完成")
		return
	}
	phone, err := wechatPhoneNumber(r, input.PhoneCode)
	if err != nil {
		respond(w, http.StatusBadGateway, map[string]string{"message": "微信手机号授权失败"})
		return
	}
	phone = strings.TrimSpace(phone)
	if !validMainlandPhone(phone) {
		respond(w, http.StatusBadGateway, map[string]string{"message": "微信返回的手机号格式无效"})
		return
	}
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		serverError(w, err)
		return
	}
	defer tx.Rollback()
	if _, err = tx.ExecContext(r.Context(), `SELECT pg_advisory_xact_lock(hashtext($1))`, phone); err != nil {
		serverError(w, err)
		return
	}
	var currentID string
	if err = tx.QueryRowContext(r.Context(), `SELECT id FROM profile WHERE id=$1 FOR UPDATE`, userID).Scan(&currentID); err != nil {
		serverError(w, err)
		return
	}
	canonicalID := currentID
	var phoneUserID string
	err = tx.QueryRowContext(r.Context(), `SELECT id FROM profile WHERE phone=$1 AND id<>$2 ORDER BY created_at LIMIT 1 FOR UPDATE`, phone, currentID).Scan(&phoneUserID)
	if err != nil && err != sql.ErrNoRows {
		serverError(w, err)
		return
	}
	if err == nil {
		canonicalID = phoneUserID
		if err = mergeUserProfiles(r.Context(), tx, currentID, canonicalID); err != nil {
			serverError(w, err)
			return
		}
	}
	if _, err = tx.ExecContext(r.Context(), `UPDATE profile SET phone=$1, updated_at=NOW() WHERE id=$2`, phone, canonicalID); err != nil {
		serverError(w, err)
		return
	}
	profile, err := profileByID(r.Context(), tx, canonicalID)
	if err != nil {
		serverError(w, err)
		return
	}
	if err = tx.Commit(); err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusOK, sessionForProfile(profile))
}

func mergeUserProfiles(ctx context.Context, tx *sql.Tx, sourceID, targetID string) error {
	if sourceID == targetID {
		return nil
	}
	if _, err := tx.ExecContext(ctx, `
		UPDATE profile AS target SET
			open_id = source.open_id,
			nickname = CASE WHEN target.nickname='' THEN source.nickname ELSE target.nickname END,
			avatar = CASE WHEN target.avatar='' THEN source.avatar ELSE target.avatar END,
			points = target.points + source.points,
			coupons = target.coupons + source.coupons,
			favorites = target.favorites + source.favorites,
			updated_at = NOW()
		FROM profile AS source
		WHERE target.id=$2 AND source.id=$1`, sourceID, targetID); err != nil {
		return err
	}

	statements := []string{
		`UPDATE orders SET user_id=$2 WHERE user_id=$1`,
		`UPDATE point_records SET user_id=$2 WHERE user_id=$1`,
		`UPDATE coupons SET user_id=$2 WHERE user_id=$1`,
		`UPDATE points_redemptions SET user_id=$2 WHERE user_id=$1`,
		`UPDATE game_plays SET user_id=$2 WHERE user_id=$1`,
		`DELETE FROM user_addresses AS source USING user_addresses AS target WHERE source.user_id=$1 AND target.user_id=$2`,
		`UPDATE user_addresses SET user_id=$2 WHERE user_id=$1`,
		`DELETE FROM daily_check_ins AS source USING daily_check_ins AS target WHERE source.user_id=$1 AND target.user_id=$2 AND source.check_in_date=target.check_in_date`,
		`UPDATE daily_check_ins SET user_id=$2 WHERE user_id=$1`,
		`DELETE FROM daily_task_completions AS source USING daily_task_completions AS target WHERE source.user_id=$1 AND target.user_id=$2 AND source.task_id=target.task_id AND source.completed_on=target.completed_on`,
		`UPDATE daily_task_completions SET user_id=$2 WHERE user_id=$1`,
		`DELETE FROM profile WHERE id=$1 AND id<>$2`,
	}
	for _, statement := range statements {
		if _, err := tx.ExecContext(ctx, statement, sourceID, targetID); err != nil {
			return err
		}
	}
	return nil
}

func (a *app) uploadWechatAvatar(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedUserID(r)
	if !ok {
		respond(w, http.StatusUnauthorized, map[string]string{"message": "请先登录"})
		return
	}
	if err := r.ParseMultipartForm(5 << 20); err != nil {
		badRequest(w, "头像图片不能超过 5MB")
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		badRequest(w, "头像图片不能为空")
		return
	}
	defer file.Close()
	extension := strings.ToLower(filepath.Ext(header.Filename))
	switch extension {
	case ".jpg", ".jpeg", ".png", ".webp":
	default:
		badRequest(w, "头像仅支持 jpg、png、webp 格式")
		return
	}
	if err := os.MkdirAll("uploads", 0755); err != nil {
		serverError(w, err)
		return
	}
	filename := newID("avatar") + extension
	destination, err := os.Create(filepath.Join("uploads", filename))
	if err != nil {
		serverError(w, err)
		return
	}
	defer destination.Close()
	if _, err = io.Copy(destination, io.LimitReader(file, 5<<20)); err != nil {
		serverError(w, err)
		return
	}
	avatarURL := publicImageURL(r, "http://127.0.0.1:8080/uploads/"+filename)
	if _, err = a.db.ExecContext(r.Context(), `UPDATE profile SET avatar=$1, updated_at=NOW() WHERE id=$2`, avatarURL, userID); err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusCreated, map[string]string{"url": avatarURL})
}

func wechatPhoneNumber(r *http.Request, phoneCode string) (string, error) {
	appID, secret, configured := wechatCredentials()
	if !configured {
		return "", fmt.Errorf("wechat credentials are not configured")
	}
	var tokenPayload struct {
		AccessToken string `json:"access_token"`
		ErrCode     int    `json:"errcode"`
	}
	if err := wechatGET(r, "https://api.weixin.qq.com/cgi-bin/token", url.Values{"grant_type": {"client_credential"}, "appid": {appID}, "secret": {secret}}, &tokenPayload); err != nil || tokenPayload.AccessToken == "" || tokenPayload.ErrCode != 0 {
		return "", fmt.Errorf("wechat access token unavailable")
	}
	payload, _ := json.Marshal(map[string]string{"code": strings.TrimSpace(phoneCode)})
	request, err := http.NewRequestWithContext(r.Context(), http.MethodPost, "https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token="+url.QueryEscape(tokenPayload.AccessToken), strings.NewReader(string(payload)))
	if err != nil {
		return "", err
	}
	request.Header.Set("Content-Type", "application/json")
	response, err := (&http.Client{Timeout: 8 * time.Second}).Do(request)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()
	var phonePayload struct {
		PhoneInfo struct {
			PhoneNumber string `json:"phoneNumber"`
		} `json:"phone_info"`
		ErrCode int `json:"errcode"`
	}
	if err = json.NewDecoder(io.LimitReader(response.Body, 1<<20)).Decode(&phonePayload); err != nil || phonePayload.ErrCode != 0 || phonePayload.PhoneInfo.PhoneNumber == "" {
		return "", fmt.Errorf("wechat phone number unavailable")
	}
	return phonePayload.PhoneInfo.PhoneNumber, nil
}
