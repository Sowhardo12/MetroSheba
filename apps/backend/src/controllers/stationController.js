const { Pool } = require('pg');
const { getMockStatus } = require('../utils/simulation');
const fareMatrix = require('../data/fare');

const pool = new Pool({ connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') || process.env.NODE_ENV === 'production'
  ? {rejectUnauthorized: false} : false
 });

const getAllStations = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM stations ORDER BY id ASC');
    const simulation = getMockStatus();
    const stationsWithStatus = result.rows.map(station => ({
      ...station,
      lat: parseFloat(station.lat),
      lng: parseFloat(station.lng),
      status: simulation // this would vary per station in future
    }));

    res.json(stationsWithStatus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const calculateFare = (req, res) => {
  const { startId, endId } = req.query;    //sent using request quary
  //logical range check
  if(startId<0 || endId>16) return res.status(404).json({error:"Invalid Stations"});
  const sId = String(startId);
  const eId = String(endId);
  if (sId === eId) return res.json({ fare: 0, stops: 0, message:"Same station" });
  const fare = fareMatrix[sId]?.[eId];
  res.status(200).json({
    fare: fare,
    stops: Math.abs(parseInt(sId) - parseInt(eId))
  });
};


module.exports = { getAllStations, calculateFare };