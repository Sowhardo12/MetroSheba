const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const register = async (req, res) => {
    const { name, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    try {
        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email',
            [name, email, hashed]
        );
        res.json(result.rows[0]);
    } catch (err) { res.status(400).json({ error: "Email already exists" }); }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (user && await bcrypt.compare(password, user.password_hash)) {
        const token = jwt.sign({ id: user.id }, 'METRO_SECRET', { expiresIn: '1h' });
        res.json({ token, user: { name: user.name, email: user.email, balance: user.balance } });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
};

const getMe = async (req, res) => {
  try {
    // req.user.id comes from the middleware we just wrote!
    const result = await pool.query(
      'SELECT id, name, email, balance FROM users WHERE id = $1', 
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { register, login, getMe };
