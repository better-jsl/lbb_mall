package main

import (
	"database/sql"
	"embed"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

//go:embed migrations/*.sql
var migrationFS embed.FS

type app struct{ db *sql.DB }

type pageRequest struct {
	enabled bool
	limit   int
	offset  int
}

func parsePageRequest(r *http.Request) pageRequest {
	pageValue := r.URL.Query().Get("page")
	if pageValue == "" {
		return pageRequest{}
	}
	page, err := strconv.Atoi(pageValue)
	if err != nil || page < 1 {
		page = 1
	}
	limit, err := strconv.Atoi(r.URL.Query().Get("pageSize"))
	if err != nil || limit < 1 {
		limit = 10
	}
	if limit > 30 {
		limit = 30
	}
	return pageRequest{enabled: true, limit: limit, offset: (page - 1) * limit}
}

func respondPage(w http.ResponseWriter, page pageRequest, items []map[string]any, hasMore bool) {
	if page.enabled {
		respond(w, http.StatusOK, map[string]any{"items": items, "hasMore": hasMore})
		return
	}
	respond(w, http.StatusOK, items)
}

func main() {
	dbURL := databaseURL()
	orm, err := gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}
	db, err := orm.DB()
	if err != nil {
		log.Fatal(err)
	}
	if err := db.Ping(); err != nil {
		log.Fatalf("connect PostgreSQL: %v", err)
	}
	if err := migrate(orm); err != nil {
		log.Fatalf("migrate PostgreSQL: %v", err)
	}

	api := &app{db: db}
	server := &http.Server{Addr: ":" + env("PORT", "8080"), Handler: api.routes(), ReadHeaderTimeout: 5 * time.Second}
	log.Printf("API listening on http://127.0.0.1%s", server.Addr)
	log.Fatal(server.ListenAndServe())
}

func (a *app) routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", a.health)
	mux.HandleFunc("GET /api/v1/merchants", a.merchants)
	mux.HandleFunc("GET /api/v1/merchants/{id}/packages", a.merchantPackages)
	mux.HandleFunc("GET /api/v1/packages/{id}", a.packageDetail)
	mux.HandleFunc("GET /api/v1/orders", a.orders)
	mux.HandleFunc("GET /api/v1/orders/{id}", a.orderDetail)
	mux.HandleFunc("POST /api/v1/orders", a.createOrder)
	mux.HandleFunc("POST /api/v1/orders/verify", a.verifyOrder)
	mux.HandleFunc("GET /api/v1/me/summary", a.summary)
	mux.HandleFunc("GET /api/v1/me/daily-check-in", a.dailyCheckInStatus)
	mux.HandleFunc("POST /api/v1/me/daily-check-in", a.dailyCheckIn)
	mux.HandleFunc("GET /api/v1/me/address", a.address)
	mux.HandleFunc("PUT /api/v1/me/address", a.saveAddress)
	mux.HandleFunc("GET /api/v1/points/leaderboard", a.pointsLeaderboard)
	mux.HandleFunc("GET /api/v1/points/records", a.pointRecords)
	mux.HandleFunc("GET /api/v1/points/categories", a.pointsCategories)
	mux.HandleFunc("GET /api/v1/points/products", a.pointsProducts)
	mux.HandleFunc("POST /api/v1/points/products/{id}/redeem", a.redeemPointsProduct)
	mux.HandleFunc("GET /api/v1/points/redemptions", a.pointsRedemptions)
	mux.HandleFunc("GET /api/v1/benefits", a.benefits)
	mux.HandleFunc("GET /api/v1/daily-tasks", a.dailyTasks)
	mux.HandleFunc("POST /api/v1/daily-tasks/{id}/complete", a.completeDailyTask)
	mux.HandleFunc("GET /api/v1/games", a.games)
	mux.HandleFunc("POST /api/v1/games/{id}/play", a.playGame)
	mux.HandleFunc("GET /api/v1/coupons", a.coupons)
	mux.HandleFunc("GET /api/v1/admin/merchants", a.adminMerchants)
	mux.HandleFunc("POST /api/v1/admin/merchants", a.createAdminMerchant)
	mux.HandleFunc("PATCH /api/v1/admin/merchants/reorder", a.reorderAdminMerchants)
	mux.HandleFunc("PATCH /api/v1/admin/merchants/{id}", a.updateAdminMerchant)
	mux.HandleFunc("DELETE /api/v1/admin/merchants/{id}", a.deleteAdminMerchant)
	mux.HandleFunc("POST /api/v1/admin/packages", a.createAdminPackage)
	mux.HandleFunc("PATCH /api/v1/admin/packages/reorder", a.reorderAdminPackages)
	mux.HandleFunc("PATCH /api/v1/admin/packages/{id}", a.updateAdminPackage)
	mux.HandleFunc("DELETE /api/v1/admin/packages/{id}", a.deleteAdminPackage)
	mux.HandleFunc("GET /api/v1/admin/users", a.adminUsers)
	mux.HandleFunc("GET /api/v1/admin/orders", a.adminOrders)
	mux.HandleFunc("GET /api/v1/admin/orders/{id}", a.adminOrderDetail)
	mux.HandleFunc("POST /api/v1/admin/uploads", a.uploadAdminImage)
	mux.HandleFunc("GET /api/v1/admin/points/catalog", a.adminPointsCatalog)
	mux.HandleFunc("POST /api/v1/admin/points/categories", a.createAdminPointsCategory)
	mux.HandleFunc("PATCH /api/v1/admin/points/categories/{id}", a.updateAdminPointsCategory)
	mux.HandleFunc("POST /api/v1/admin/points/products", a.createAdminPointsProduct)
	mux.HandleFunc("PATCH /api/v1/admin/points/products/{id}", a.updateAdminPointsProduct)
	mux.HandleFunc("DELETE /api/v1/admin/points/products/{id}", a.deleteAdminPointsProduct)
	mux.HandleFunc("GET /api/v1/admin/games", a.adminGames)
	mux.HandleFunc("POST /api/v1/admin/games", a.createAdminGame)
	mux.HandleFunc("PATCH /api/v1/admin/games/{id}", a.updateAdminGame)
	mux.HandleFunc("GET /api/v1/admin/dashboard", a.adminDashboard)
	mux.Handle("GET /uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir("uploads"))))
	return cors(mux)
}

func (a *app) health(w http.ResponseWriter, _ *http.Request) {
	respond(w, http.StatusOK, map[string]bool{"ok": true})
}

func (a *app) merchants(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.QueryContext(r.Context(), `SELECT id, name, pinyin, distance_km FROM merchants ORDER BY sort_order`)
	if err != nil {
		serverError(w, err)
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, name, pinyin string
		var distance float64
		if err := rows.Scan(&id, &name, &pinyin, &distance); err != nil {
			serverError(w, err)
			return
		}
		out = append(out, map[string]any{"id": id, "name": name, "pinyin": pinyin, "distance": fmt.Sprintf("%.1f", distance)})
	}
	respond(w, http.StatusOK, out)
}

func (a *app) merchantPackages(w http.ResponseWriter, r *http.Request) {
	a.packages(w, r, r.PathValue("id"))
}

func (a *app) packages(w http.ResponseWriter, r *http.Request, merchantID string) {
	page := parsePageRequest(r)
	query := `SELECT id, title, price::text, points::text, tag, gifts, tone, COALESCE(cover_image, '') FROM packages WHERE merchant_id = $1 ORDER BY sort_order`
	args := []any{merchantID}
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
	out := []map[string]any{}
	hasMore := false
	for rows.Next() {
		if page.enabled && len(out) == page.limit {
			hasMore = true
			break
		}
		var id, title, price, points, tag, giftsRaw, tone, coverImage string
		if err := rows.Scan(&id, &title, &price, &points, &tag, &giftsRaw, &tone, &coverImage); err != nil {
			serverError(w, err)
			return
		}
		var gifts []string
		_ = json.Unmarshal([]byte(giftsRaw), &gifts)
		coverImage = publicImageURL(r, coverImage)
		out = append(out, map[string]any{"id": id, "title": title, "price": price, "points": points, "tag": tag, "gifts": gifts, "tone": tone, "coverImage": coverImage})
	}
	respondPage(w, page, out, hasMore)
}

func (a *app) packageDetail(w http.ResponseWriter, r *http.Request) {
	var title, price, points, contentsRaw, noticesRaw, coverImage, imagesRaw string
	err := a.db.QueryRowContext(r.Context(), `SELECT title, price::text, points::text, contents, notices, COALESCE(cover_image, ''), COALESCE(package_images, '[]'::jsonb)::text FROM packages WHERE id = $1`, r.PathValue("id")).Scan(&title, &price, &points, &contentsRaw, &noticesRaw, &coverImage, &imagesRaw)
	if err == sql.ErrNoRows {
		respond(w, http.StatusNotFound, map[string]string{"message": "package not found"})
		return
	}
	if err != nil {
		serverError(w, err)
		return
	}
	var contents, notices any
	var images []string
	_ = json.Unmarshal([]byte(contentsRaw), &contents)
	_ = json.Unmarshal([]byte(noticesRaw), &notices)
	_ = json.Unmarshal([]byte(imagesRaw), &images)
	coverImage = publicImageURL(r, coverImage)
	for index, image := range images {
		images[index] = publicImageURL(r, image)
	}
	respond(w, http.StatusOK, map[string]any{"id": r.PathValue("id"), "title": title, "price": price, "points": points, "contents": contents, "notices": notices, "coverImage": coverImage, "images": images})
}

func (a *app) orders(w http.ResponseWriter, r *http.Request) {
	state := r.URL.Query().Get("status")
	page := parsePageRequest(r)
	query := `SELECT id,title,merchant,price,status,is_redemption,image FROM (
		SELECT o.id,p.title,m.name AS merchant,p.price::text AS price,o.status,FALSE AS is_redemption,COALESCE(p.cover_image,'') AS image,o.created_at FROM orders o JOIN packages p ON p.id=o.package_id JOIN merchants m ON m.id=p.merchant_id WHERE o.user_id=$1
		UNION ALL
		SELECT pr.id,pp.title,'积分商城' AS merchant,pr.points_cost::text AS price,pr.status,TRUE AS is_redemption,COALESCE(pp.image,'') AS image,pr.created_at FROM points_redemptions pr JOIN points_products pp ON pp.id=pr.product_id WHERE pr.user_id=$1
	) records WHERE ($2='' OR status=$2) ORDER BY created_at DESC`
	args := []any{currentUserID, state}
	if page.enabled {
		query += ` LIMIT $3 OFFSET $4`
		args = append(args, page.limit+1, page.offset)
	}
	rows, err := a.db.QueryContext(r.Context(), query, args...)
	if err != nil {
		serverError(w, err)
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	hasMore := false
	for rows.Next() {
		if page.enabled && len(out) == page.limit {
			hasMore = true
			break
		}
		var id, title, merchant, price, status, image string
		var isRedemption bool
		if err := rows.Scan(&id, &title, &merchant, &price, &status, &isRedemption, &image); err != nil {
			serverError(w, err)
			return
		}
		priceText := "¥" + price
		if isRedemption {
			priceText = price + "积分"
		}
		out = append(out, map[string]any{"id": id, "title": title, "merchant": merchant, "price": price, "priceText": priceText, "image": publicImageURL(r, image), "state": status, "status": statusText(status)})
	}
	respondPage(w, page, out, hasMore)
}

func (a *app) orderDetail(w http.ResponseWriter, r *http.Request) {
	var id, title, merchant, price, status, orderNo, contentsRaw, createdAt string
	err := a.db.QueryRowContext(r.Context(), `SELECT o.id,p.title,m.name,p.price::text,o.status,o.order_no,p.contents,o.created_at::text FROM orders o JOIN packages p ON p.id=o.package_id JOIN merchants m ON m.id=p.merchant_id WHERE o.id=$1 AND o.user_id=$2`, r.PathValue("id"), currentUserID).Scan(&id, &title, &merchant, &price, &status, &orderNo, &contentsRaw, &createdAt)
	if err == sql.ErrNoRows {
		a.pointsRedemptionOrderDetail(w, r)
		return
	}
	if err != nil {
		serverError(w, err)
		return
	}
	var contents []map[string]any
	_ = json.Unmarshal([]byte(contentsRaw), &contents)
	var points string
	_ = a.db.QueryRowContext(r.Context(), `SELECT points::text FROM packages p JOIN orders o ON o.package_id=p.id WHERE o.id=$1`, id).Scan(&points)
	contents = append(contents, map[string]any{"name": "赠送积分", "count": points, "isPoints": true})
	icon, note := statusPresentation(status)
	respond(w, http.StatusOK, map[string]any{"id": id, "title": title, "merchant": merchant, "price": price, "priceText": "¥" + price, "status": statusText(status), "state": status, "statusIcon": icon, "statusNote": note, "canUsePoints": status == "verified", "canVerify": status == "pending", "sectionTitle": "套餐信息", "contents": contents, "orderNo": orderNo, "createdAt": createdAt[:16]})
}

func (a *app) createOrder(w http.ResponseWriter, r *http.Request) {
	var body struct {
		PackageID string `json:"packageId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.PackageID == "" {
		respond(w, http.StatusBadRequest, map[string]string{"message": "packageId is required"})
		return
	}
	id := fmt.Sprintf("order-%d", time.Now().UnixNano())
	orderNo := fmt.Sprintf("LBB%d", time.Now().Unix())
	if _, err := a.db.ExecContext(r.Context(), `INSERT INTO orders(id,package_id,user_id,order_no,status) VALUES($1,$2,$3,$4,'pending')`, id, body.PackageID, currentUserID, orderNo); err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusCreated, map[string]string{"id": id})
}

func (a *app) verifyOrder(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Code    string `json:"code"`
		OrderID string `json:"orderId"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	var id string
	err := a.db.QueryRowContext(r.Context(), `SELECT id FROM orders WHERE status='pending' AND user_id=$2 AND ($1 = '' OR id = $1) ORDER BY created_at LIMIT 1`, body.OrderID, currentUserID).Scan(&id)
	if err == sql.ErrNoRows {
		respond(w, http.StatusNotFound, map[string]string{"message": "no pending order"})
		return
	}
	if err != nil {
		serverError(w, err)
		return
	}
	if _, err = a.db.ExecContext(r.Context(), `UPDATE orders SET status='verified', verified_at=NOW() WHERE id=$1`, id); err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusOK, map[string]string{"id": id, "code": body.Code})
}

func (a *app) summary(w http.ResponseWriter, r *http.Request) {
	var nickname, avatar, phone string
	var points, coupons, favorites int
	err := a.db.QueryRowContext(r.Context(), `SELECT nickname,avatar,phone,points,coupons,favorites FROM profile WHERE id=$1`, currentUserID).Scan(&nickname, &avatar, &phone, &points, &coupons, &favorites)
	if err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusOK, map[string]any{"profile": map[string]string{"nickname": nickname, "avatar": avatar, "phone": phone}, "stats": []map[string]any{{"label": "积分", "value": fmt.Sprint(points)}, {"label": "优惠券", "value": fmt.Sprint(coupons)}, {"label": "收藏", "value": fmt.Sprint(favorites)}}})
}

func (a *app) dailyCheckInStatus(w http.ResponseWriter, r *http.Request) {
	var checkedIn bool
	var points int
	err := a.db.QueryRowContext(r.Context(), `
		SELECT EXISTS(SELECT 1 FROM daily_check_ins WHERE user_id = $1 AND check_in_date = CURRENT_DATE), points
		FROM profile
		WHERE id = $1`, "demo-user").Scan(&checkedIn, &points)
	if err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusOK, map[string]any{"checkedIn": checkedIn, "points": points})
}

func (a *app) dailyCheckIn(w http.ResponseWriter, r *http.Request) {
	const reward = 10
	const userID = "demo-user"

	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		serverError(w, err)
		return
	}
	defer tx.Rollback()

	checkInID := fmt.Sprintf("daily-check-in-%d", time.Now().UnixNano())
	var insertedID string
	err = tx.QueryRowContext(r.Context(), `
		INSERT INTO daily_check_ins(id, user_id, check_in_date, points, created_at, updated_at)
		VALUES ($1, $2, CURRENT_DATE, $3, NOW(), NOW())
		ON CONFLICT (user_id, check_in_date) DO NOTHING
		RETURNING id`, checkInID, userID, reward).Scan(&insertedID)
	if err != nil && err != sql.ErrNoRows {
		serverError(w, err)
		return
	}

	awarded := err != sql.ErrNoRows
	if awarded {
		if _, err = tx.ExecContext(r.Context(), `UPDATE profile SET points = points + $1, updated_at = NOW() WHERE id = $2`, reward, userID); err != nil {
			serverError(w, err)
			return
		}
		if _, err = tx.ExecContext(r.Context(), `INSERT INTO point_records(id, user_id, title, occurred_at, change, created_at, updated_at) VALUES ($1, $2, $3, NOW(), $4, NOW(), NOW())`, checkInID, userID, "每日签到", reward); err != nil {
			serverError(w, err)
			return
		}
	}

	var points int
	if err = tx.QueryRowContext(r.Context(), `SELECT points FROM profile WHERE id = $1`, userID).Scan(&points); err != nil {
		serverError(w, err)
		return
	}
	if err = tx.Commit(); err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusOK, map[string]any{"checkedIn": true, "awarded": awarded, "reward": reward, "points": points})
}

type addressPayload struct {
	Region       []string `json:"region"`
	Detail       string   `json:"detail"`
	ContactName  string   `json:"contactName"`
	ContactPhone string   `json:"contactPhone"`
}

func (a *app) address(w http.ResponseWriter, r *http.Request) {
	var address addressPayload
	var province, city, district string
	err := a.db.QueryRowContext(r.Context(), `
		SELECT province, city, district, detail, contact_name, contact_phone
		FROM user_addresses
		WHERE user_id = $1`, "demo-user").Scan(
		&province, &city, &district, &address.Detail, &address.ContactName, &address.ContactPhone,
	)
	if err == sql.ErrNoRows {
		respond(w, http.StatusOK, nil)
		return
	}
	if err != nil {
		serverError(w, err)
		return
	}
	address.Region = []string{province, city, district}
	respond(w, http.StatusOK, address)
}

func (a *app) saveAddress(w http.ResponseWriter, r *http.Request) {
	var input addressPayload
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		badRequest(w, "invalid address payload")
		return
	}
	for index, value := range input.Region {
		input.Region[index] = strings.TrimSpace(value)
	}
	input.Detail = strings.TrimSpace(input.Detail)
	input.ContactName = strings.TrimSpace(input.ContactName)
	input.ContactPhone = strings.TrimSpace(input.ContactPhone)
	if len(input.Region) != 3 || input.Region[0] == "" || input.Region[1] == "" || input.Region[2] == "" || input.Detail == "" || input.ContactName == "" || input.ContactPhone == "" {
		badRequest(w, "complete address is required")
		return
	}

	_, err := a.db.ExecContext(r.Context(), `
		INSERT INTO user_addresses(id, user_id, province, city, district, detail, contact_name, contact_phone, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
		ON CONFLICT (user_id) DO UPDATE SET
			province = EXCLUDED.province,
			city = EXCLUDED.city,
			district = EXCLUDED.district,
			detail = EXCLUDED.detail,
			contact_name = EXCLUDED.contact_name,
			contact_phone = EXCLUDED.contact_phone,
			updated_at = NOW()`,
		"address-demo-user", "demo-user", input.Region[0], input.Region[1], input.Region[2], input.Detail, input.ContactName, input.ContactPhone)
	if err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusOK, input)
}

func (a *app) pointsLeaderboard(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.QueryContext(r.Context(), `
		WITH ranked AS (
			SELECT id, COALESCE(NULLIF(nickname, ''), '乐伴伴用户') AS nickname, points,
				ROW_NUMBER() OVER (ORDER BY points DESC, created_at ASC) AS rank
			FROM profile
		)
		SELECT id, nickname, points, rank
		FROM ranked
		WHERE rank <= 5 OR id = $1
		ORDER BY rank`, currentUserID)
	if err != nil {
		serverError(w, err)
		return
	}
	defer rows.Close()

	items := []map[string]any{}
	for rows.Next() {
		var id, nickname string
		var points, rank int
		if err := rows.Scan(&id, &nickname, &points, &rank); err != nil {
			serverError(w, err)
			return
		}
		items = append(items, map[string]any{"rank": rank, "nickname": nickname, "initial": string([]rune(nickname)[0]), "points": points, "isCurrent": id == currentUserID})
	}
	respond(w, http.StatusOK, items)
}

func (a *app) pointRecords(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.QueryContext(r.Context(), `SELECT id,title,occurred_at::text,change FROM point_records WHERE user_id=$1 ORDER BY occurred_at DESC`, currentUserID)
	if err != nil {
		serverError(w, err)
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, title, timeText string
		var change int
		if err := rows.Scan(&id, &title, &timeText, &change); err != nil {
			serverError(w, err)
			return
		}
		out = append(out, map[string]any{"id": id, "title": title, "time": timeText[:16], "change": change})
	}
	respond(w, http.StatusOK, out)
}

func (a *app) coupons(w http.ResponseWriter, r *http.Request) {
	state := r.URL.Query().Get("status")
	rows, err := a.db.QueryContext(r.Context(), `SELECT id,value::text,title,note,date_text,status,state FROM coupons WHERE user_id=$1 AND ($2='' OR state=$2) ORDER BY sort_order`, currentUserID, state)
	if err != nil {
		serverError(w, err)
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, value, title, note, date, statusTextValue, stateValue string
		if err := rows.Scan(&id, &value, &title, &note, &date, &statusTextValue, &stateValue); err != nil {
			serverError(w, err)
			return
		}
		out = append(out, map[string]any{"id": id, "value": value, "title": title, "note": note, "date": date, "status": statusTextValue, "state": stateValue})
	}
	respond(w, http.StatusOK, out)
}

func migrate(db *gorm.DB) error {
	if err := db.Exec("CREATE SCHEMA IF NOT EXISTS lbb_mall").Error; err != nil {
		return err
	}
	if err := db.AutoMigrate(
		&Merchant{}, &Package{}, &Order{}, &Profile{}, &DailyCheckIn{}, &UserAddress{},
		&PointRecord{}, &Coupon{}, &PointsCategory{}, &PointsProduct{}, &PointsRedemption{},
		&BenefitItem{}, &BenefitNotice{}, &BenefitPromo{}, &DailyTask{}, &DailyTaskCompletion{},
		&Game{}, &GamePlay{},
	); err != nil {
		return err
	}
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}
	for _, name := range []string{"migrations/001_init.sql", "migrations/002_leaderboard_profiles.sql", "migrations/003_business_api.sql"} {
		b, err := migrationFS.ReadFile(name)
		if err != nil {
			return err
		}
		if _, err = sqlDB.Exec(string(b)); err != nil {
			return err
		}
	}
	return seedAdminFields(sqlDB)
}
func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func databaseURL() string {
	raw := env("DATABASE_URL", "postgres://quanzhou:quanzhou@127.0.0.1:5432/quanzhou?sslmode=disable")
	parsed, err := url.Parse(raw)
	if err != nil {
		return raw
	}
	query := parsed.Query()
	if query.Get("search_path") == "" {
		query.Set("search_path", "lbb_mall")
		parsed.RawQuery = query.Encode()
	}
	return parsed.String()
}

func publicImageURL(r *http.Request, raw string) string {
	parsed, err := url.Parse(raw)
	if err != nil || (parsed.Hostname() != "127.0.0.1" && parsed.Hostname() != "localhost") || r.Host == "" {
		return raw
	}
	parsed.Scheme = "http"
	parsed.Host = r.Host
	return parsed.String()
}

func statusText(state string) string {
	return map[string]string{"pending": "待核销", "verified": "已核销", "expired": "已失效"}[state]
}
func statusPresentation(state string) (string, string) {
	if state == "verified" {
		return "check-circle", "该订单已完成核销"
	}
	if state == "expired" {
		return "close-circle", "该订单已超过有效期"
	}
	return "time", "请在有效期内到店使用"
}
func respond(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]any{"data": data})
}
func serverError(w http.ResponseWriter, err error) {
	log.Println(err)
	respond(w, http.StatusInternalServerError, map[string]string{"message": "internal server error"})
}
func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
