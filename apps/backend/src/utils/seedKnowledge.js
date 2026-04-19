// require('dotenv').config();
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { Pool } = require('pg');
const { generateEmbedding } = require('../services/aiService');

const pool = new Pool({ connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') || process.env.NODE_ENV === 'production'
  ? {rejectUnauthorized: false} : false
 });

const dhakaLandmarks = [
  // Original 5
  { name: "National Museum", station: "Shahbagh", desc: "Located right at Shahbagh, a 2-minute walk." },
  { name: "Bashundhara City", station: "Karwan Bazar", desc: "Use Karwan Bazar station; it is a short rickshaw ride or walk to Panthapath." },
  { name: "Dhaka University (TSC)", station: "Dhaka University", desc: "The station is located right at the TSC area." },
  { name: "Bangladesh Secretariat", station: "Secretariat", desc: "The station is located near the Press Club and Secretariat." },
  { name: "Motijheel Shapla Chattar", station: "Motijheel", desc: "This is the terminal station for MRT-6." },
  
  // New 9 added to reach 14 total
  { name: "Diabari Canal / Park", station: "Uttara North", desc: "A popular open space for scenery, located right near the starting terminal." },
  { name: "National Cricket Academy", station: "Mirpur 10", desc: "Located near the Mirpur 10 roundabout, a short walk from the station." },
  { name: "Military Museum", station: "Bijoy Sarani", desc: "One of the most modern museums in the city, situated adjacent to the station exit." },
  { name: "Novo Theatre", station: "Bijoy Sarani", desc: "The planetarium is located just a few minutes walk from the Bijoy Sarani station." },
  { name: "Ananda Cinema Hall", station: "Farmgate", desc: "An iconic landmark at the Farmgate intersection, visible from the station platform." },
  { name: "Khamarbari", station: "Farmgate", desc: "The agricultural hub is right next to the Farmgate station." },
  { name: "National Library", station: "Agargaon", desc: "Located within the Agargaon administrative area, a short distance from the station." },
  { name: "Mirpur 11 Kitchen Market", station: "Mirpur 11", desc: "A major local market hub situated right underneath the metro line." },
  { name: "Baitul Mukarram", station: "Motijheel", desc: "The national mosque is a short walk or rickshaw ride from the Motijheel terminal." },
  { name: "BRAC University", station: "Karwan Bazar", desc: "Get off from Karwan Bazar station, take shared CNG or Chakrakar BUS from hatirjhil and its a 20 mins path to BRAC University in merul badda" },
  { name: "Priyanka Runway City", station: "Uttara Center", desc: "10 mins rickshaw ride from Uttara center station" }
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function seed() {
  console.log("Seeding MetroSheba Knowledge Base...");

  for (const item of dhakaLandmarks) {
    try {
      // 1. Find the station ID
      const stationRes = await pool.query('SELECT id FROM stations WHERE name = $1', [item.station]);
      
      if (stationRes.rows.length === 0) {
        console.warn(`Station not found: ${item.station}`);
        continue;
      }

      const stationId = stationRes.rows[0].id;

      // 2. Generate Embedding
      const vector = await generateEmbedding(`${item.name}: ${item.desc}`);
      // 3. Insert into Database
      await pool.query(
        'INSERT INTO landmark_knowledge (station_id, landmark_name, description, embedding) VALUES ($1, $2, $3, $4)',
        [stationId, item.name, item.desc, JSON.stringify(vector)]
      );

      console.log(`Embedded: ${item.name}`);

      // 4. THE DELAY: Wait 4 seconds before next iteration to respect 15 RPM limit
      console.log("Waiting 4 seconds to respect API limits...");
      await sleep(4000);

    } catch (err) {
      console.error(`Failed ${item.name}:`, err.message);
      // Optional: Wait even if it fails to ensure the next retry doesn't hit a burst limit
      await sleep(2000); 
    }
  }

  console.log("Seeding Complete!");
  process.exit();
}

seed();