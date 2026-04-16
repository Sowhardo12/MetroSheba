CREATE EXTENSION IF NOT EXISTS vector; --the pgvector extension installation

--ticket table



--station table
CREATE TABLE IF NOT EXISTS stations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    accessibility_info TEXT,
    base_fare INT DEFAULT 20
);

--user table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- 'user' or 'admin'
    balance DECIMAL(10, 2) DEFAULT 0.00
);
--station crowed and jam status in nearby areas
CREATE TABLE IF NOT EXISTS station_status (
    id SERIAL PRIMARY KEY,
    station_id INTEGER REFERENCES stations(id),
    crowd_level VARCHAR(20), -- 'Low', 'Medium', 'High'
    traffic_congestion VARCHAR(20), -- 'Clear', 'Busy', 'Jam'
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
--lost and found infos
CREATE TABLE IF NOT EXISTS lost_found (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(255),
    description TEXT,
    station_id INTEGER REFERENCES stations(id),
    status VARCHAR(20) DEFAULT 'reported', -- 'reported', 'found', 'claimed'
    reported_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge Base for RAG
CREATE TABLE IF NOT EXISTS landmark_knowledge (
    id SERIAL PRIMARY KEY,
    station_id INTEGER REFERENCES stations(id),
    landmark_name TEXT NOT NULL,
    description TEXT,
    embedding vector(3072) -- Gemini's text-embedding-004 uses 768 dimensions
);

CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    from_station INTEGER REFERENCES stations(id),
    to_station INTEGER REFERENCES stations(id),
    fare DECIMAL(10, 2) NOT NULL,
    qr_code_data TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'valid', -- 'valid', 'used', 'expired'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 hour')
);
--adding real data
INSERT INTO stations (name, lat, lng, accessibility_info) VALUES
('Uttara North', 23.8759, 90.3755, 'Elevator: Working'),
('Uttara Center', 23.8654, 90.3739, 'Elevator: Working'),
('Uttara South', 23.8542, 90.3704, 'Elevator: Working'),
('Pallabi', 23.8248, 90.3644, 'Elevator: Working'),
('Mirpur-11', 23.8135, 90.3639, 'Elevator: Under Maintenance'),
('Mirpur-10', 23.8069, 90.3683, 'Elevator: Working'),
('Kazipara', 23.7974, 90.3719, 'Elevator: Working'),
('Shewrapara', 23.7887, 90.3748, 'Elevator: Working'),
('Agargaon', 23.7761, 90.3773, 'Elevator: Working'),
('Bijoy Sarani', 23.7656, 90.3879, 'Elevator: Working'),
('Farmgate', 23.7561, 90.3908, 'Elevator: Working'),
('Karwan Bazar', 23.7505, 90.3934, 'Elevator: Working'),
('Shahbagh', 23.7389, 90.3962, 'Elevator: Working'),
('Dhaka University', 23.7317, 90.3957, 'Elevator: Working'),
('Secretariat', 23.7291, 90.4045, 'Elevator: Working'),
('Motijheel', 23.7330, 90.4173, 'Elevator: Working');