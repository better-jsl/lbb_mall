package main

import (
	"context"
	"fmt"
	"testing"
	"time"
)

func TestShortTimestamp(t *testing.T) {
	if got := shortTimestamp("2026-08-21 12:34:56+08"); got != "2026-08-21 12:34" {
		t.Fatalf("shortTimestamp() = %q", got)
	}
	if got := shortTimestamp("short"); got != "short" {
		t.Fatalf("shortTimestamp() = %q", got)
	}
}

func TestExpireOrders(t *testing.T) {
	db := gameRewardTestDatabase(t)
	suffix := time.Now().UnixNano()
	userID := fmt.Sprintf("expiry-user-%d", suffix)
	merchantID := fmt.Sprintf("expiry-merchant-%d", suffix)
	packageID := fmt.Sprintf("expiry-package-%d", suffix)
	expiredOrderID := fmt.Sprintf("expiry-order-expired-%d", suffix)
	validOrderID := fmt.Sprintf("expiry-order-valid-%d", suffix)

	for _, statement := range []struct {
		query string
		args  []any
	}{
		{`INSERT INTO profile(id,points,coupons,favorites,created_at,updated_at) VALUES($1,0,0,0,NOW(),NOW())`, []any{userID}},
		{`INSERT INTO merchants(id,name,pinyin,created_at,updated_at) VALUES($1,'有效期测试商家','expiry',NOW(),NOW())`, []any{merchantID}},
		{`INSERT INTO packages(id,merchant_id,title,price,points,tag,gifts,tone,contents,notices,validity_days,sort_order,created_at,updated_at) VALUES($1,$2,'有效期测试套餐',1,0,'赠送','[]','default','[]','[]',30,999,NOW(),NOW())`, []any{packageID, merchantID}},
		{`INSERT INTO orders(id,package_id,user_id,order_no,status,payment_status,expires_at,created_at,updated_at) VALUES($1,$2,$3,$4,'pending','paid',NOW()-INTERVAL '1 minute',NOW(),NOW())`, []any{expiredOrderID, packageID, userID, "LBBEXPIRED" + fmt.Sprint(suffix)}},
		{`INSERT INTO orders(id,package_id,user_id,order_no,status,payment_status,expires_at,created_at,updated_at) VALUES($1,$2,$3,$4,'pending','paid',NOW()+INTERVAL '1 minute',NOW(),NOW())`, []any{validOrderID, packageID, userID, "LBBVALID" + fmt.Sprint(suffix)}},
	} {
		if _, err := db.Exec(statement.query, statement.args...); err != nil {
			t.Fatal(err)
		}
	}
	t.Cleanup(func() {
		_, _ = db.Exec(`DELETE FROM orders WHERE id IN ($1,$2)`, expiredOrderID, validOrderID)
		_, _ = db.Exec(`DELETE FROM packages WHERE id=$1`, packageID)
		_, _ = db.Exec(`DELETE FROM merchants WHERE id=$1`, merchantID)
		_, _ = db.Exec(`DELETE FROM profile WHERE id=$1`, userID)
	})

	if err := (&app{db: db}).expireOrders(context.Background()); err != nil {
		t.Fatal(err)
	}
	statuses := map[string]string{}
	rows, err := db.Query(`SELECT id,status FROM orders WHERE id IN ($1,$2)`, expiredOrderID, validOrderID)
	if err != nil {
		t.Fatal(err)
	}
	defer rows.Close()
	for rows.Next() {
		var id, status string
		if err := rows.Scan(&id, &status); err != nil {
			t.Fatal(err)
		}
		statuses[id] = status
	}
	if statuses[expiredOrderID] != "expired" || statuses[validOrderID] != "pending" {
		t.Fatalf("unexpected statuses: %#v", statuses)
	}
}
