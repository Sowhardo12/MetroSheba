const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  console.log("Auth Middleware Hit!"); // Debug log
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract "TOKEN" from "Bearer TOKEN"

  if (!token) return res.status(401).json({ error: "Access denied. Please login." });

  try {
    const verified = jwt.verify(token, 'METRO_SECRET'); // Must match your login secret
    req.user = verified; // This adds the user ID to the 'req' object
    next(); // Move to the controller
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token." });
  }
};

module.exports = authenticateToken;