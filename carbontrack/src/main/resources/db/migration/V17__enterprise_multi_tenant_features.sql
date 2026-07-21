-- Add custom branding and domain matching to organisations table
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS logo_url VARCHAR(255);
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS primary_color VARCHAR(50) DEFAULT '#10B981';
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS allowed_domain VARCHAR(100);

-- Create audit_logs table for enterprise compliance tracking
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    org_id BIGINT NOT NULL,
    actor_email VARCHAR(100) NOT NULL,
    actor_name VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON audit_logs(org_id);
