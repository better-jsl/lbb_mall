package main

import (
	"context"
	"crypto"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"errors"
	"fmt"
	"io"
	"math"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const wechatPayJSAPIURL = "https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi"
const wechatPayCertificatesURL = "https://api.mch.weixin.qq.com/v3/certificates"
const wechatPayRefundURL = "https://api.mch.weixin.qq.com/v3/refund/domestic/refunds"

type wechatPayClient struct {
	enabled          bool
	appID            string
	mchID            string
	apiV3Key         string
	privateKeyPath   string
	merchantSerialNo string
	notifyURL        string
	platformCertPath string
}

type wechatPayPrepayInput struct {
	AppID       string `json:"appid"`
	MchID       string `json:"mchid"`
	Description string `json:"description"`
	OutTradeNo  string `json:"out_trade_no"`
	NotifyURL   string `json:"notify_url"`
	TimeExpire  string `json:"time_expire"`
	Amount      struct {
		Total    int    `json:"total"`
		Currency string `json:"currency"`
	} `json:"amount"`
	Payer struct {
		OpenID string `json:"openid"`
	} `json:"payer"`
}

type wechatPayPrepayResponse struct {
	PrepayID string `json:"prepay_id"`
}

type wechatPayRefundRequest struct {
	TransactionID string `json:"transaction_id"`
	OutRefundNo   string `json:"out_refund_no"`
	Reason        string `json:"reason"`
	Amount        struct {
		Refund   int    `json:"refund"`
		Total    int    `json:"total"`
		Currency string `json:"currency"`
	} `json:"amount"`
}

type wechatPayRefundResponse struct {
	RefundID    string `json:"refund_id"`
	OutRefundNo string `json:"out_refund_no"`
	Status      string `json:"status"`
}

type wechatPayPaymentParams struct {
	TimeStamp string `json:"timeStamp"`
	NonceStr  string `json:"nonceStr"`
	Package   string `json:"package"`
	SignType  string `json:"signType"`
	PaySign   string `json:"paySign"`
}

func newWechatPayClient() *wechatPayClient {
	return &wechatPayClient{
		enabled:          env("WECHAT_PAY_ENABLED", "false") == "true",
		appID:            env("WECHAT_APP_ID", ""),
		mchID:            env("WECHAT_PAY_MCH_ID", ""),
		apiV3Key:         env("WECHAT_PAY_API_V3_KEY", ""),
		privateKeyPath:   env("WECHAT_PAY_PRIVATE_KEY_PATH", ""),
		merchantSerialNo: env("WECHAT_PAY_MCH_SERIAL_NO", ""),
		notifyURL:        env("WECHAT_PAY_NOTIFY_URL", ""),
		platformCertPath: env("WECHAT_PAY_PLATFORM_CERT_PATH", ""),
	}
}

func (c *wechatPayClient) validatePaymentConfig() error {
	if !c.enabled {
		return errors.New("微信支付尚未启用")
	}
	if c.appID == "" || c.mchID == "" || c.merchantSerialNo == "" || c.privateKeyPath == "" {
		return errors.New("微信支付商户配置不完整")
	}
	if len(c.apiV3Key) != 32 || strings.Contains(strings.ToLower(c.apiV3Key), "placeholder") {
		return errors.New("请配置有效的 WECHAT_PAY_API_V3_KEY")
	}
	if !strings.HasPrefix(c.notifyURL, "https://") {
		return errors.New("请配置公网 HTTPS 的 WECHAT_PAY_NOTIFY_URL")
	}
	return nil
}

func (c *wechatPayClient) validateCertificateConfig() error {
	if c.mchID == "" || c.merchantSerialNo == "" || c.privateKeyPath == "" {
		return errors.New("微信支付商户配置不完整")
	}
	if len(c.apiV3Key) != 32 || strings.Contains(strings.ToLower(c.apiV3Key), "placeholder") {
		return errors.New("请配置有效的 WECHAT_PAY_API_V3_KEY")
	}
	if c.platformCertPath == "" {
		return errors.New("请配置 WECHAT_PAY_PLATFORM_CERT_PATH")
	}
	return nil
}

func randomNonce() (string, error) {
	buffer := make([]byte, 18)
	if _, err := rand.Read(buffer); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buffer), nil
}

func privateKeyFromPEM(path string) (*rsa.PrivateKey, error) {
	contents, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	block, _ := pem.Decode(contents)
	if block == nil {
		return nil, errors.New("商户私钥文件格式错误")
	}
	if key, err := x509.ParsePKCS1PrivateKey(block.Bytes); err == nil {
		return key, nil
	}
	key, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	rsaKey, ok := key.(*rsa.PrivateKey)
	if !ok {
		return nil, errors.New("商户私钥不是 RSA 私钥")
	}
	return rsaKey, nil
}

func platformCertificateFromPEM(path string) (*x509.Certificate, error) {
	contents, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	block, _ := pem.Decode(contents)
	if block == nil {
		return nil, errors.New("微信支付平台证书格式错误")
	}
	return x509.ParseCertificate(block.Bytes)
}

func signWechatPayMessage(key *rsa.PrivateKey, message string) (string, error) {
	digest := sha256.Sum256([]byte(message))
	signature, err := rsa.SignPKCS1v15(rand.Reader, key, crypto.SHA256, digest[:])
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(signature), nil
}

func (c *wechatPayClient) authorization(method, requestURI, body string) (string, error) {
	key, err := privateKeyFromPEM(c.privateKeyPath)
	if err != nil {
		return "", err
	}
	nonce, err := randomNonce()
	if err != nil {
		return "", err
	}
	timestamp := fmt.Sprint(time.Now().Unix())
	signature, err := signWechatPayMessage(key, method+"\n"+requestURI+"\n"+timestamp+"\n"+nonce+"\n"+body+"\n")
	if err != nil {
		return "", err
	}
	return fmt.Sprintf(`WECHATPAY2-SHA256-RSA2048 mchid="%s",nonce_str="%s",timestamp="%s",serial_no="%s",signature="%s"`, c.mchID, nonce, timestamp, c.merchantSerialNo, signature), nil
}

func (c *wechatPayClient) createJSAPIPrepay(ctx context.Context, input wechatPayPrepayInput) (string, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return "", err
	}
	authorization, err := c.authorization(http.MethodPost, "/v3/pay/transactions/jsapi", string(body))
	if err != nil {
		return "", err
	}
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, wechatPayJSAPIURL, strings.NewReader(string(body)))
	if err != nil {
		return "", err
	}
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Accept", "application/json")
	request.Header.Set("Authorization", authorization)
	response, err := (&http.Client{Timeout: 10 * time.Second}).Do(request)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()
	responseBody, err := io.ReadAll(io.LimitReader(response.Body, 1<<20))
	if err != nil {
		return "", err
	}
	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		var failure struct {
			Message string `json:"message"`
		}
		_ = json.Unmarshal(responseBody, &failure)
		if failure.Message == "" {
			failure.Message = "微信支付下单失败"
		}
		return "", errors.New(failure.Message)
	}
	var result wechatPayPrepayResponse
	if err := json.Unmarshal(responseBody, &result); err != nil || result.PrepayID == "" {
		return "", errors.New("微信支付未返回预支付订单")
	}
	return result.PrepayID, nil
}

func (c *wechatPayClient) requestRefund(ctx context.Context, transactionID, refundNo string, amount int) (wechatPayRefundResponse, error) {
	var input wechatPayRefundRequest
	input.TransactionID = transactionID
	input.OutRefundNo = refundNo
	input.Reason = "用户取消订单"
	input.Amount.Refund = amount
	input.Amount.Total = amount
	input.Amount.Currency = "CNY"
	body, err := json.Marshal(input)
	if err != nil {
		return wechatPayRefundResponse{}, err
	}
	return c.refundRequest(ctx, http.MethodPost, "/v3/refund/domestic/refunds", wechatPayRefundURL, string(body))
}

func (c *wechatPayClient) queryRefund(ctx context.Context, refundNo string) (wechatPayRefundResponse, error) {
	requestURI := "/v3/refund/domestic/refunds/" + url.PathEscape(refundNo)
	return c.refundRequest(ctx, http.MethodGet, requestURI, "https://api.mch.weixin.qq.com"+requestURI, "")
}

func (c *wechatPayClient) refundRequest(ctx context.Context, method, requestURI, endpoint, body string) (wechatPayRefundResponse, error) {
	authorization, err := c.authorization(method, requestURI, body)
	if err != nil {
		return wechatPayRefundResponse{}, err
	}
	request, err := http.NewRequestWithContext(ctx, method, endpoint, strings.NewReader(body))
	if err != nil {
		return wechatPayRefundResponse{}, err
	}
	request.Header.Set("Accept", "application/json")
	request.Header.Set("Authorization", authorization)
	if body != "" {
		request.Header.Set("Content-Type", "application/json")
	}
	response, err := (&http.Client{Timeout: 10 * time.Second}).Do(request)
	if err != nil {
		return wechatPayRefundResponse{}, err
	}
	defer response.Body.Close()
	responseBody, err := io.ReadAll(io.LimitReader(response.Body, 1<<20))
	if err != nil {
		return wechatPayRefundResponse{}, err
	}
	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		var failure struct {
			Message string `json:"message"`
		}
		_ = json.Unmarshal(responseBody, &failure)
		if failure.Message == "" {
			failure.Message = "微信退款请求失败"
		}
		return wechatPayRefundResponse{}, errors.New(failure.Message)
	}
	var result wechatPayRefundResponse
	if err = json.Unmarshal(responseBody, &result); err != nil || result.Status == "" {
		return wechatPayRefundResponse{}, errors.New("微信退款未返回状态")
	}
	return result, nil
}

func (c *wechatPayClient) decryptWechatPayCiphertext(algorithm, ciphertextText, nonce, associatedData string) ([]byte, error) {
	if len(c.apiV3Key) != 32 {
		return nil, errors.New("WECHAT_PAY_API_V3_KEY 无效")
	}
	if algorithm != "AEAD_AES_256_GCM" {
		return nil, errors.New("不支持的微信支付加密方式")
	}
	ciphertext, err := base64.StdEncoding.DecodeString(ciphertextText)
	if err != nil {
		return nil, err
	}
	block, err := aes.NewCipher([]byte(c.apiV3Key))
	if err != nil {
		return nil, err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	return gcm.Open(nil, []byte(nonce), ciphertext, []byte(associatedData))
}

func (c *wechatPayClient) downloadPlatformCertificate(ctx context.Context) error {
	if err := c.validateCertificateConfig(); err != nil {
		return err
	}
	authorization, err := c.authorization(http.MethodGet, "/v3/certificates", "")
	if err != nil {
		return err
	}
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, wechatPayCertificatesURL, nil)
	if err != nil {
		return err
	}
	request.Header.Set("Accept", "application/json")
	request.Header.Set("Authorization", authorization)
	response, err := (&http.Client{Timeout: 10 * time.Second}).Do(request)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	body, err := io.ReadAll(io.LimitReader(response.Body, 1<<20))
	if err != nil {
		return err
	}
	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		return errors.New("下载微信支付平台证书失败")
	}
	var payload struct {
		Data []struct {
			EncryptCertificate wechatPayEncryptedResource `json:"encrypt_certificate"`
		} `json:"data"`
	}
	if err = json.Unmarshal(body, &payload); err != nil || len(payload.Data) == 0 {
		return errors.New("微信支付未返回平台证书")
	}
	pemBytes, err := c.decryptWechatPayCiphertext(
		payload.Data[0].EncryptCertificate.Algorithm,
		payload.Data[0].EncryptCertificate.Ciphertext,
		payload.Data[0].EncryptCertificate.Nonce,
		payload.Data[0].EncryptCertificate.AssociatedData,
	)
	if err != nil {
		return err
	}
	if _, err = x509.ParseCertificate(pemBlockBytes(pemBytes)); err != nil {
		return errors.New("微信支付平台证书内容无效")
	}
	if err = os.MkdirAll(filepath.Dir(c.platformCertPath), 0700); err != nil {
		return err
	}
	return os.WriteFile(c.platformCertPath, pemBytes, 0600)
}

func pemBlockBytes(contents []byte) []byte {
	block, _ := pem.Decode(contents)
	if block == nil {
		return nil
	}
	return block.Bytes
}

func (c *wechatPayClient) paymentParams(prepayID string) (wechatPayPaymentParams, error) {
	key, err := privateKeyFromPEM(c.privateKeyPath)
	if err != nil {
		return wechatPayPaymentParams{}, err
	}
	nonce, err := randomNonce()
	if err != nil {
		return wechatPayPaymentParams{}, err
	}
	timestamp := fmt.Sprint(time.Now().Unix())
	packageValue := "prepay_id=" + prepayID
	signature, err := signWechatPayMessage(key, c.appID+"\n"+timestamp+"\n"+nonce+"\n"+packageValue+"\n")
	if err != nil {
		return wechatPayPaymentParams{}, err
	}
	return wechatPayPaymentParams{TimeStamp: timestamp, NonceStr: nonce, Package: packageValue, SignType: "RSA", PaySign: signature}, nil
}

func (a *app) createWechatPayment(w http.ResponseWriter, r *http.Request) {
	if err := a.wechatPay.validatePaymentConfig(); err != nil {
		respond(w, http.StatusServiceUnavailable, map[string]string{"message": err.Error()})
		return
	}
	var input struct {
		PackageID string `json:"packageId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil || input.PackageID == "" {
		respond(w, http.StatusBadRequest, map[string]string{"message": "packageId is required"})
		return
	}
	userID := requestUserID(r)
	if err := a.releaseExpiredWechatPaymentReservations(r.Context(), input.PackageID); err != nil {
		serverError(w, err)
		return
	}
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		serverError(w, err)
		return
	}
	defer tx.Rollback()
	var openID sql.NullString
	var title string
	var price float64
	var active bool
	var stock, purchaseLimit int
	var sellStart, sellEnd sql.NullTime
	err = tx.QueryRowContext(r.Context(), `SELECT u.open_id,p.title,p.price,p.active,p.stock,p.sell_start,p.sell_end,p.purchase_limit
		FROM packages p JOIN profile u ON u.id=$2 WHERE p.id=$1 FOR UPDATE OF p`, input.PackageID, userID).Scan(&openID, &title, &price, &active, &stock, &sellStart, &sellEnd, &purchaseLimit)
	if err == sql.ErrNoRows {
		respond(w, http.StatusNotFound, map[string]string{"message": "套餐或微信用户不存在"})
		return
	}
	if err != nil {
		serverError(w, err)
		return
	}
	if !openID.Valid || openID.String == "" {
		respond(w, http.StatusBadRequest, map[string]string{"message": "请先完成微信登录"})
		return
	}
	var sellStartValue, sellEndValue *time.Time
	if sellStart.Valid {
		sellStartValue = &sellStart.Time
	}
	if sellEnd.Valid {
		sellEndValue = &sellEnd.Time
	}
	if message := packageUnavailableReason(active, stock, sellStartValue, sellEndValue, time.Now()); message != "" {
		respond(w, http.StatusConflict, map[string]string{"message": message})
		return
	}
	if purchaseLimit > 0 {
		var purchased int
		if err = tx.QueryRowContext(r.Context(), `SELECT COUNT(*) FROM orders WHERE package_id=$1 AND user_id=$2 AND (payment_status='unpaid' OR (payment_status='paid' AND status <> 'refunded'))`, input.PackageID, userID).Scan(&purchased); err != nil {
			serverError(w, err)
			return
		}
		if purchased >= purchaseLimit {
			respond(w, http.StatusConflict, map[string]string{"message": "已达每人限购数量"})
			return
		}
	}
	amount := int(math.Round(price * 100))
	if amount < 1 {
		respond(w, http.StatusBadRequest, map[string]string{"message": "套餐金额无效"})
		return
	}

	orderID := fmt.Sprintf("order-%d", time.Now().UnixNano())
	orderNo := fmt.Sprintf("LBB%d", time.Now().UnixNano())
	if stock > 0 {
		if _, err = tx.ExecContext(r.Context(), `UPDATE packages SET stock=stock-1, updated_at=NOW() WHERE id=$1`, input.PackageID); err != nil {
			serverError(w, err)
			return
		}
	}
	if _, err = tx.ExecContext(r.Context(), `INSERT INTO orders(id,package_id,user_id,order_no,status,payment_status) VALUES($1,$2,$3,$4,'pending','unpaid')`, orderID, input.PackageID, userID, orderNo); err != nil {
		serverError(w, err)
		return
	}
	if err = recordOrderEvent(r.Context(), tx, orderID, "money", "order_created", "订单已创建", "已发起微信支付"); err != nil {
		serverError(w, err)
		return
	}
	if err = tx.Commit(); err != nil {
		serverError(w, err)
		return
	}

	prepayInput := wechatPayPrepayInput{AppID: a.wechatPay.appID, MchID: a.wechatPay.mchID, Description: title, OutTradeNo: orderNo, NotifyURL: a.wechatPay.notifyURL, TimeExpire: time.Now().Add(15 * time.Minute).Format(time.RFC3339)}
	prepayInput.Amount.Total = amount
	prepayInput.Amount.Currency = "CNY"
	prepayInput.Payer.OpenID = openID.String
	prepayID, err := a.wechatPay.createJSAPIPrepay(r.Context(), prepayInput)
	if err != nil {
		a.releaseWechatPaymentReservation(r.Context(), orderID)
		respond(w, http.StatusBadGateway, map[string]string{"message": "微信支付下单失败：" + err.Error()})
		return
	}
	params, err := a.wechatPay.paymentParams(prepayID)
	if err != nil {
		a.releaseWechatPaymentReservation(r.Context(), orderID)
		serverError(w, err)
		return
	}
	respond(w, http.StatusCreated, map[string]any{"orderId": orderID, "payment": params})
}

func (a *app) releaseWechatPaymentReservation(ctx context.Context, orderID string) {
	tx, err := a.db.BeginTx(ctx, nil)
	if err != nil {
		return
	}
	defer tx.Rollback()
	var packageID string
	if err = tx.QueryRowContext(ctx, `UPDATE orders SET payment_status='failed', updated_at=NOW() WHERE id=$1 AND payment_status='unpaid' RETURNING package_id`, orderID).Scan(&packageID); err != nil {
		return
	}
	if _, err = tx.ExecContext(ctx, `UPDATE packages SET stock=stock+1, updated_at=NOW() WHERE id=$1 AND stock>=0`, packageID); err != nil {
		return
	}
	if recordOrderEvent(ctx, tx, orderID, "money", "payment_failed", "微信支付下单失败", "支付预下单未完成，库存已释放") != nil {
		return
	}
	_ = tx.Commit()
}

func (a *app) releaseExpiredWechatPaymentReservations(ctx context.Context, packageID string) error {
	tx, err := a.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	rows, err := tx.QueryContext(ctx, `UPDATE orders SET payment_status='expired', updated_at=NOW()
		WHERE payment_status='unpaid' AND created_at < NOW() - INTERVAL '15 minutes' AND ($1='' OR package_id=$1)
		RETURNING id, package_id`, packageID)
	if err != nil {
		return err
	}
	type expiredReservation struct {
		orderID   string
		packageID string
	}
	reservations := []expiredReservation{}
	for rows.Next() {
		var orderID, expiredPackageID string
		if err = rows.Scan(&orderID, &expiredPackageID); err != nil {
			rows.Close()
			return err
		}
		reservations = append(reservations, expiredReservation{orderID: orderID, packageID: expiredPackageID})
	}
	if err = rows.Err(); err != nil {
		rows.Close()
		return err
	}
	if err = rows.Close(); err != nil {
		return err
	}
	stockReleases := map[string]int{}
	for _, reservation := range reservations {
		stockReleases[reservation.packageID]++
		if err = recordOrderEvent(ctx, tx, reservation.orderID, "money", "payment_expired", "支付超时关闭", "超过15分钟未支付，库存已释放"); err != nil {
			return err
		}
	}
	for expiredPackageID, quantity := range stockReleases {
		if _, err = tx.ExecContext(ctx, `UPDATE packages SET stock=stock+$1, updated_at=NOW() WHERE id=$2 AND stock>=0`, quantity, expiredPackageID); err != nil {
			return err
		}
	}
	return tx.Commit()
}

type wechatPayNotification struct {
	EventType string                     `json:"event_type"`
	Resource  wechatPayEncryptedResource `json:"resource"`
}

type wechatPayEncryptedResource struct {
	Algorithm      string `json:"algorithm"`
	Ciphertext     string `json:"ciphertext"`
	Nonce          string `json:"nonce"`
	AssociatedData string `json:"associated_data"`
}

type wechatPayTransaction struct {
	AppID         string `json:"appid"`
	MchID         string `json:"mchid"`
	OutTradeNo    string `json:"out_trade_no"`
	TransactionID string `json:"transaction_id"`
	TradeState    string `json:"trade_state"`
	Amount        struct {
		Total int `json:"total"`
	} `json:"amount"`
}

func (c *wechatPayClient) verifyNotification(r *http.Request, body []byte) error {
	if c.platformCertPath == "" {
		return errors.New("未配置 WECHAT_PAY_PLATFORM_CERT_PATH")
	}
	certificate, err := platformCertificateFromPEM(c.platformCertPath)
	if err != nil {
		return err
	}
	if !strings.EqualFold(certificate.SerialNumber.String(), r.Header.Get("Wechatpay-Serial")) {
		return errors.New("微信支付平台证书序列号不匹配")
	}
	publicKey, ok := certificate.PublicKey.(*rsa.PublicKey)
	if !ok {
		return errors.New("微信支付平台证书不是 RSA 证书")
	}
	signature, err := base64.StdEncoding.DecodeString(r.Header.Get("Wechatpay-Signature"))
	if err != nil {
		return err
	}
	message := r.Header.Get("Wechatpay-Timestamp") + "\n" + r.Header.Get("Wechatpay-Nonce") + "\n" + string(body) + "\n"
	digest := sha256.Sum256([]byte(message))
	return rsa.VerifyPKCS1v15(publicKey, crypto.SHA256, digest[:], signature)
}

func (c *wechatPayClient) decryptNotification(resource wechatPayEncryptedResource) (wechatPayTransaction, error) {
	plaintext, err := c.decryptWechatPayCiphertext(resource.Algorithm, resource.Ciphertext, resource.Nonce, resource.AssociatedData)
	if err != nil {
		return wechatPayTransaction{}, err
	}
	var transaction wechatPayTransaction
	if err := json.Unmarshal(plaintext, &transaction); err != nil {
		return wechatPayTransaction{}, err
	}
	return transaction, nil
}

func (a *app) handleWechatPaymentNotify(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	if err != nil {
		http.Error(w, "unable to read payment notification", http.StatusBadRequest)
		return
	}
	if err = a.wechatPay.verifyNotification(r, body); err != nil {
		http.Error(w, "invalid payment notification", http.StatusUnauthorized)
		return
	}
	var notification wechatPayNotification
	if err = json.Unmarshal(body, &notification); err != nil {
		http.Error(w, "invalid payment notification", http.StatusBadRequest)
		return
	}
	transaction, err := a.wechatPay.decryptNotification(notification.Resource)
	if err != nil || notification.EventType != "TRANSACTION.SUCCESS" || transaction.TradeState != "SUCCESS" || transaction.AppID != a.wechatPay.appID || transaction.MchID != a.wechatPay.mchID {
		http.Error(w, "invalid payment notification", http.StatusBadRequest)
		return
	}
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		serverError(w, err)
		return
	}
	defer tx.Rollback()
	var orderID string
	err = tx.QueryRowContext(r.Context(), `UPDATE orders AS o SET payment_status='paid', wechat_transaction_id=$1, paid_at=NOW(), expires_at=NOW() + (p.validity_days * INTERVAL '1 day'), updated_at=NOW() FROM packages AS p WHERE o.package_id=p.id AND o.order_no=$2 AND o.payment_status='unpaid' AND o.created_at >= NOW() - INTERVAL '15 minutes' AND CAST(ROUND(p.price * 100) AS INTEGER)=$3 RETURNING o.id`, transaction.TransactionID, transaction.OutTradeNo, transaction.Amount.Total).Scan(&orderID)
	if err == sql.ErrNoRows {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if err != nil {
		serverError(w, err)
		return
	}
	if err = recordOrderEvent(r.Context(), tx, orderID, "money", "payment_paid", "微信支付成功", "支付已确认"); err != nil {
		serverError(w, err)
		return
	}
	if err = tx.Commit(); err != nil {
		serverError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
