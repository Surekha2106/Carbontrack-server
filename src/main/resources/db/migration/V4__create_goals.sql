
CREATE TABLE goals (

    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL,

    goal_name VARCHAR(100) NOT NULL,

    target_value DECIMAL(10,2) NOT NULL,

    current_value DECIMAL(10,2) DEFAULT 0,

    unit VARCHAR(50) NOT NULL,

    start_date DATE,

    end_date DATE,

    status VARCHAR(30) DEFAULT 'IN_PROGRESS',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_goal_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);