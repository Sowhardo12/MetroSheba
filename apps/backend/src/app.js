const express = require('express');
const cors = require('cors'); // 1. Import CORS
const { Pool } = require('pg');
require('dotenv').config();
const stationRoutes = require('./routes/stationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const lostFoundRoutes = require('./routes/lostFoundRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const app = express();

// PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server access 
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json());


app.use('/api/stations', stationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/lost-found', lostFoundRoutes);
app.use('/api/payment', paymentRoutes);

// Basic Test Route
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW(), (SELECT count(*) FROM stations) as station_count');
    res.json({ 
      status: 'Server is healthy', 
      db_time: result.rows[0].now,
      stations_in_db: result.rows[0].station_count 
    });
  } catch (err) {
    res.status(500).json({ status: 'DB Connection Error', error: err.message });
  }
});



module.exports = app;