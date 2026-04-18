const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') || process.env.NODE_ENV === 'production'
  ? {rejectUnauthorized: false} : false
 });

const buyTicket = async (req, res) => {
  const { from_station, to_station, fare } = req.body;
  const userId = req.user.id; // From JWT middleware

  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Start Transaction
    //check for recent buy in last 2 mins
    const recentTicket = await client.query(
      `SELECT id, created_at FROM tickets 
       WHERE user_id = $1 
       AND created_at > (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '2 minutes')
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    if (recentTicket.rows.length > 0) {
      throw new Error("You already have an active ticket. Please wait 2 minutes.");
    }
    // 1. Check Balance
    const userRes = await client.query('SELECT balance FROM users WHERE id = $1 FOR UPDATE', [userId]);
    if (userRes.rows[0].balance < fare) throw new Error("Insufficient balance");

    // 2. Deduct Balance
    await client.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [fare, userId]);

    // 3. Create Ticket
    const qrData = `TICKET-${userId}-${Date.now()}-${from_station}-${to_station}-${fare}`;   //modified 
    const ticketRes = await client.query(
      'INSERT INTO tickets (user_id, from_station, to_station, fare, qr_code_data) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, from_station, to_station, fare, qrData]
    );

    await client.query('COMMIT'); // Finish Transaction
    // res.json(ticketRes.rows[0]);
    res.json({
    id: ticketRes.rows[0].id,
    qr_code_data: ticketRes.rows[0].qr_code_data, // Ensure this matches FRONTEND spelling
    fare: ticketRes.rows[0].fare
});
  } catch (err) {
    await client.query('ROLLBACK'); // Cancel everything if error
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
};

//to show in dashboard 

const getUserTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT t.*, 
              (t.created_at AT TIME ZONE 'UTC') as created_at,
              s1.name as from_station_name, 
              s2.name as to_station_name 
       FROM tickets t
       JOIN stations s1 ON t.from_station = s1.id
       JOIN stations s2 ON t.to_station = s2.id
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC 
       LIMIT 5`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch journey history" });
  }
};

module.exports = { buyTicket, getUserTickets }; 