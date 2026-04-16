const express = require('express');
const router = express.Router();
const { getAllStations,calculateFare } = require('../controllers/stationController');
router.get('/', getAllStations);
router.get('/fare',calculateFare);
module.exports = router;