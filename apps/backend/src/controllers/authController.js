const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });


const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email }, 
    process.env.JWT_SECRET, 
    { expiresIn: '15m' } // Shorter life
  );
  
  const refreshToken = jwt.sign(
    { id: user.id }, 
    process.env.REFRESH_SECRET || 'super_secret_refresh', 
    { expiresIn: '7d' } // Longer life
  );
  
  return { accessToken, refreshToken };
};

const validatePassword = (password) => {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  return regex.test(password);
};


const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
         return res.status(400).json({ error: "All fields are required" });
    } 
    //password validation
    if(!validatePassword(password)){
      return res.status(400).json({
         error: "Password must be at least 8 chars and include uppercase, lowercase, number, and special character",
      });
    }
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
        // const token = jwt.sign({ id: user.id }, 'METRO_SECRET', { expiresIn: '1h' });  old way
        //access and refresh token system  calling function
        const { accessToken, refreshToken } = generateTokens(user);
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, //prevents client js from access cookie by document.cookie ; prevent XSS attacks
            secure: false, // Only over HTTPS in production works
            sameSite: 'Lax',  //prevent CSRF
             maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
           });

        res.json({ accessToken, user: { name: user.name, email: user.email, balance: user.balance } });
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

const refreshToken = async (req, res) => {
  // 1. Get the refresh token from the cookie
  const refreshToken = req.cookies.refreshToken;
  console.log(req.cookies)
  if (!refreshToken) {
    return res.status(401).json({ error: "Access Denied. No refresh token provided." });
  }

  try {
    // 2. Verify the refresh token
    // Note: Use a separate REFRESH_SECRET in your .env for better security
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET || 'super_secret_refresh');

    // 3. Generate a NEW Access Token (Short-lived)
    const accessToken = jwt.sign(
      { id: decoded.id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '15m' }
    );

    // 4. Send it back to the frontend
    res.json({ accessToken });
  } catch (err) {
    // If refresh token is expired or tampered with
    res.status(403).json({ error: "Invalid or expired refresh token. Please login again." });
  }
};


module.exports = { register, login, getMe, refreshToken };
