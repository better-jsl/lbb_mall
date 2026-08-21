package main

import (
	"context"
	"database/sql"
	"time"
)

type orderEventWriter interface {
	ExecContext(context.Context, string, ...any) (sql.Result, error)
}

func recordOrderEvent(ctx context.Context, writer orderEventWriter, orderID, paymentType, eventType, title, detail string) error {
	_, err := writer.ExecContext(ctx, `INSERT INTO order_events(id,order_id,payment_type,event_type,title,detail,occurred_at,created_at,updated_at)
		VALUES($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())`, newID("order-event"), orderID, paymentType, eventType, title, detail, time.Now())
	return err
}

func (a *app) orderEvents(ctx context.Context, orderID, paymentType string) ([]map[string]string, error) {
	rows, err := a.db.QueryContext(ctx, `SELECT event_type,title,detail,occurred_at::text
		FROM order_events WHERE order_id=$1 AND payment_type=$2 ORDER BY occurred_at, created_at`, orderID, paymentType)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	events := []map[string]string{}
	for rows.Next() {
		var eventType, title, detail, occurredAt string
		if err := rows.Scan(&eventType, &title, &detail, &occurredAt); err != nil {
			return nil, err
		}
		events = append(events, map[string]string{"type": eventType, "title": title, "detail": detail, "occurredAt": shortTimestamp(occurredAt)})
	}
	return events, rows.Err()
}
