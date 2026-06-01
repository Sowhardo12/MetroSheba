const { Pool } = require('pg');
const { getMockStatus } = require('../utils/simulation');
const fareMatrix = require('../data/fare');

let openConnections = [];


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


// 1. Establish live stream event emitter
const streamUpdates = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // Grab latest saved station statuses from your Neon DB
    const result = await pool.query('SELECT id, name, grid_x AS "gridX", grid_y AS "gridY", status, notice FROM metro_stations ORDER BY CAST(id AS INTEGER) ASC');
    
    // Immediately send current database conditions to the new listener
    res.write(`data: ${JSON.stringify(result.rows)}\n\n`);
    openConnections.push(res);
  } catch (error) {
    console.error("Database streaming read failure:", error);
  }

  req.on('close', () => {
    openConnections = openConnections.filter(client => client !== res);
  });
};

// 2. Admin secret modification processor
const updateStationStatus = async (req, res) => {
  const { id, status, notice } = req.body;

  try {
    // Persist changes into Postgres
    await pool.query(
      'UPDATE metro_stations SET status = $1, notice = $2 WHERE id = $3',
      [status, notice, id]
    );

    // Fetch the entire fresh table configuration to broadcast
    const updatedResult = await pool.query('SELECT id, name, grid_x AS "gridX", grid_y AS "gridY", status, notice FROM metro_stations ORDER BY CAST(id AS INTEGER) ASC');

    // Broadcast the synchronized updates down the streaming tubes to every commuter
    openConnections.forEach(client => {
      client.write(`data: ${JSON.stringify(updatedResult.rows)}\n\n`);
    });

    return res.status(200).json({ success: true, message: 'Broadcast complete' });
  } catch (error) {
    console.error("Database status injection failure:", error);
    return res.status(500).json({ success: false, error: 'Internal Database Error' });
  }
};


module.exports = { getAllStations, calculateFare, streamUpdates, updateStationStatus };