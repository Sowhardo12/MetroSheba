const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/aiController');
// const rateLimit = require('express-rate-limit');

// const chatLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10, // Limit each IP to 10 chat requests per window
//   message: { reply: "You've asked too many questions! Take a breath and try again in 15 minutes." }
// });
// POST /api/ai/chat
router.post('/chat',handleChat);

module.exports = router;