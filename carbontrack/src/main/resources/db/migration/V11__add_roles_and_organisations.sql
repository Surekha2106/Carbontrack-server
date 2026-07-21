CREATE TABLE organisations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    admin_user_id BIGINT
);

ALTER TABLE users
ADD COLUMN role VARCHAR(20) DEFAULT 'USER' NOT NULL,
ADD COLUMN org_id BIGINT,
ADD COLUMN preferred_units VARCHAR(20) DEFAULT 'metric',
ADD COLUMN goal_visibility VARCHAR(20) DEFAULT 'private',
ADD CONSTRAINT fk_users_org_id FOREIGN KEY (org_id) REFERENCES organisations(id);
