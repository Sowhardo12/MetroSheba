const express = require('express');
const router = express.Router();
const { topUpBalance } = require('../controllers/paymentController');
const authenticateToken = require('../middleware/authMiddleware'); //The middleware that checks user

// Protect this route with JWT middleware
router.post('/topup', authenticateToken, topUpBalance);
module.exports = router;