# 🚇 Metro Sheba

> A Real-Time Transit Operations & Passenger Management Platform inspired by the Dhaka Mass Rapid Transit (MRT) Line-6 ecosystem.

Metro Sheba is a full-stack transit management system designed to simulate and manage core metro rail operations including ticketing, station monitoring, fare enforcement, passenger services, lost-and-found workflows, and AI-powered landmark assistance.

---

# Live Deployment

### Frontend (Vercel)

https://metro-sheba.vercel.app/

### Backend API (Render)

https://metrosheba-service.onrender.com

### Database

Neon PostgreSQL (AWS ap-southeast-1)

---

# System Architecture Overview and Data flow

[ Vercel Edge Frontend Cluster ]
                 │                      ▲
          (HTTP / REST API)      (Server-Sent Events)
                 ▼                      │
         [ Node.js/Express Core Backend on Render ]
           │             │                    │
           ▼             ▼                    ▼
   [ pgvector Engine ] [ SQL Tables ]  [ Grok LLM Engine ]
   └─────────────────────┬────────────┘
                         ▼
            [ Neon PostgreSQL Cluster ]


# Core Objectives

Metro Sheba provides:

* Passenger Authentication
* Digital Wallet Management
* Smart Ticket Purchasing
* QR-Based Ticket Validation
* Gate State-Machine Simulation
* Journey History Tracking
* Lost & Found Management
* Real-Time Station Crowd Monitoring
* Landmark AI Assistant (RAG Architecture)
* Transit Operations Dashboard

---

# Technology Stack

## Frontend

* React
* Vite
* Axios
* EventSource (SSE)
* QR Visualization Components

## Backend

* Node.js
* Express.js
* JWT Authentication
* PostgreSQL
* pgvector
* PDF Generation Services

## Infrastructure

* Vercel
* Render
* Neon PostgreSQL

---

#  Database Schema

## Enable Extensions

Execute the following relational blueprints inside your Neon SQL console to provision the core application state management dependencies:

```sql
-- Enable Vector Extensions for Landmark Semantics
CREATE EXTENSION IF NOT EXISTS pgvector;

-- 1. Core Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Transit Live Stations State Table
CREATE TABLE metro_stations (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    grid_x INTEGER NOT NULL,
    grid_y INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'normal',
    notice TEXT DEFAULT ''
);

-- 3. Cryptographic Ticketing & Lifecycle Ledger
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id),
    source_station VARCHAR(50) NOT NULL,
    destination_station VARCHAR(50) NOT NULL,
    fare_paid DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'valid', -- 'valid', 'used', 'expired'
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- 4. Lost & Found Relational Core
CREATE TABLE lost_found (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    description TEXT,
    reported_type VARCHAR(10) NOT NULL, -- 'lost' or 'found'
    station_id VARCHAR(10) REFERENCES metro_stations(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. RAG Vector Knowledge Base for Landmarks
CREATE TABLE landmark_knowledge (
    id SERIAL PRIMARY KEY,
    landmark_name VARCHAR(100) NOT NULL,
    associated_station VARCHAR(50) NOT NULL,
    context_chunk TEXT NOT NULL,
    embedding VECTOR(1536) -- Match dimension output of chosen embedding model
);

--6 Metro Station Table for Map Updates
CREATE TABLE IF NOT EXISTS metro_stations (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    grid_x INTEGER NOT NULL,
    grid_y INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'normal',
    notice TEXT DEFAULT ''
);

--seeding the data
INSERT INTO metro_stations (id, name, grid_x, grid_y, status, notice) VALUES
('1', 'Uttara North', 80, 150, 'normal', ''),
('2', 'Uttara Center', 230, 150, 'normal', ''),
('3', 'Uttara South', 380, 150, 'normal', ''),
('4', 'Pallabi', 530, 150, 'normal', ''),
('5', 'Mirpur 11', 680, 150, 'normal', ''),
('6', 'Mirpur 10', 830, 150, 'normal', ''),
('7', 'Kazipara', 980, 150, 'normal', ''),
('8', 'Shewrapara', 1130, 150, 'normal', ''),
('9', 'Agargaon', 1280, 150, 'normal', ''),
('10', 'Bijoy Sarani', 1430, 150, 'normal', ''),
('11', 'Farmgate', 1580, 150, 'normal', ''),
('12', 'Karwan Bazar', 1730, 150, 'normal', ''),
('13', 'Shahbagh', 1880, 150, 'normal', ''),
('14', 'Dhaka University', 2030, 150, 'normal', ''),
('15', 'Secretariat', 2180, 150, 'normal', ''),
('16', 'Motijheel', 2330, 150, 'normal', '')
ON CONFLICT (id) DO NOTHING;

---

#  User Lifecycle

## Registration

1. User submits email and password.
2. Password is hashed before storage in database.
3. Account is created.
4. Wallet initialized with default balance.

## Login

1. Credentials validated.
2. JWT Access Token issued.
3. Refresh Token stored securely.
4. Session established.

## Wallet Top-Up

1. User initiates simulated payment.
2. Transaction recorded (ACID).
3. Wallet balance updated.
4. Dashboard refreshed.

---

#  Ticketing System

## Purchase Flow

```text
User
 ↓
Select Source
 ↓
Select Destination
 ↓
Fare Calculation
 ↓
Balance Validation
 ↓
Ticket Creation
 ↓
QR Generation
 ↓
PDF Download
```

### Validation Rule

```text
wallet_balance >= calculated_fare
```

### Ticket Characteristics

* Unique UUID
* One-hour validity window
* Downloadable PDF
* Embedded QR matrix
* Journey metadata

---

#  Gate Punch State Machine

Metro Sheba simulates entry and exit gates using fare matrices loaded from:

```text
apps/backend/src/data/fare.js
```

### Fare Lookup

```javascript
fare[source][destination]
```

---

## Entry Validation

```text
Ticket Status = VALID
        ↓
Allow Entry
        ↓
Mark Journey Active
```

Invalid tickets are rejected immediately.

---

## Exit Validation

```text
Entered Station
        ↓
Destination Match?
        ↓
YES → Complete Journey
NO  → Apply Penalty
```

### Penalty Enforcement

Incorrect terminal exits:

* Fine passenger
* Deduct balance from original amount automatically
* Log violation event (to be implemented)

---

#  Journey History

Ticket lifecycle:

```text
VALID - up for use
  ↓
USED  - travel done
  ↓
EXPIRED  - bought but never used
```

Historical records remain queryable for analytics and passenger review.

---

# Lost & Found System

Features:

* Report Lost Item
* Reporting Found item and Search by catagory will be implemented

---

# 🗺 Real-Time Metro Map

Metro Sheba streams station crowd density information using Server-Sent Events.

### SSE Endpoint

```http
GET /api/stations/live-stream
```

### EventSource Integration

```javascript
const source = new EventSource(
  "/api/stations/live-stream"
);
```

Benefits:

* No manual refresh required
* Low-overhead updates
* Continuous station monitoring
* Dynamic crowd visualization

---

# Landmark AI Assistant (RAG)

Metro Sheba includes a Retrieval-Augmented Generation pipeline.

## Processing Flow

```text
User Query
    ↓
Text Embedding
    ↓
pgvector Similarity Search
    ↓
Top 3 Context Chunks
    ↓
Prompt Augmentation
    ↓
Grok API
    ↓
Final Response
```

### Similarity Query

```sql
SELECT *
FROM landmark_knowledge
ORDER BY embedding <=> $1
LIMIT 3;
```

### Capabilities

* Landmark discovery
* Transit guidance
* Nearby attraction lookup
* Context-aware responses

---

#  Security Architecture

## Access Tokens

```text
Authorization: Bearer <token>
```

Stored client-side for API authorization.

---

## Refresh Tokens

Stored using:

```text
HttpOnly
Secure
SameSite
```

Benefits:

* XSS Protection
* CSRF Mitigation
* Session Isolation

---

#  Business Rule Enforcement

Metro Sheba prevents:

### Insufficient Balance Purchases

```text
Balance < Fare
```

Result:

```text
Ticket Purchase Rejected
```

---

### Double Punch Prevention

```text
Same Station
+
Sequential Scan
```

Result:

```text
Action Blocked
```

---

#  Advanced Routing Strategy

## Problem

Deep routes such as:

```text
/internal-system/dhaka-mrt-override-panel-6
```

may generate 404 errors on Vercel refresh operations.

---

## Solution

A secure query-parameter routing bypass was implemented.

### Access Pattern

```text
https://metro-sheba.vercel.app/?access=dhaka-mrt-override-panel-6
```

Benefits:

* Eliminates refresh-related route failures
* Preserves access control workflows
* Simplifies deployment behavior

---

# Environment Configuration

```env
PORT=5000

DATABASE_URL=postgresql://<neon-connection>

JWT_SECRET=your_jwt_secret

JWT_REFRESH_SECRET=your_refresh_secret

GROK_API_KEY=your_grok_key

CLIENT_URL=https://metro-sheba.vercel.app
```

---

# Local Development

## Backend

```bash
cd apps/backend

npm install

npm run dev
```

---

## Frontend

```bash
cd apps/frontend

npm install

npm run dev
```

---

# Future Enhancements

* Smart Fare Optimization
* Passenger Demand Forecasting
* Route Congestion Prediction
* Multi-Line Network Support
* NFC Smart Card Integration
* Admin Analytics Dashboard
* Operational Incident Management

---

#  License

This project was developed for educational, academic, and transit-simulation purposes.

---

## Metro Sheba

**Building a smarter, safer, and more intelligent urban transit experience through real-time operations, secure ticketing, and AI-powered passenger assistance.**
