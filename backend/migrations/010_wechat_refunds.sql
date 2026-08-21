ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_status TEXT NOT NULL DEFAULT 'none';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_no TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS wechat_refund_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_failure_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_orders_refund_status ON orders(refund_status, status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_refund_no ON orders(refund_no) WHERE refund_no IS NOT NULL;
