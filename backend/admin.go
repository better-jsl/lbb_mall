package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

type packageContent struct {
	Name  string `json:"name"`
	Count string `json:"count"`
}

type adminPackage struct {
	ID            string           `json:"id"`
	MerchantID    string           `json:"merchantId"`
	Title         string           `json:"title"`
	CoverImage    string           `json:"coverImage"`
	Price         float64          `json:"price"`
	Points        int              `json:"points"`
	Contents      []packageContent `json:"contents"`
	Gifts         []string         `json:"gifts"`
	Images        []string         `json:"images"`
	Notices       []string         `json:"notices"`
	Active        bool             `json:"active"`
	Stock         int              `json:"stock"`
	SellStart     *time.Time       `json:"sellStart"`
	SellEnd       *time.Time       `json:"sellEnd"`
	PurchaseLimit int              `json:"purchaseLimit"`
	ValidityDays  int              `json:"validityDays"`
	SortOrder     int              `json:"sortOrder"`
}

type adminMerchant struct {
	ID        string         `json:"id"`
	Name      string         `json:"name"`
	Subtitle  string         `json:"subtitle"`
	Pinyin    string         `json:"pinyin"`
	Location  string         `json:"location"`
	Phone     string         `json:"phone"`
	SortOrder int            `json:"sortOrder"`
	Packages  []adminPackage `json:"packages"`
}

type adminMerchantInput struct {
	Name     string `json:"name"`
	Subtitle string `json:"subtitle"`
	Location string `json:"location"`
	Phone    string `json:"phone"`
}

type adminPackageInput struct {
	MerchantID    string           `json:"merchantId"`
	Title         string           `json:"title"`
	CoverImage    string           `json:"coverImage"`
	Price         float64          `json:"price"`
	Points        int              `json:"points"`
	Contents      []packageContent `json:"contents"`
	Gifts         []string         `json:"gifts"`
	Images        []string         `json:"images"`
	Notices       []string         `json:"notices"`
	Active        bool             `json:"active"`
	Stock         int              `json:"stock"`
	SellStart     *time.Time       `json:"sellStart"`
	SellEnd       *time.Time       `json:"sellEnd"`
	PurchaseLimit int              `json:"purchaseLimit"`
	ValidityDays  int              `json:"validityDays"`
}

type reorderInput struct {
	MerchantID string   `json:"merchantId"`
	IDs        []string `json:"ids"`
}

func (a *app) uploadAdminImage(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(12 << 20); err != nil {
		badRequest(w, "upload must be an image smaller than 12MB")
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		badRequest(w, "image file is required")
		return
	}
	defer file.Close()

	extension := strings.ToLower(filepath.Ext(header.Filename))
	switch extension {
	case ".jpg", ".jpeg", ".png", ".webp", ".gif":
	default:
		badRequest(w, "only jpg, jpeg, png, webp, and gif images are allowed")
		return
	}
	if err := os.MkdirAll("uploads", 0755); err != nil {
		serverError(w, err)
		return
	}
	filename := newID("image") + extension
	destination, err := os.Create(filepath.Join("uploads", filename))
	if err != nil {
		serverError(w, err)
		return
	}
	defer destination.Close()
	if _, err := io.Copy(destination, io.LimitReader(file, 12<<20)); err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusCreated, map[string]string{"url": publicImageURL(r, "http://127.0.0.1:8080/uploads/"+filename)})
}

func (a *app) adminMerchants(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.QueryContext(r.Context(), `SELECT id, name, COALESCE(subtitle, ''), pinyin, COALESCE(location, ''), COALESCE(phone, ''), sort_order FROM merchants ORDER BY sort_order, created_at`)
	if err != nil {
		serverError(w, err)
		return
	}
	defer rows.Close()

	items := []adminMerchant{}
	for rows.Next() {
		var item adminMerchant
		if err := rows.Scan(&item.ID, &item.Name, &item.Subtitle, &item.Pinyin, &item.Location, &item.Phone, &item.SortOrder); err != nil {
			serverError(w, err)
			return
		}
		packages, err := a.adminPackages(r, item.ID)
		if err != nil {
			serverError(w, err)
			return
		}
		item.Packages = packages
		items = append(items, item)
	}
	respond(w, http.StatusOK, items)
}

func (a *app) adminPackages(r *http.Request, merchantID string) ([]adminPackage, error) {
	rows, err := a.db.QueryContext(r.Context(), `SELECT id, merchant_id, title, COALESCE(cover_image, ''), price, points,
		COALESCE(contents, '[]'::jsonb)::text, COALESCE(gifts, '[]'::jsonb)::text,
		COALESCE(package_images, '[]'::jsonb)::text, COALESCE(notices, '[]'::jsonb)::text,
		active, stock, sell_start, sell_end, purchase_limit, validity_days, sort_order
		FROM packages WHERE merchant_id = $1 ORDER BY sort_order, created_at`, merchantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []adminPackage{}
	for rows.Next() {
		var item adminPackage
		var contents, gifts, images, notices string
		var sellStart, sellEnd sql.NullTime
		if err := rows.Scan(&item.ID, &item.MerchantID, &item.Title, &item.CoverImage, &item.Price, &item.Points, &contents, &gifts, &images, &notices, &item.Active, &item.Stock, &sellStart, &sellEnd, &item.PurchaseLimit, &item.ValidityDays, &item.SortOrder); err != nil {
			return nil, err
		}
		if sellStart.Valid {
			item.SellStart = &sellStart.Time
		}
		if sellEnd.Valid {
			item.SellEnd = &sellEnd.Time
		}
		_ = json.Unmarshal([]byte(contents), &item.Contents)
		_ = json.Unmarshal([]byte(gifts), &item.Gifts)
		_ = json.Unmarshal([]byte(images), &item.Images)
		_ = json.Unmarshal([]byte(notices), &item.Notices)
		item.CoverImage = publicImageURL(r, item.CoverImage)
		for index, image := range item.Images {
			item.Images[index] = publicImageURL(r, image)
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (a *app) createAdminMerchant(w http.ResponseWriter, r *http.Request) {
	var input adminMerchantInput
	if !readJSON(w, r, &input) {
		return
	}
	input.Name = strings.TrimSpace(input.Name)
	if input.Name == "" {
		badRequest(w, "商家名称不能为空")
		return
	}
	var sortOrder int
	if err := a.db.QueryRowContext(r.Context(), `SELECT COALESCE(MAX(sort_order), 0) + 1 FROM merchants`).Scan(&sortOrder); err != nil {
		serverError(w, err)
		return
	}
	id := newID("merchant")
	if _, err := a.db.ExecContext(r.Context(), `INSERT INTO merchants(id, name, subtitle, pinyin, location, phone, sort_order) VALUES($1, $2, $3, $4, $5, $6, $7)`, id, input.Name, strings.TrimSpace(input.Subtitle), strings.ToLower(input.Name), strings.TrimSpace(input.Location), strings.TrimSpace(input.Phone), sortOrder); err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusCreated, map[string]string{"id": id})
}

func (a *app) updateAdminMerchant(w http.ResponseWriter, r *http.Request) {
	var input adminMerchantInput
	if !readJSON(w, r, &input) {
		return
	}
	input.Name = strings.TrimSpace(input.Name)
	if input.Name == "" {
		badRequest(w, "商家名称不能为空")
		return
	}
	result, err := a.db.ExecContext(r.Context(), `UPDATE merchants SET name = $1, subtitle = $2, pinyin = $3, location = $4, phone = $5, updated_at = NOW() WHERE id = $6`, input.Name, strings.TrimSpace(input.Subtitle), strings.ToLower(input.Name), strings.TrimSpace(input.Location), strings.TrimSpace(input.Phone), r.PathValue("id"))
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

func (a *app) deleteAdminMerchant(w http.ResponseWriter, r *http.Request) {
	result, err := a.db.ExecContext(r.Context(), `DELETE FROM merchants WHERE id = $1`, r.PathValue("id"))
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

func (a *app) reorderAdminMerchants(w http.ResponseWriter, r *http.Request) {
	var input reorderInput
	if !readJSON(w, r, &input) {
		return
	}
	if err := a.reorder(r, `UPDATE merchants SET sort_order = $1, updated_at = NOW() WHERE id = $2`, input.IDs); err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusOK, map[string]bool{"ok": true})
}

func (a *app) createAdminPackage(w http.ResponseWriter, r *http.Request) {
	var input adminPackageInput
	if !readJSON(w, r, &input) {
		return
	}
	if !validPackageInput(w, input) {
		return
	}
	var sortOrder int
	if err := a.db.QueryRowContext(r.Context(), `SELECT COALESCE(MAX(sort_order), 0) + 1 FROM packages WHERE merchant_id = $1`, input.MerchantID).Scan(&sortOrder); err != nil {
		serverError(w, err)
		return
	}
	id := newID("package")
	if err := a.savePackage(r, id, input, sortOrder, true); err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusCreated, map[string]string{"id": id})
}

func (a *app) updateAdminPackage(w http.ResponseWriter, r *http.Request) {
	var input adminPackageInput
	if !readJSON(w, r, &input) {
		return
	}
	if !validPackageInput(w, input) {
		return
	}
	var sortOrder int
	err := a.db.QueryRowContext(r.Context(), `SELECT sort_order FROM packages WHERE id = $1`, r.PathValue("id")).Scan(&sortOrder)
	if err == sql.ErrNoRows {
		notFound(w)
		return
	}
	if err != nil {
		serverError(w, err)
		return
	}
	if err := a.savePackage(r, r.PathValue("id"), input, sortOrder, false); err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusOK, map[string]bool{"ok": true})
}

func (a *app) deleteAdminPackage(w http.ResponseWriter, r *http.Request) {
	result, err := a.db.ExecContext(r.Context(), `DELETE FROM packages WHERE id = $1`, r.PathValue("id"))
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

func (a *app) reorderAdminPackages(w http.ResponseWriter, r *http.Request) {
	var input reorderInput
	if !readJSON(w, r, &input) {
		return
	}
	if input.MerchantID == "" {
		badRequest(w, "缺少商家信息")
		return
	}
	if err := a.reorder(r, `UPDATE packages SET sort_order = $1, updated_at = NOW() WHERE id = $2 AND merchant_id = $3`, input.IDs, input.MerchantID); err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusOK, map[string]bool{"ok": true})
}

func (a *app) savePackage(r *http.Request, id string, input adminPackageInput, sortOrder int, creating bool) error {
	contents, _ := json.Marshal(input.Contents)
	gifts, _ := json.Marshal(input.Gifts)
	images, _ := json.Marshal(input.Images)
	notices, _ := json.Marshal(input.Notices)
	if creating {
		_, err := a.db.ExecContext(r.Context(), `INSERT INTO packages(id, merchant_id, title, cover_image, price, points, tag, gifts, package_images, tone, contents, notices, active, stock, sell_start, sell_end, purchase_limit, validity_days, sort_order)
			VALUES($1,$2,$3,$4,$5,$6,'赠送',$7,$8,'default',$9,$10,$11,$12,$13,$14,$15,$16,$17)`, id, input.MerchantID, input.Title, input.CoverImage, input.Price, input.Points, gifts, images, contents, notices, input.Active, input.Stock, input.SellStart, input.SellEnd, input.PurchaseLimit, input.ValidityDays, sortOrder)
		return err
	}
	_, err := a.db.ExecContext(r.Context(), `UPDATE packages SET merchant_id=$1, title=$2, cover_image=$3, price=$4, points=$5, gifts=$6, package_images=$7, contents=$8, notices=$9, active=$10, stock=$11, sell_start=$12, sell_end=$13, purchase_limit=$14, validity_days=$15, updated_at=NOW() WHERE id=$16`, input.MerchantID, input.Title, input.CoverImage, input.Price, input.Points, gifts, images, contents, notices, input.Active, input.Stock, input.SellStart, input.SellEnd, input.PurchaseLimit, input.ValidityDays, id)
	return err
}

func (a *app) reorder(r *http.Request, statement string, ids []string, extra ...string) error {
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	for index, id := range ids {
		args := []any{index + 1, id}
		for _, value := range extra {
			args = append(args, value)
		}
		if _, err := tx.ExecContext(r.Context(), statement, args...); err != nil {
			return err
		}
	}
	return tx.Commit()
}

func (a *app) adminUsers(w http.ResponseWriter, r *http.Request) {
	page, size, query := listOptions(r)
	var total int
	if err := a.db.QueryRowContext(r.Context(), `SELECT COUNT(*) FROM profile WHERE nickname ILIKE $1 OR phone ILIKE $1`, "%"+query+"%").Scan(&total); err != nil {
		serverError(w, err)
		return
	}
	rows, err := a.db.QueryContext(r.Context(), `SELECT p.id, p.nickname, p.avatar, p.phone, p.points, COUNT(DISTINCT o.id) FROM profile p LEFT JOIN orders o ON o.user_id=p.id
		WHERE p.nickname ILIKE $1 OR p.phone ILIKE $1 GROUP BY p.id ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`, "%"+query+"%", size, (page-1)*size)
	if err != nil {
		serverError(w, err)
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var id, nickname, avatar, phone string
		var points, orderCount int
		if err := rows.Scan(&id, &nickname, &avatar, &phone, &points, &orderCount); err != nil {
			serverError(w, err)
			return
		}
		items = append(items, map[string]any{"id": id, "nickname": nickname, "avatar": publicImageURL(r, avatar), "phone": phone, "points": points, "orderCount": orderCount})
	}
	respond(w, http.StatusOK, map[string]any{"items": items, "total": total, "page": page, "size": size})
}

func (a *app) adminOrders(w http.ResponseWriter, r *http.Request) {
	if err := a.expireOrders(r.Context()); err != nil {
		serverError(w, err)
		return
	}
	page, size, query := listOptions(r)
	userID := strings.TrimSpace(r.URL.Query().Get("userId"))
	paymentType := strings.TrimSpace(r.URL.Query().Get("paymentType"))
	if paymentType != "money" && paymentType != "points" {
		paymentType = ""
	}
	var total int
	if err := a.db.QueryRowContext(r.Context(), `WITH records AS (
		SELECT o.user_id, u.nickname, p.title AS content, 'money' AS payment_type FROM orders o JOIN profile u ON u.id=o.user_id JOIN packages p ON p.id=o.package_id WHERE o.payment_status='paid'
		UNION ALL
		SELECT pr.user_id, u.nickname, pp.title AS content, 'points' AS payment_type FROM points_redemptions pr JOIN profile u ON u.id=pr.user_id JOIN points_products pp ON pp.id=pr.product_id
	) SELECT COUNT(*) FROM records WHERE (nickname ILIKE $1 OR content ILIKE $1) AND ($2 = '' OR payment_type = $2) AND ($3 = '' OR user_id = $3)`, "%"+query+"%", paymentType, userID).Scan(&total); err != nil {
		serverError(w, err)
		return
	}
	rows, err := a.db.QueryContext(r.Context(), `WITH records AS (
		SELECT o.id, o.order_no, o.created_at, o.status, u.nickname, u.phone, p.title AS content, p.price::numeric AS price, 'money' AS payment_type, o.user_id
		FROM orders o JOIN profile u ON u.id=o.user_id JOIN packages p ON p.id=o.package_id WHERE o.payment_status='paid'
		UNION ALL
		SELECT pr.id, pr.id AS order_no, pr.created_at, pr.status, u.nickname, u.phone, pp.title AS content, pr.points_cost::numeric AS price, 'points' AS payment_type, pr.user_id
		FROM points_redemptions pr JOIN profile u ON u.id=pr.user_id JOIN points_products pp ON pp.id=pr.product_id
	) SELECT id, order_no, created_at::text, status, nickname, phone, content, price, payment_type FROM records
		WHERE (nickname ILIKE $1 OR content ILIKE $1) AND ($4 = '' OR payment_type = $4) AND ($5 = '' OR user_id = $5) ORDER BY created_at DESC LIMIT $2 OFFSET $3`, "%"+query+"%", size, (page-1)*size, paymentType, userID)
	if err != nil {
		serverError(w, err)
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var id, orderNo, createdAt, status, nickname, phone, title, paymentType string
		var price float64
		if err := rows.Scan(&id, &orderNo, &createdAt, &status, &nickname, &phone, &title, &price, &paymentType); err != nil {
			serverError(w, err)
			return
		}
		items = append(items, map[string]any{"id": id, "orderNo": orderNo, "createdAt": createdAt[:16], "status": status, "nickname": nickname, "phone": phone, "content": title, "price": price, "paymentType": paymentType})
	}
	respond(w, http.StatusOK, map[string]any{"items": items, "total": total, "page": page, "size": size})
}

func (a *app) adminOrderDetail(w http.ResponseWriter, r *http.Request) {
	if err := a.expireOrders(r.Context()); err != nil {
		serverError(w, err)
		return
	}
	var id, orderNo, createdAt, status, nickname, phone, merchantName, packageTitle, coverImage string
	var expiresAt sql.NullString
	var price float64
	var points int
	var contents, gifts, images, notices string
	err := a.db.QueryRowContext(r.Context(), `SELECT o.id, o.order_no, o.created_at::text, o.status, u.nickname, u.phone,
		m.name, p.title, p.price, p.points, COALESCE(p.cover_image, ''), COALESCE(p.contents, '[]'::jsonb)::text,
		COALESCE(p.gifts, '[]'::jsonb)::text, COALESCE(p.package_images, '[]'::jsonb)::text, COALESCE(p.notices, '[]'::jsonb)::text, o.expires_at::text
		FROM orders o JOIN profile u ON u.id=o.user_id JOIN packages p ON p.id=o.package_id JOIN merchants m ON m.id=p.merchant_id WHERE o.id=$1`, r.PathValue("id")).Scan(
		&id, &orderNo, &createdAt, &status, &nickname, &phone, &merchantName, &packageTitle, &price, &points, &coverImage, &contents, &gifts, &images, &notices, &expiresAt)
	if err == sql.ErrNoRows {
		a.adminPointsRedemptionDetail(w, r)
		return
	}
	if err != nil {
		serverError(w, err)
		return
	}
	var contentItems []packageContent
	var giftItems, imageItems, noticeItems []string
	_ = json.Unmarshal([]byte(contents), &contentItems)
	_ = json.Unmarshal([]byte(gifts), &giftItems)
	_ = json.Unmarshal([]byte(images), &imageItems)
	_ = json.Unmarshal([]byte(notices), &noticeItems)
	coverImage = publicImageURL(r, coverImage)
	for index, image := range imageItems {
		imageItems[index] = publicImageURL(r, image)
	}
	expiresAtText := ""
	if expiresAt.Valid {
		expiresAtText = shortTimestamp(expiresAt.String)
	}
	events, err := a.orderEvents(r.Context(), id, "money")
	if err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusOK, map[string]any{
		"id": id, "orderNo": orderNo, "createdAt": shortTimestamp(createdAt), "status": status,
		"nickname": nickname, "phone": phone, "merchantName": merchantName, "packageTitle": packageTitle,
		"price": price, "points": points, "coverImage": coverImage, "contents": contentItems, "expiresAt": expiresAtText,
		"gifts": giftItems, "images": imageItems, "notices": noticeItems, "events": events, "paymentType": "money",
	})
}

func (a *app) adminPointsRedemptionDetail(w http.ResponseWriter, r *http.Request) {
	var id, createdAt, status, nickname, phone, title, method, image, addressRaw string
	var points int
	err := a.db.QueryRowContext(r.Context(), `SELECT pr.id, pr.created_at::text, pr.status, u.nickname, u.phone, pp.title, pp.redemption_method,
		COALESCE(pp.image, ''), pr.points_cost, COALESCE(pr.address_snapshot, '{}'::jsonb)::text
		FROM points_redemptions pr JOIN profile u ON u.id=pr.user_id JOIN points_products pp ON pp.id=pr.product_id WHERE pr.id=$1`, r.PathValue("id")).Scan(
		&id, &createdAt, &status, &nickname, &phone, &title, &method, &image, &points, &addressRaw)
	if err == sql.ErrNoRows {
		notFound(w)
		return
	}
	if err != nil {
		serverError(w, err)
		return
	}

	contents := []packageContent{{Name: "兑换方式", Count: method}}
	var address struct {
		Region       []string `json:"region"`
		Detail       string   `json:"detail"`
		ContactName  string   `json:"contactName"`
		ContactPhone string   `json:"contactPhone"`
	}
	if json.Unmarshal([]byte(addressRaw), &address) == nil && len(address.Region) == 3 {
		contents = append(contents, packageContent{Name: "收货地址", Count: strings.Join(address.Region, " ") + " " + address.Detail})
		contents = append(contents, packageContent{Name: "收货人", Count: strings.TrimSpace(address.ContactName + " " + address.ContactPhone)})
	}
	events, err := a.orderEvents(r.Context(), id, "points")
	if err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusOK, map[string]any{
		"id": id, "orderNo": id, "createdAt": createdAt[:16], "status": status,
		"nickname": nickname, "phone": phone, "merchantName": "积分商城", "packageTitle": title,
		"price": points, "points": 0, "coverImage": publicImageURL(r, image), "contents": contents,
		"gifts": []string{}, "images": []string{}, "notices": []string{}, "events": events, "paymentType": "points",
	})
}

func listOptions(r *http.Request) (int, int, string) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}
	size, _ := strconv.Atoi(r.URL.Query().Get("size"))
	if size < 1 || size > 50 {
		size = 10
	}
	return page, size, strings.TrimSpace(r.URL.Query().Get("q"))
}

func readJSON(w http.ResponseWriter, r *http.Request, target any) bool {
	if err := json.NewDecoder(r.Body).Decode(target); err != nil {
		badRequest(w, "请求数据格式不正确")
		return false
	}
	return true
}

func validPackageInput(w http.ResponseWriter, input adminPackageInput) bool {
	if strings.TrimSpace(input.MerchantID) == "" || strings.TrimSpace(input.Title) == "" {
		badRequest(w, "商家和套餐名称不能为空")
		return false
	}
	if input.Price < 0 || input.Points < 0 {
		badRequest(w, "价格和积分不能为负数")
		return false
	}
	if input.Stock < -1 {
		badRequest(w, "库存只能为 -1（不限）或非负整数")
		return false
	}
	if input.PurchaseLimit < 0 {
		badRequest(w, "每人限购不能为负数")
		return false
	}
	if input.ValidityDays < 1 {
		badRequest(w, "有效期至少为 1 天")
		return false
	}
	if input.SellStart != nil && input.SellEnd != nil && input.SellStart.After(*input.SellEnd) {
		badRequest(w, "售卖开始时间不能晚于结束时间")
		return false
	}
	return true
}

func newID(prefix string) string { return fmt.Sprintf("%s-%d", prefix, time.Now().UnixNano()) }

func affected(result sql.Result) int64 {
	count, _ := result.RowsAffected()
	return count
}

func badRequest(w http.ResponseWriter, message string) {
	respond(w, http.StatusBadRequest, map[string]string{"message": message})
}
func notFound(w http.ResponseWriter) {
	respond(w, http.StatusNotFound, map[string]string{"message": "not found"})
}

func seedAdminFields(db *sql.DB) error {
	statements := []string{
		`UPDATE packages SET cover_image = CASE id WHEN 'pkg-1' THEN 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=480&q=80' WHEN 'pkg-2' THEN 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=480&q=80' WHEN 'pkg-3' THEN 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=480&q=80' ELSE 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=480&q=80' END WHERE cover_image IS NULL OR cover_image = ''`,
		`UPDATE packages SET package_images = jsonb_build_array(cover_image) WHERE package_images IS NULL OR package_images = '[]'::jsonb`,
		`UPDATE profile SET nickname = CASE WHEN nickname IS NULL OR nickname = '' THEN '乐伴伴会员' ELSE nickname END, avatar = CASE WHEN avatar IS NULL OR avatar = '' THEN 'https://api.dicebear.com/9.x/initials/svg?seed=LBB' ELSE avatar END, phone = CASE WHEN phone IS NULL OR phone = '' THEN '13800000000' ELSE phone END WHERE id = 'demo-user'`,
		`UPDATE orders SET user_id = 'demo-user' WHERE user_id IS NULL OR user_id = ''`,
	}
	for _, statement := range statements {
		if _, err := db.Exec(statement); err != nil {
			return err
		}
	}
	return nil
}
