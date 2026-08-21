ALTER TABLE packages ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT -1;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS sell_start TIMESTAMPTZ;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS sell_end TIMESTAMPTZ;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS purchase_limit INTEGER NOT NULL DEFAULT 0;

ALTER TABLE packages DROP CONSTRAINT IF EXISTS packages_stock_check;
ALTER TABLE packages ADD CONSTRAINT packages_stock_check CHECK (stock >= -1);
ALTER TABLE packages DROP CONSTRAINT IF EXISTS packages_purchase_limit_check;
ALTER TABLE packages ADD CONSTRAINT packages_purchase_limit_check CHECK (purchase_limit >= 0);

CREATE INDEX IF NOT EXISTS idx_packages_sale_availability ON packages (merchant_id, active, sort_order);
