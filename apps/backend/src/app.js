const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors'); // 1. Import CORS
const { Pool } = require('pg');
require('dotenv').config();
const stationRoutes = require('./routes/stationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const lostFoundRoutes = require('./routes/lostFoundRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
// const rateLimit = require('express-rate-limit');
const app = express();

// PostgreSQL Connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max:30,
  ssl: process.env.DATABASE_URL.includes('neon.tech') || process.env.NODE_ENV === 'production'
  ? {rejectUnauthorized: false} : false
 });

// //general Rate limiter
//  const generalLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, 
//   max: 100, 
//   message: { message: "Too many requests from this IP, please try again later." },
//   standardHeaders: true, 
//   legacyHeaders: false,
// });
// //a second check for LLM API call
// const aiChatLimiter = rateLimit({
//   windowMs: 1 * 60 * 1000, 
//   max: 5, 
//   message: { message: "Chat limit reached. Please wait a minute before sending more messages." },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

//middlewares must run with each request 
app.use(cookieParser());
// app.use(generalLimiter);
app.use(express.json());


app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


app.use('/api/stations', stationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/lost-found', lostFoundRoutes);
app.use('/api/payment', paymentRoutes);

// Basic Test Route
app.get('/api/health', async (req, res) => {
  try {
    console.log(pool.totalCount, pool.idleCount, pool.waitingCount);
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