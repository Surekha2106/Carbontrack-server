CREATE TABLE activity_logs (

    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL,

    category VARCHAR(50) NOT NULL,

    activity_type VARCHAR(100) NOT NULL,

    quantity DECIMAL(10,2) NOT NULL,

    unit VARCHAR(50) NOT NULL,

    emission DECIMAL(10,2),

    log_date DATE NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);