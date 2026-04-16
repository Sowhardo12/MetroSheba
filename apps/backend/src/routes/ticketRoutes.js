const express = require('express');
const router = express.Router();
const { buyTicket,getUserTickets } = require('../controllers/ticketController');
const authenticateToken = require('../middleware/authMiddleware'); //The middleware that checks user

// Protect this route with JWT middleware
router.post('/buy', authenticateToken, buyTicket);
router.get('/my-tickets',authenticateToken,getUserTickets);
module.exports = router;