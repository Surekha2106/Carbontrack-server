-- V18: Enterprise Hierarchy, Assets, Utility Bills, Reports, and GHG Protocol Scopes

-- 1. Extend Organisations table with enterprise profile fields
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS industry VARCHAR(100);
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS org_size VARCHAR(50);
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS gst_number VARCHAR(100);
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS contact_number VARCHAR(50);
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS org_email VARCHAR(100);

-- 2. Create Branches table
CREATE TABLE IF NOT EXISTS branches (
    id BIGSERIAL PRIMARY KEY,
    org_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150),
    code VARCHAR(50),
    headcount INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Departments table
CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT REFERENCES branches(id) ON DELETE CASCADE,
    org_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50),
    headcount INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Extend Users table with hierarchy references
ALTER TABLE users ADD COLUMN IF NOT EXISTS branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL;

-- 5. Extend Activity Logs table with scope and hierarchy
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS scope VARCHAR(20) DEFAULT 'SCOPE_3';
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS org_id BIGINT REFERENCES organisations(id) ON DELETE SET NULL;
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL;

-- 6. Create Assets table
CREATE TABLE IF NOT EXISTS assets (
    id BIGSERIAL PRIMARY KEY,
    org_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL,
    department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    asset_type VARCHAR(50) NOT NULL, -- VEHICLE, GENERATOR, MACHINERY, HVAC, SOLAR_PANEL, SERVER
    fuel_type VARCHAR(50),
    purchase_date DATE,
    energy_consumption NUMERIC(10,2) DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    emission_rating NUMERIC(10,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create Utility Bills table
CREATE TABLE IF NOT EXISTS utility_bills (
    id BIGSERIAL PRIMARY KEY,
    org_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL,
    department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    bill_type VARCHAR(50) NOT NULL, -- ELECTRICITY, WATER, GAS, FUEL
    account_number VARCHAR(100),
    billing_period VARCHAR(50),
    amount NUMERIC(10,2) DEFAULT 0.0,
    consumption_value NUMERIC(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    supplier VARCHAR(100),
    emission_value NUMERIC(10,2) DEFAULT 0.0,
    log_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Create Reports table
CREATE TABLE IF NOT EXISTS reports (
    id BIGSERIAL PRIMARY KEY,
    org_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL, -- DAILY, MONTHLY, YEARLY, DEPARTMENT, BRANCH, SCOPE, ESG, CSR
    scope_filter VARCHAR(20),
    start_date DATE,
    end_date DATE,
    total_emission NUMERIC(10,2) DEFAULT 0.0,
    generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    summary_json TEXT
);
