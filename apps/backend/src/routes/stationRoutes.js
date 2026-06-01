const express = require('express');
const router = express.Router();
const { getAllStations,calculateFare,streamUpdates,updateStationStatus } = require('../controllers/stationController');
router.get('/', getAllStations);
router.get('/fare',calculateFare);
router.get('/live-stream', streamUpdates);
router.post('/update', updateStationStatus);
module.exports = router;