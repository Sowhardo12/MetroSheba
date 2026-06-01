const { Pool } = require('pg');
const { getMockStatus } = require('../utils/simulation');
const fareMatrix = require('../data/fare');

let sharedStations = [
  { id: '1', name: 'Uttara North', gridX: 80, gridY: 150, status: 'normal', notice: '' },
  { id: '2', name: 'Uttara Center', gridX: 230, gridY: 150, status: 'normal', notice: '' },
  { id: '3', name: 'Uttara South', gridX: 380, gridY: 150, status: 'normal', notice: '' },
  { id: '4', name: 'Pallabi', gridX: 530, gridY: 150, status: 'normal', notice: '' },
  { id: '5', name: 'Mirpur 11', gridX: 680, gridY: 150, status: 'normal', notice: '' },
  { id: '6', name: 'Mirpur 10', gridX: 830, gridY: 150, status: 'normal', notice: '' },
  { id: '7', name: 'Kazipara', gridX: 980, gridY: 150, status: 'normal', notice: '' },
  { id: '8', name: 'Shewrapara', gridX: 1130, gridY: 150, status: 'normal', notice: '' },
  { id: '9', name: 'Agargaon', gridX: 1280, gridY: 150, status: 'normal', notice: '' },
  { id: '10', name: 'Bijoy Sarani', gridX: 1430, gridY: 150, status: 'normal', notice: '' },
  { id: '11', name: 'Farmgate', gridX: 1580, gridY: 150, status: 'normal', notice: '' },
  { id: '12', name: 'Karwan Bazar', gridX: 1730, gridY: 150, status: 'normal', notice: '' },
  { id: '13', name: 'Shahbagh', gridX: 1880, gridY: 150, status: 'normal', notice: '' },
  { id: '14', name: 'Dhaka University', gridX: 2030, gridY: 150, status: 'normal', notice: '' },
  { id: '15', name: 'Secretariat', gridX: 2180, gridY: 150, status: 'normal', notice: '' },
  { id: '16', name: 'Motijheel', gridX: 2330, gridY: 150, status: 'normal', notice: '' },
];
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


const streamUpdates = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*'); // Prevent CORS blocks

  // Send current data immediately on connection
  res.write(`data: ${JSON.stringify(sharedStations)}\n\n`);
  openConnections.push(res);

  req.on('close', () => {
    openConnections = openConnections.filter(client => client !== res);
  });
};

// Receive updates from dev panel and broadcast to all users
const updateStationStatus = (req, res) => {
  const { id, status, notice } = req.body;

  sharedStations = sharedStations.map(station => 
    station.id === id ? { ...station, status, notice } : station
  );

  // Send the updated data to EVERYONE connected
  openConnections.forEach(client => {
    client.write(`data: ${JSON.stringify(sharedStations)}\n\n`);
  });

  res.status(200).json({ success: true });
};


module.exports = { getAllStations, calculateFare, streamUpdates, updateStationStatus };