CREATE TABLE IF NOT EXISTS order_events (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  payment_type TEXT NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_events_order ON order_events(order_id, payment_type, occurred_at);

INSERT INTO order_events(id,order_id,payment_type,event_type,title,detail,occurred_at)
SELECT 'order-event-init-created-' || o.id, o.id, 'money', 'order_created', '订单已创建', '已发起微信支付', o.created_at
FROM orders o
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_events(id,order_id,payment_type,event_type,title,detail,occurred_at)
SELECT 'order-event-init-paid-' || o.id, o.id, 'money', 'payment_paid', '微信支付成功', '支付已确认', COALESCE(o.paid_at, o.created_at)
FROM orders o
WHERE o.payment_status = 'paid'
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_events(id,order_id,payment_type,event_type,title,detail,occurred_at)
SELECT 'order-event-init-payment-' || o.id, o.id, 'money',
  CASE WHEN o.payment_status = 'expired' THEN 'payment_expired' ELSE 'payment_failed' END,
  CASE WHEN o.payment_status = 'expired' THEN '支付超时关闭' ELSE '微信支付下单失败' END,
  '订单未完成支付，库存已释放', o.updated_at
FROM orders o
WHERE o.payment_status IN ('failed', 'expired')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_events(id,order_id,payment_type,event_type,title,detail,occurred_at)
SELECT 'order-event-init-verified-' || o.id, o.id, 'money', 'order_verified', '订单已核销', '套餐已完成使用', COALESCE(o.verified_at, o.updated_at, o.created_at)
FROM orders o
WHERE o.status = 'verified'
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_events(id,order_id,payment_type,event_type,title,detail,occurred_at)
SELECT 'order-event-init-expired-' || o.id, o.id, 'money', 'order_expired', '订单已过期', '超过有效期未使用，订单已失效', o.updated_at
FROM orders o
WHERE o.status = 'expired'
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_events(id,order_id,payment_type,event_type,title,detail,occurred_at)
SELECT 'order-event-init-refunding-' || o.id, o.id, 'money', 'refund_requested', '已发起退款', '退款申请正在由微信处理', o.updated_at
FROM orders o
WHERE o.status = 'refunding'
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_events(id,order_id,payment_type,event_type,title,detail,occurred_at)
SELECT 'order-event-init-refunded-' || o.id, o.id, 'money', 'refund_succeeded', '退款成功', '退款已原路退回微信账户', COALESCE(o.refunded_at, o.updated_at, o.created_at)
FROM orders o
WHERE o.status = 'refunded'
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_events(id,order_id,payment_type,event_type,title,detail,occurred_at)
SELECT 'order-event-init-refund-failed-' || o.id, o.id, 'money', 'refund_failed', '退款失败', COALESCE(NULLIF(o.refund_failure_reason, ''), '微信退款未完成'), o.updated_at
FROM orders o
WHERE o.refund_status = 'failed'
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_events(id,order_id,payment_type,event_type,title,detail,occurred_at)
SELECT 'order-event-init-redemption-' || pr.id, pr.id, 'points', 'points_redeemed', '积分兑换成功', '扣除' || pr.points_cost || '积分', pr.created_at
FROM points_redemptions pr
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_events(id,order_id,payment_type,event_type,title,detail,occurred_at)
SELECT 'order-event-init-voucher-' || pr.id, pr.id, 'points', 'app_voucher_claimed', '抵用券领取信息已提交', '已填写乐伴伴 App 登录手机号', pr.updated_at
FROM points_redemptions pr
WHERE COALESCE(pr.app_phone, '') <> ''
ON CONFLICT (id) DO NOTHING;
