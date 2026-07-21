CREATE TABLE organisation_invites (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    org_id INT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE
);

CREATE TABLE organisation_goals (
    id SERIAL PRIMARY KEY,
    org_id INT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    target_value DOUBLE PRECISION NOT NULL,
    current_value DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

CREATE TABLE organisation_challenges (
    id SERIAL PRIMARY KEY,
    org_id INT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    department_a VARCHAR(50) NOT NULL,
    department_b VARCHAR(50) NOT NULL,
    emissions_a DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    emissions_b DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    end_date DATE NOT NULL
);

-- Add department to users
ALTER TABLE users ADD COLUMN department VARCHAR(50) DEFAULT 'General';
