const { Pool } = require('pg');
const { generateEmbedding, getGroqChatResponse } = require('../services/aiService');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const handleChat = async (req,res)=>{
  const {message} = req.body;
  if(!message){
    return res.status(400).json({error:"Message is required"});
  }
  try{
    const queryVector = await generateEmbedding(message);
    //make changes  :old
    // const dbResult = await pool.query(
    //   `SELECT landmark_name,description,(embedding <=> $1::vector) as distance
    //   from landmark_knowledge
    //   order by distance asc limit 2`,[JSON.stringify(queryVector)]
    // );    //may add JSON.stringigy(queryVector) if not work

    //new 
    const dbResult = await pool.query(
      `select l.landmark_name, l.description,s.name as official_station_name
      from landmark_knowledge l
      JOIN stations s on l.station_id=s.id
      order by l.embedding <=> $1::vector ASC limit 2`,[JSON.stringify(queryVector)]
    );

    // const context = dbResult.rows.length>0 ? 
    // dbResult.rows.map(r=>`${r.landmark_name}: ${r.description}`).join("\n") :
    // "No specific stations were found";

    const context = dbResult.rows.map(r => 
      `Landmark: ${r.landmark_name} is served by Official Station: ${r.official_station_name}. Info: ${r.description}`
    ).join("\n");
    const reply = await getGroqChatResponse(message,context);
    res.json({
      reply,
      context_used: dbResult.rows   //showing result 
    });
  }catch(err){
    console.error("CHAT ERROR: ",err.message);
    res.status(500).json({error: "AI not working somehow, Try again"})
  }
};

module.exports = {handleChat};