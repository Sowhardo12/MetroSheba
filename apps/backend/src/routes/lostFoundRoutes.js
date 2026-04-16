const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Get all items
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT l.*, s.name as station_name FROM lost_found l JOIN stations s ON l.station_id = s.id ORDER BY created_at DESC');
  res.json(result.rows);
});

// Report item
router.post('/', async (req, res) => {
  const { item_name, description, station_id } = req.body;
  // We'll hardcode reported_by for now or use req.user.id if logged in
  await pool.query(
    'INSERT INTO lost_found (item_name, description, station_id) VALUES ($1, $2, $3)',
    [item_name, description, station_id]
  );
  res.sendStatus(201);
});

module.exports = router;