package main

import (
	"context"
	"log"
	"time"
)

func (a *app) expireOrders(ctx context.Context) error {
	tx, err := a.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	rows, err := tx.QueryContext(ctx, `UPDATE orders SET status='expired', updated_at=NOW()
		WHERE payment_status='paid' AND status='pending' AND expires_at IS NOT NULL AND expires_at <= NOW()
		RETURNING id`)
	if err != nil {
		return err
	}
	for rows.Next() {
		var orderID string
		if err = rows.Scan(&orderID); err != nil {
			rows.Close()
			return err
		}
		if err = recordOrderEvent(ctx, tx, orderID, "money", "order_expired", "订单已过期", "超过有效期未使用，订单已失效"); err != nil {
			rows.Close()
			return err
		}
	}
	if err = rows.Err(); err != nil {
		rows.Close()
		return err
	}
	if err = rows.Close(); err != nil {
		return err
	}
	return tx.Commit()
}

func (a *app) expireOrdersLoop() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		if err := a.expireOrders(context.Background()); err != nil {
			log.Printf("expire orders: %v", err)
		}
	}
}

func shortTimestamp(value string) string {
	if len(value) <= 16 {
		return value
	}
	return value[:16]
}
