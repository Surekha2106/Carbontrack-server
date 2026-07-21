CREATE TABLE IF NOT EXISTS employee_invitations (
    id UUID PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    email VARCHAR(100) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL
);
