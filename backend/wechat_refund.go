package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"math"
	"net/http"
	"time"
)

func (a *app) cancelOrder(w http.ResponseWriter, r *http.Request) {
	if err := a.wechatPay.validatePaymentConfig(); err != nil {
		respond(w, http.StatusServiceUnavailable, map[string]string{"message": err.Error()})
		return
	}
	if err := a.expireOrders(r.Context()); err != nil {
		serverError(w, err)
		return
	}

	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		serverError(w, err)
		return
	}
	defer tx.Rollback()
	var transactionID, refundNo, refundStatus string
	var price float64
	err = tx.QueryRowContext(r.Context(), `SELECT o.wechat_transaction_id, COALESCE(o.refund_no, ''), o.refund_status, p.price
		FROM orders o JOIN packages p ON p.id=o.package_id
		WHERE o.id=$1 AND o.user_id=$2 AND o.status='pending' AND o.payment_status='paid' FOR UPDATE OF o`, r.PathValue("id"), requestUserID(r)).Scan(&transactionID, &refundNo, &refundStatus, &price)
	if err == sql.ErrNoRows {
		respond(w, http.StatusConflict, map[string]string{"message": "该订单当前无法取消"})
		return
	}
	if err != nil {
		serverError(w, err)
		return
	}
	if transactionID == "" {
		respond(w, http.StatusConflict, map[string]string{"message": "订单支付信息不完整，暂无法退款"})
		return
	}
	if refundStatus == "processing" {
		respond(w, http.StatusAccepted, map[string]string{"status": "processing"})
		return
	}
	if refundNo == "" {
		refundNo = fmt.Sprintf("LBBR%d", time.Now().UnixNano())
	}
	if _, err = tx.ExecContext(r.Context(), `UPDATE orders SET status='refunding', refund_status='processing', refund_no=$1, refund_failure_reason='', updated_at=NOW() WHERE id=$2`, refundNo, r.PathValue("id")); err != nil {
		serverError(w, err)
		return
	}
	if err = recordOrderEvent(r.Context(), tx, r.PathValue("id"), "money", "refund_requested", "已发起退款", "退款申请正在由微信处理"); err != nil {
		serverError(w, err)
		return
	}
	if err = tx.Commit(); err != nil {
		serverError(w, err)
		return
	}

	result, err := a.wechatPay.requestRefund(r.Context(), transactionID, refundNo, int(math.Round(price*100)))
	if err != nil {
		if updateErr := a.finishRefund(r.Context(), r.PathValue("id"), "FAILED", "", err.Error()); updateErr != nil {
			serverError(w, updateErr)
			return
		}
		respond(w, http.StatusBadGateway, map[string]string{"message": "微信退款申请失败，请稍后重试"})
		return
	}
	if err = a.finishRefund(r.Context(), r.PathValue("id"), result.Status, result.RefundID, ""); err != nil {
		serverError(w, err)
		return
	}
	respond(w, http.StatusAccepted, map[string]string{"status": result.Status})
}

func (a *app) finishRefund(ctx context.Context, orderID, status, refundID, failureReason string) error {
	if status == "SUCCESS" {
		tx, err := a.db.BeginTx(ctx, nil)
		if err != nil {
			return err
		}
		defer tx.Rollback()
		var packageID string
		err = tx.QueryRowContext(ctx, `UPDATE orders SET status='refunded', refund_status='success', wechat_refund_id=$1, refunded_at=NOW(), updated_at=NOW()
			WHERE id=$2 AND status='refunding' AND refund_status='processing' RETURNING package_id`, refundID, orderID).Scan(&packageID)
		if err == sql.ErrNoRows {
			return nil
		}
		if err != nil {
			return err
		}
		if _, err = tx.ExecContext(ctx, `UPDATE packages SET stock=stock+1, updated_at=NOW() WHERE id=$1 AND stock>=0`, packageID); err != nil {
			return err
		}
		if err = recordOrderEvent(ctx, tx, orderID, "money", "refund_succeeded", "退款成功", "退款已原路退回微信账户"); err != nil {
			return err
		}
		return tx.Commit()
	}
	if status == "PROCESSING" {
		tx, err := a.db.BeginTx(ctx, nil)
		if err != nil {
			return err
		}
		defer tx.Rollback()
		var updatedOrderID string
		err = tx.QueryRowContext(ctx, `UPDATE orders SET wechat_refund_id=$1, updated_at=NOW() WHERE id=$2 AND status='refunding' AND COALESCE(wechat_refund_id,'')='' RETURNING id`, refundID, orderID).Scan(&updatedOrderID)
		if err == sql.ErrNoRows {
			return nil
		}
		if err != nil {
			return err
		}
		if err = recordOrderEvent(ctx, tx, updatedOrderID, "money", "refund_processing", "微信正在处理退款", "退款已提交，等待微信到账"); err != nil {
			return err
		}
		return tx.Commit()
	}
	tx, err := a.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	var updatedOrderID string
	err = tx.QueryRowContext(ctx, `UPDATE orders SET status='pending', refund_status='failed', refund_failure_reason=$1, updated_at=NOW() WHERE id=$2 AND status='refunding' RETURNING id`, failureReason, orderID).Scan(&updatedOrderID)
	if err == sql.ErrNoRows {
		return nil
	}
	if err != nil {
		return err
	}
	if err = recordOrderEvent(ctx, tx, updatedOrderID, "money", "refund_failed", "退款失败", failureReason); err != nil {
		return err
	}
	return tx.Commit()
}

func (a *app) reconcileRefunds(ctx context.Context) error {
	if !a.wechatPay.enabled {
		return nil
	}
	rows, err := a.db.QueryContext(ctx, `SELECT id, refund_no FROM orders WHERE status='refunding' AND refund_status='processing' AND refund_no IS NOT NULL ORDER BY updated_at LIMIT 50`)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var orderID, refundNo string
		if err = rows.Scan(&orderID, &refundNo); err != nil {
			return err
		}
		result, queryErr := a.wechatPay.queryRefund(ctx, refundNo)
		if queryErr != nil {
			log.Printf("query refund %s: %v", orderID, queryErr)
			continue
		}
		if err = a.finishRefund(ctx, orderID, result.Status, result.RefundID, "微信退款未完成"); err != nil {
			return err
		}
	}
	return rows.Err()
}

func (a *app) reconcileRefundsLoop() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		if err := a.reconcileRefunds(context.Background()); err != nil {
			log.Printf("reconcile refunds: %v", err)
		}
	}
}
