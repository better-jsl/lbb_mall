package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"
)

type pointsProductInput struct {
	Category         string  `json:"category"`
	Title            string  `json:"title"`
	Description      string  `json:"description"`
	RedemptionMethod string  `json:"redemptionMethod"`
	Value            float64 `json:"value"`
	Image            string  `json:"image"`
	Emoji            string  `json:"emoji"`
	Points           int     `json:"points"`
}

func (a *app) pointsCategories(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.QueryContext(r.Context(), `SELECT id, label, emoji FROM points_categories WHERE active = TRUE ORDER BY sort_order, created_at`)
	if err != nil {
		serverError(w, err)
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var id, label, emoji string
		if err := rows.Scan(&id, &label, &emoji); err != nil {
			serverError(w, err)
			return
		}
		items = append(items, map[string]any{"id": id, "label": label, "emoji": emoji})
	}
	respond(w, http.StatusOK, items)
}

func (a *app) pointsProducts(w http.ResponseWriter, r *http.Request) {
	category := strings.TrimSpace(r.URL.Query().Get("category"))
	page := parsePageRequest(r)
	query := `SELECT id, category_id, title, description, redemption_method, value, COALESCE(image, ''), emoji, points
		FROM points_products WHERE active = TRUE AND ($1 = '' OR category_id = $1) ORDER BY sort_order, created_at`
	args := []any{category}
	if page.enabled {
		query += ` LIMIT $2 OFFSET $3`
		args = append(args, page.limit+1, page.offset)
	}
	rows, err := a.db.QueryContext(r.Context(), query, args...)
	if err != nil {
		serverError(w, err)
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	hasMore := false
	for rows.Next() {
		if page.enabled && len(items) == page.limit {
			hasMore = true
			break
		}
		var id, categoryID, title, description, method, image, emoji string
		var value float64
		var points int
		if err := rows.Scan(&id, &categoryID, &title, &description, &method, &value, &image, &emoji, &points); err != nil {
			serverError(w, err)
			return
		}
		items = append(items, map[string]any{
			"id": id, "category": categoryID, "title": title, "description": description,
			"redemptionMethod": method, "value": value, "image": publicImageURL(r, image), "emoji": emoji, "points": points,
		})
	}
	respondPage(w, page, items, hasMore)
}

func (a *app) redeemPointsProduct(w http.ResponseWriter, r *http.Request) {
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		serverError(w, err)
		return
	}
	defer tx.Rollback()

	var title, method string
	var cost, stock int
	var value float64
	err = tx.QueryRowContext(r.Context(), `SELECT title, redemption_method, value, points, stock FROM points_products WHERE id = $1 AND active = TRUE FOR UPDATE`, r.PathValue("id")).Scan(&title, &method, &value, &cost, &stock)
	if err == sql.ErrNoRows {
		notFound(w)
		return
	}
	if err != nil {
		serverError(w, err)
		return
	}
	if stock == 0 {
		respond(w, http.StatusConflict, map[string]string{"message": "商品库存不足"})
		return
	}

	var balance, coupons int
	if err = tx.QueryRowContext(r.Context(), `SELECT points, coupons FROM profile WHERE id = $1 FOR UPDATE`, requestUserID(r)).Scan(&balance, &coupons); err != nil {
		serverError(w, err)
		return
	}
	if balance < cost {
		respond(w, http.StatusConflict, map[string]string{"message": "积分不足"})
		return
	}

	addressSnapshot := "{}"
	if method == "快递邮寄" {
		var province, city, district, detail, contactName, contactPhone string
		err = tx.QueryRowContext(r.Context(), `SELECT province, city, district, detail, contact_name, contact_phone FROM user_addresses WHERE user_id = $1`, requestUserID(r)).Scan(&province, &city, &district, &detail, &contactName, &contactPhone)
		if err == sql.ErrNoRows {
			respond(w, http.StatusBadRequest, map[string]string{"message": "请先设置收货地址"})
			return
		}
		if err != nil {
			serverError(w, err)
			return
		}
		snapshot, _ := json.Marshal(map[string]any{"region": []string{province, city, district}, "detail": detail, "contactName": contactName, "contactPhone": contactPhone})
		addressSnapshot = string(snapshot)
	}

	redemptionID := newID("redemption")
	isAppVoucher := isAppVoucherMethod(method)
	if isAppVoucher {
		_, err = tx.ExecContext(r.Context(), `UPDATE profile SET points = points - $1, coupons = coupons + 1, updated_at = NOW() WHERE id = $2`, cost, requestUserID(r))
	} else {
		_, err = tx.ExecContext(r.Context(), `UPDATE profile SET points = points - $1, updated_at = NOW() WHERE id = $2`, cost, requestUserID(r))
	}
	if err != nil {
		serverError(w, err)
		return
	}
	if stock > 0 {
		if _, err = tx.ExecContext(r.Context(), `UPDATE points_products SET stock = stock - 1, updated_at = NOW() WHERE id = $1`, r.PathValue("id")); err != nil {
			serverError(w, err)
			return
		}
	}
	if _, err = tx.ExecContext(r.Context(), `INSERT INTO points_redemptions(id, user_id, product_id, points_cost, status, address_snapshot, created_at, updated_at) VALUES($1,$2,$3,$4,'pending',$5::jsonb,NOW(),NOW())`, redemptionID, requestUserID(r), r.PathValue("id"), cost, addressSnapshot); err != nil {
		serverError(w, err)
		return
	}
	if isAppVoucher {
		if _, err = tx.ExecContext(r.Context(), `INSERT INTO coupons(id, user_id, redemption_id, value, title, note, date_text, status, state, sort_order, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,'待使用','available',0,NOW(),NOW())`, newID("coupon"), requestUserID(r), redemptionID, value, title, "乐伴伴 App 内使用，填写登录手机号后即可领取", "App 抵用券"); err != nil {
			serverError(w, err)
			return
		}
	}
	if _, err = tx.ExecContext(r.Context(), `INSERT INTO point_records(id, user_id, title, occurred_at, change, created_at, updated_at) VALUES($1,$2,$3,NOW(),$4,NOW(),NOW())`, newID("point"), requestUserID(r), "积分兑换："+title, -cost); err != nil {
		serverError(w, err)
		return
	}
	if err = tx.Commit(); err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusCreated, map[string]any{"id": redemptionID, "points": balance - cost, "isAppVoucher": isAppVoucher, "couponCount": coupons + boolToInt(isAppVoucher)})
}

func isAppVoucherMethod(method string) bool {
	return strings.EqualFold(strings.TrimSpace(method), "APP抵用券")
}

func boolToInt(value bool) int {
	if value {
		return 1
	}
	return 0
}

func (a *app) claimAppVoucher(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Phone string `json:"phone"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		badRequest(w, "请输入乐伴伴 App 登录手机号")
		return
	}
	phone := strings.TrimSpace(input.Phone)
	if !regexp.MustCompile(`^1[3-9][0-9]{9}$`).MatchString(phone) {
		badRequest(w, "请输入正确的手机号")
		return
	}

	result, err := a.db.ExecContext(r.Context(), `UPDATE points_redemptions pr SET app_phone=$1, updated_at=NOW() FROM points_products pp WHERE pr.product_id=pp.id AND pr.id=$2 AND pr.user_id=$3 AND LOWER(BTRIM(pp.redemption_method))=LOWER('APP抵用券') AND COALESCE(pr.app_phone,'')=''`, phone, r.PathValue("id"), requestUserID(r))
	if err != nil {
		serverError(w, err)
		return
	}
	updated, err := result.RowsAffected()
	if err != nil {
		serverError(w, err)
		return
	}
	if updated == 0 {
		badRequest(w, "该抵用券无法重复领取")
		return
	}
	respond(w, http.StatusOK, map[string]string{"message": "领取信息已提交"})
}

func (a *app) pointsRedemptions(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.QueryContext(r.Context(), `SELECT pr.id, pp.title, pr.points_cost, pr.status, pr.created_at::text FROM points_redemptions pr JOIN points_products pp ON pp.id = pr.product_id WHERE pr.user_id = $1 ORDER BY pr.created_at DESC`, requestUserID(r))
	if err != nil {
		serverError(w, err)
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var id, title, status, createdAt string
		var points int
		if err := rows.Scan(&id, &title, &points, &status, &createdAt); err != nil {
			serverError(w, err)
			return
		}
		items = append(items, map[string]any{"id": id, "title": title, "points": points, "status": status, "createdAt": createdAt[:16]})
	}
	respond(w, http.StatusOK, items)
}

func (a *app) pointsRedemptionOrderDetail(w http.ResponseWriter, r *http.Request) {
	var id, title, method, status, createdAt, addressRaw string
	var points int
	err := a.db.QueryRowContext(r.Context(), `SELECT pr.id,pp.title,pp.redemption_method,pr.points_cost,pr.status,pr.created_at::text,COALESCE(pr.address_snapshot,'{}'::jsonb)::text FROM points_redemptions pr JOIN points_products pp ON pp.id=pr.product_id WHERE pr.id=$1 AND pr.user_id=$2`, r.PathValue("id"), requestUserID(r)).Scan(&id, &title, &method, &points, &status, &createdAt, &addressRaw)
	if err == sql.ErrNoRows {
		respond(w, http.StatusNotFound, map[string]string{"message": "order not found"})
		return
	}
	if err != nil {
		serverError(w, err)
		return
	}
	contents := []map[string]any{{"name": "兑换方式", "count": method}, {"name": "支付积分", "count": fmt.Sprintf("%d积分", points)}}
	var address map[string]any
	if json.Unmarshal([]byte(addressRaw), &address) == nil && len(address) > 0 {
		region, _ := address["region"].([]any)
		parts := []string{}
		for _, value := range region {
			parts = append(parts, fmt.Sprint(value))
		}
		contents = append(contents, map[string]any{"name": "收货地址", "count": strings.Join(parts, " ") + " " + fmt.Sprint(address["detail"])})
	}
	icon, note := statusPresentation(status)
	respond(w, http.StatusOK, map[string]any{"id": id, "title": title, "merchant": "积分商城", "price": fmt.Sprint(points), "priceText": fmt.Sprintf("%d积分", points), "status": statusText(status), "state": status, "statusIcon": icon, "statusNote": note, "canUsePoints": false, "canVerify": false, "sectionTitle": "兑换信息", "contents": contents, "orderNo": id, "createdAt": createdAt[:16]})
}

func (a *app) benefits(w http.ResponseWriter, r *http.Request) {
	items, err := querySimpleRows(a.db, `SELECT id, emoji, label, action FROM benefit_items WHERE active = TRUE ORDER BY sort_order, created_at`, 4)
	if err != nil {
		serverError(w, err)
		return
	}
	noticeRows, err := a.db.QueryContext(r.Context(), `SELECT content FROM benefit_notices WHERE active = TRUE ORDER BY sort_order, created_at`)
	if err != nil {
		serverError(w, err)
		return
	}
	defer noticeRows.Close()
	notices := []string{}
	for noticeRows.Next() {
		var content string
		if err := noticeRows.Scan(&content); err != nil {
			serverError(w, err)
			return
		}
		notices = append(notices, content)
	}
	promoRows, err := a.db.QueryContext(r.Context(), `SELECT id, image, action, dialog_title, dialog_image, primary_text, secondary_text FROM benefit_promos WHERE active = TRUE ORDER BY sort_order, created_at`)
	if err != nil {
		serverError(w, err)
		return
	}
	defer promoRows.Close()
	promos := []map[string]any{}
	var enterpriseDialog map[string]any
	for promoRows.Next() {
		var id, image, action, dialogTitle, dialogImage, primaryText, secondaryText string
		if err := promoRows.Scan(&id, &image, &action, &dialogTitle, &dialogImage, &primaryText, &secondaryText); err != nil {
			serverError(w, err)
			return
		}
		promos = append(promos, map[string]any{"id": id, "image": publicImageURL(r, image), "action": action})
		if action == "enterprise" {
			enterpriseDialog = map[string]any{"title": dialogTitle, "image": publicImageURL(r, dialogImage), "primary": primaryText, "secondary": secondaryText}
		}
	}
	respond(w, http.StatusOK, map[string]any{"items": items, "notices": notices, "promos": promos, "enterpriseDialog": enterpriseDialog})
}

func querySimpleRows(db *sql.DB, statement string, columns int) ([]map[string]any, error) {
	rows, err := db.Query(statement)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		values := make([]string, columns)
		targets := make([]any, columns)
		for index := range values {
			targets[index] = &values[index]
		}
		if err := rows.Scan(targets...); err != nil {
			return nil, err
		}
		items = append(items, map[string]any{"id": values[0], "emoji": values[1], "label": values[2], "action": values[3]})
	}
	return items, rows.Err()
}

func (a *app) dailyTasks(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.QueryContext(r.Context(), `SELECT id, emoji, title, reward, action FROM daily_tasks WHERE active = TRUE ORDER BY sort_order, created_at`)
	if err != nil {
		serverError(w, err)
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var id, emoji, title, action string
		var reward int
		if err := rows.Scan(&id, &emoji, &title, &reward, &action); err != nil {
			serverError(w, err)
			return
		}
		var completed bool
		if id == "check-in" {
			err = a.db.QueryRowContext(r.Context(), `SELECT EXISTS(SELECT 1 FROM daily_check_ins WHERE user_id = $1 AND check_in_date = CURRENT_DATE)`, requestUserID(r)).Scan(&completed)
		} else {
			err = a.db.QueryRowContext(r.Context(), `SELECT EXISTS(SELECT 1 FROM daily_task_completions WHERE user_id = $1 AND task_id = $2 AND completed_on = CURRENT_DATE)`, requestUserID(r), id).Scan(&completed)
		}
		if err != nil {
			serverError(w, err)
			return
		}
		items = append(items, map[string]any{"id": id, "emoji": emoji, "title": title, "reward": reward, "action": action, "completed": completed})
	}
	respond(w, http.StatusOK, items)
}

func (a *app) completeDailyTask(w http.ResponseWriter, r *http.Request) {
	if r.PathValue("id") == "check-in" {
		respond(w, http.StatusBadRequest, map[string]string{"message": "请使用签到接口"})
		return
	}
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		serverError(w, err)
		return
	}
	defer tx.Rollback()
	var title string
	var reward int
	err = tx.QueryRowContext(r.Context(), `SELECT title, reward FROM daily_tasks WHERE id = $1 AND active = TRUE`, r.PathValue("id")).Scan(&title, &reward)
	if err == sql.ErrNoRows {
		notFound(w)
		return
	}
	if err != nil {
		serverError(w, err)
		return
	}
	completionID := newID("task")
	var insertedID string
	err = tx.QueryRowContext(r.Context(), `INSERT INTO daily_task_completions(id,user_id,task_id,completed_on,points,created_at,updated_at) VALUES($1,$2,$3,CURRENT_DATE,$4,NOW(),NOW()) ON CONFLICT(user_id,task_id,completed_on) DO NOTHING RETURNING id`, completionID, requestUserID(r), r.PathValue("id"), reward).Scan(&insertedID)
	if err != nil && err != sql.ErrNoRows {
		serverError(w, err)
		return
	}
	awarded := err != sql.ErrNoRows
	if awarded {
		if _, err = tx.ExecContext(r.Context(), `UPDATE profile SET points = points + $1, updated_at = NOW() WHERE id = $2`, reward, requestUserID(r)); err != nil {
			serverError(w, err)
			return
		}
		if _, err = tx.ExecContext(r.Context(), `INSERT INTO point_records(id,user_id,title,occurred_at,change,created_at,updated_at) VALUES($1,$2,$3,NOW(),$4,NOW(),NOW())`, newID("point"), requestUserID(r), title, reward); err != nil {
			serverError(w, err)
			return
		}
	}
	var points int
	if err = tx.QueryRowContext(r.Context(), `SELECT points FROM profile WHERE id = $1`, requestUserID(r)).Scan(&points); err != nil {
		serverError(w, err)
		return
	}
	if err = tx.Commit(); err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusOK, map[string]any{"completed": true, "awarded": awarded, "reward": reward, "points": points})
}

func (a *app) games(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.QueryContext(r.Context(), `SELECT g.id,g.emoji,g.title,g.rule,g.description,g.points,g.daily_limit,g.team_size,g.tone,
		(SELECT COUNT(*) FROM game_plays gp WHERE gp.game_id=g.id AND gp.user_id=$1 AND gp.played_on=CURRENT_DATE)
		FROM games g WHERE g.active=TRUE ORDER BY g.sort_order,g.created_at`, requestUserID(r))
	if err != nil {
		serverError(w, err)
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var id, emoji, title, rule, description, tone string
		var points, dailyLimit, teamSize, played int
		if err := rows.Scan(&id, &emoji, &title, &rule, &description, &points, &dailyLimit, &teamSize, &tone, &played); err != nil {
			serverError(w, err)
			return
		}
		teamLimit := "无需组队"
		if teamSize > 1 {
			teamLimit = fmt.Sprintf("需 %d 人组队", teamSize)
		}
		items = append(items, map[string]any{"id": id, "emoji": emoji, "title": title, "rule": rule, "description": description, "points": fmt.Sprint(points), "playLimit": fmt.Sprintf("每天可玩 %d 次", dailyLimit), "teamLimit": teamLimit, "tone": tone, "remaining": max(0, dailyLimit-played)})
	}
	respond(w, http.StatusOK, items)
}

func (a *app) playGame(w http.ResponseWriter, r *http.Request) {
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		serverError(w, err)
		return
	}
	defer tx.Rollback()
	var title string
	var reward, dailyLimit, teamSize int
	err = tx.QueryRowContext(r.Context(), `SELECT title,points,daily_limit,team_size FROM games WHERE id=$1 AND active=TRUE FOR UPDATE`, r.PathValue("id")).Scan(&title, &reward, &dailyLimit, &teamSize)
	if err == sql.ErrNoRows {
		notFound(w)
		return
	}
	if err != nil {
		serverError(w, err)
		return
	}
	if teamSize > 1 {
		respond(w, http.StatusConflict, map[string]string{"message": "该游戏需要先完成组队"})
		return
	}
	var played int
	if err = tx.QueryRowContext(r.Context(), `SELECT COUNT(*) FROM game_plays WHERE user_id=$1 AND game_id=$2 AND played_on=CURRENT_DATE`, requestUserID(r), r.PathValue("id")).Scan(&played); err != nil {
		serverError(w, err)
		return
	}
	if played >= dailyLimit {
		respond(w, http.StatusConflict, map[string]string{"message": "今日游戏次数已用完"})
		return
	}
	playID := newID("game-play")
	if _, err = tx.ExecContext(r.Context(), `INSERT INTO game_plays(id,user_id,game_id,played_on,points,created_at,updated_at) VALUES($1,$2,$3,CURRENT_DATE,$4,NOW(),NOW())`, playID, requestUserID(r), r.PathValue("id"), reward); err != nil {
		serverError(w, err)
		return
	}
	if _, err = tx.ExecContext(r.Context(), `UPDATE profile SET points=points+$1,updated_at=NOW() WHERE id=$2`, reward, requestUserID(r)); err != nil {
		serverError(w, err)
		return
	}
	if _, err = tx.ExecContext(r.Context(), `INSERT INTO point_records(id,user_id,title,occurred_at,change,created_at,updated_at) VALUES($1,$2,$3,NOW(),$4,NOW(),NOW())`, newID("point"), requestUserID(r), "游戏奖励："+title, reward); err != nil {
		serverError(w, err)
		return
	}
	var points int
	if err = tx.QueryRowContext(r.Context(), `SELECT points FROM profile WHERE id=$1`, requestUserID(r)).Scan(&points); err != nil {
		serverError(w, err)
		return
	}
	if err = tx.Commit(); err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusCreated, map[string]any{"reward": reward, "points": points, "remaining": dailyLimit - played - 1})
}

func (a *app) adminPointsCatalog(w http.ResponseWriter, r *http.Request) {
	categoryRows, err := a.db.QueryContext(r.Context(), `SELECT id,label,emoji,COALESCE(image,'') FROM points_categories ORDER BY sort_order,created_at`)
	if err != nil {
		serverError(w, err)
		return
	}
	defer categoryRows.Close()
	categories := []map[string]any{}
	for categoryRows.Next() {
		var id, label, emoji, image string
		if err := categoryRows.Scan(&id, &label, &emoji, &image); err != nil {
			serverError(w, err)
			return
		}
		categories = append(categories, map[string]any{"id": id, "label": label, "emoji": emoji, "image": image})
	}
	productRows, err := a.db.QueryContext(r.Context(), `SELECT id,category_id,title,description,redemption_method,value,COALESCE(image,''),emoji,points FROM points_products ORDER BY category_id,sort_order,created_at`)
	if err != nil {
		serverError(w, err)
		return
	}
	defer productRows.Close()
	products := []map[string]any{}
	for productRows.Next() {
		var id, category, title, description, method, image, emoji string
		var value float64
		var points int
		if err := productRows.Scan(&id, &category, &title, &description, &method, &value, &image, &emoji, &points); err != nil {
			serverError(w, err)
			return
		}
		products = append(products, map[string]any{"id": id, "category": category, "title": title, "description": description, "redemptionMethod": method, "value": value, "image": image, "emoji": emoji, "points": points})
	}
	respond(w, http.StatusOK, map[string]any{"categories": categories, "items": products})
}

func (a *app) adminGames(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.QueryContext(r.Context(), `SELECT id,COALESCE(image,''),title,description,COALESCE(link,''),active FROM games ORDER BY sort_order,created_at`)
	if err != nil {
		serverError(w, err)
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var id, image, title, description, link string
		var active bool
		if err := rows.Scan(&id, &image, &title, &description, &link, &active); err != nil {
			serverError(w, err)
			return
		}
		items = append(items, map[string]any{"id": id, "image": image, "title": title, "description": description, "link": link, "active": active})
	}
	respond(w, http.StatusOK, items)
}

func (a *app) updateAdminGame(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Image       *string `json:"image"`
		Title       *string `json:"title"`
		Description *string `json:"description"`
		Link        *string `json:"link"`
		Active      *bool   `json:"active"`
	}
	if !readJSON(w, r, &input) {
		return
	}
	if input.Active == nil {
		badRequest(w, "请提供游戏开启状态")
		return
	}
	if input.Title == nil {
		a.updateAdminGameActive(w, r, *input.Active)
		return
	}
	title := strings.TrimSpace(*input.Title)
	if title == "" {
		badRequest(w, "游戏标题不能为空")
		return
	}
	result, err := a.db.ExecContext(r.Context(), `UPDATE games SET image=$1,title=$2,description=$3,link=$4,active=$5,updated_at=NOW() WHERE id=$6`, valueOrEmpty(input.Image), title, valueOrEmpty(input.Description), valueOrEmpty(input.Link), *input.Active, r.PathValue("id"))
	if err != nil {
		serverError(w, err)
		return
	}
	changed, err := result.RowsAffected()
	if err != nil {
		serverError(w, err)
		return
	}
	if changed == 0 {
		notFound(w)
		return
	}
	respond(w, http.StatusOK, map[string]bool{"ok": true})
}

func (a *app) createAdminGame(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Image       string `json:"image"`
		Title       string `json:"title"`
		Description string `json:"description"`
		Link        string `json:"link"`
		Active      bool   `json:"active"`
	}
	if !readJSON(w, r, &input) {
		return
	}
	input.Title = strings.TrimSpace(input.Title)
	if input.Title == "" {
		badRequest(w, "游戏标题不能为空")
		return
	}
	var sortOrder int
	if err := a.db.QueryRowContext(r.Context(), `SELECT COALESCE(MAX(sort_order),0)+1 FROM games`).Scan(&sortOrder); err != nil {
		serverError(w, err)
		return
	}
	id := newID("game")
	if _, err := a.db.ExecContext(r.Context(), `INSERT INTO games(id,emoji,image,title,rule,description,link,points,daily_limit,team_size,tone,sort_order,active,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW(),NOW())`, id, "🎮", input.Image, input.Title, "", input.Description, input.Link, 0, 1, 1, "blue", sortOrder, input.Active); err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusCreated, map[string]string{"id": id})
}

func (a *app) updateAdminGameActive(w http.ResponseWriter, r *http.Request, active bool) {
	result, err := a.db.ExecContext(r.Context(), `UPDATE games SET active=$1,updated_at=NOW() WHERE id=$2`, active, r.PathValue("id"))
	if err != nil {
		serverError(w, err)
		return
	}
	changed, err := result.RowsAffected()
	if err != nil {
		serverError(w, err)
		return
	}
	if changed == 0 {
		notFound(w)
		return
	}
	respond(w, http.StatusOK, map[string]bool{"ok": true})
}

func valueOrEmpty(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}

func (a *app) createAdminPointsCategory(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Label string `json:"label"`
		Emoji string `json:"emoji"`
		Image string `json:"image"`
	}
	if !readJSON(w, r, &input) {
		return
	}
	input.Label = strings.TrimSpace(input.Label)
	if input.Label == "" {
		badRequest(w, "分类名称不能为空")
		return
	}
	var sortOrder int
	if err := a.db.QueryRowContext(r.Context(), `SELECT COALESCE(MAX(sort_order),0)+1 FROM points_categories`).Scan(&sortOrder); err != nil {
		serverError(w, err)
		return
	}
	id := newID("points-category")
	if _, err := a.db.ExecContext(r.Context(), `INSERT INTO points_categories(id,label,emoji,image,sort_order,active,created_at,updated_at) VALUES($1,$2,$3,$4,$5,TRUE,NOW(),NOW())`, id, input.Label, input.Emoji, input.Image, sortOrder); err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusCreated, map[string]string{"id": id})
}

func (a *app) updateAdminPointsCategory(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Label string `json:"label"`
		Emoji string `json:"emoji"`
		Image string `json:"image"`
	}
	if !readJSON(w, r, &input) {
		return
	}
	input.Label = strings.TrimSpace(input.Label)
	if input.Label == "" {
		badRequest(w, "分类名称不能为空")
		return
	}
	result, err := a.db.ExecContext(r.Context(), `UPDATE points_categories SET label=$1,emoji=$2,image=$3,updated_at=NOW() WHERE id=$4`, input.Label, input.Emoji, input.Image, r.PathValue("id"))
	if err != nil {
		serverError(w, err)
		return
	}
	changed, err := result.RowsAffected()
	if err != nil {
		serverError(w, err)
		return
	}
	if changed == 0 {
		notFound(w)
		return
	}
	respond(w, http.StatusOK, map[string]bool{"ok": true})
}

func (a *app) createAdminPointsProduct(w http.ResponseWriter, r *http.Request) {
	var input pointsProductInput
	if !readJSON(w, r, &input) || !validPointsProduct(w, input) {
		return
	}
	var sortOrder int
	if err := a.db.QueryRowContext(r.Context(), `SELECT COALESCE(MAX(sort_order),0)+1 FROM points_products WHERE category_id=$1`, input.Category).Scan(&sortOrder); err != nil {
		serverError(w, err)
		return
	}
	id := newID("points-product")
	if err := a.savePointsProduct(r, id, input, sortOrder, true); err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusCreated, map[string]string{"id": id})
}

func (a *app) updateAdminPointsProduct(w http.ResponseWriter, r *http.Request) {
	var input pointsProductInput
	if !readJSON(w, r, &input) || !validPointsProduct(w, input) {
		return
	}
	var sortOrder int
	if err := a.db.QueryRowContext(r.Context(), `SELECT sort_order FROM points_products WHERE id=$1`, r.PathValue("id")).Scan(&sortOrder); err != nil {
		if err == sql.ErrNoRows {
			notFound(w)
		} else {
			serverError(w, err)
		}
		return
	}
	if err := a.savePointsProduct(r, r.PathValue("id"), input, sortOrder, false); err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusOK, map[string]bool{"ok": true})
}

func validPointsProduct(w http.ResponseWriter, input pointsProductInput) bool {
	if strings.TrimSpace(input.Category) == "" || strings.TrimSpace(input.Title) == "" || input.Points < 0 || input.Value < 0 {
		badRequest(w, "请完整填写兑换商品信息")
		return false
	}
	return true
}

func (a *app) savePointsProduct(r *http.Request, id string, input pointsProductInput, sortOrder int, creating bool) error {
	if creating {
		_, err := a.db.ExecContext(r.Context(), `INSERT INTO points_products(id,category_id,title,description,redemption_method,value,image,emoji,points,stock,active,sort_order,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,-1,TRUE,$10,NOW(),NOW())`, id, input.Category, input.Title, input.Description, input.RedemptionMethod, input.Value, input.Image, input.Emoji, input.Points, sortOrder)
		return err
	}
	_, err := a.db.ExecContext(r.Context(), `UPDATE points_products SET category_id=$1,title=$2,description=$3,redemption_method=$4,value=$5,image=$6,emoji=$7,points=$8,updated_at=NOW() WHERE id=$9`, input.Category, input.Title, input.Description, input.RedemptionMethod, input.Value, input.Image, input.Emoji, input.Points, id)
	return err
}

func (a *app) deleteAdminPointsProduct(w http.ResponseWriter, r *http.Request) {
	result, err := a.db.ExecContext(r.Context(), `DELETE FROM points_products WHERE id=$1`, r.PathValue("id"))
	if err != nil {
		serverError(w, err)
		return
	}
	if affected(result) == 0 {
		notFound(w)
		return
	}
	respond(w, http.StatusOK, map[string]bool{"ok": true})
}

func (a *app) adminDashboard(w http.ResponseWriter, r *http.Request) {
	var packageIncome, redemptionValue float64
	if err := a.db.QueryRowContext(r.Context(), `SELECT COALESCE(SUM(p.price),0) FROM orders o JOIN packages p ON p.id=o.package_id WHERE o.status IN ('pending','verified')`).Scan(&packageIncome); err != nil {
		serverError(w, err)
		return
	}
	if err := a.db.QueryRowContext(r.Context(), `SELECT COALESCE(SUM(pp.value),0) FROM points_redemptions pr JOIN points_products pp ON pp.id=pr.product_id`).Scan(&redemptionValue); err != nil {
		serverError(w, err)
		return
	}
	incomeSources := []map[string]any{{"label": "套餐销售", "value": packageIncome}, {"label": "积分兑换", "value": redemptionValue}, {"label": "活动服务", "value": 0}}
	trendRows, err := a.db.QueryContext(r.Context(), `SELECT TO_CHAR(month,'FMMM月'), COALESCE(SUM(p.price),0) FROM generate_series(date_trunc('month',CURRENT_DATE)-INTERVAL '5 months',date_trunc('month',CURRENT_DATE),INTERVAL '1 month') month LEFT JOIN orders o ON date_trunc('month',o.created_at)=month AND o.status IN ('pending','verified') LEFT JOIN packages p ON p.id=o.package_id GROUP BY month ORDER BY month`)
	if err != nil {
		serverError(w, err)
		return
	}
	defer trendRows.Close()
	incomeTrend := []map[string]any{}
	for trendRows.Next() {
		var label string
		var value float64
		if err := trendRows.Scan(&label, &value); err != nil {
			serverError(w, err)
			return
		}
		incomeTrend = append(incomeTrend, map[string]any{"label": label, "value": value})
	}
	merchantRows, err := a.db.QueryContext(r.Context(), `SELECT m.name,COALESCE(SUM(p.price),0) FROM merchants m LEFT JOIN packages p ON p.merchant_id=m.id LEFT JOIN orders o ON o.package_id=p.id AND o.status IN ('pending','verified') GROUP BY m.id,m.name ORDER BY COALESCE(SUM(p.price),0) DESC`)
	if err != nil {
		serverError(w, err)
		return
	}
	defer merchantRows.Close()
	merchantIncome := []map[string]any{}
	for merchantRows.Next() {
		var label string
		var value float64
		if err := merchantRows.Scan(&label, &value); err != nil {
			serverError(w, err)
			return
		}
		merchantIncome = append(merchantIncome, map[string]any{"label": label, "value": value})
	}
	respond(w, http.StatusOK, map[string]any{"incomeSources": incomeSources, "incomeTrend": incomeTrend, "merchantIncome": merchantIncome})
}
