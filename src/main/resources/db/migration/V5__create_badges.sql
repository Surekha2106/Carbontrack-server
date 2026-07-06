CREATE TABLE badges (

    id BIGSERIAL PRIMARY KEY,

    badge_name VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    badge_icon VARCHAR(255),

    required_value DECIMAL(10,2) NOT NULL,

    category VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);