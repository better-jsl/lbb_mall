ALTER TABLE packages ADD COLUMN IF NOT EXISTS validity_days INTEGER NOT NULL DEFAULT 30;
ALTER TABLE packages DROP CONSTRAINT IF EXISTS packages_validity_days_check;
ALTER TABLE packages ADD CONSTRAINT packages_validity_days_check CHECK (validity_days > 0);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_orders_expiry ON orders (payment_status, status, expires_at);

UPDATE orders AS o
SET expires_at = COALESCE(o.paid_at, o.created_at) + (p.validity_days * INTERVAL '1 day')
FROM packages AS p
WHERE o.package_id = p.id AND o.payment_status = 'paid' AND o.status = 'pending' AND o.expires_at IS NULL;
