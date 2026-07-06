CREATE TABLE emission_factors (

    id BIGSERIAL PRIMARY KEY,

    category VARCHAR(50) NOT NULL,

    activity_type VARCHAR(100) NOT NULL,

    unit VARCHAR(50) NOT NULL,

    emission_factor DECIMAL(10,4) NOT NULL,

    source VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
