const { Pool } = require('pg');
const { generateEmbedding, getGroqChatResponse } = require('../services/aiService');
const { createClient } = require('redis');

const pool = new Pool({ connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') || process.env.NODE_ENV === 'production'
  ? {rejectUnauthorized: false} : false
 });

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6329',
  socket: {
    // This tells node-redis to accept the encrypted TLS connection stream safely
    tls: true,
    rejectUnauthorized: false // Helps avoid handshake failures across distributed Render networks
  }
});

redisClient.on('error', err => console.error('Redis Client Error', err));

(async () => {
  await redisClient.connect();
  console.log('Connected to Secure Upstash Redis Cache successfully!');
})();


const handleChat = async (req,res)=>{
  const {message} = req.body;
  if(!message){
    return res.status(400).json({error:"Message is required"});
  }
  //adding guard rail against huge chunk msg
  if (message.length > 200) {
    return res.status(400).json({ 
      error: "Message too long. Please keep your question under 500 characters." 
    });
  }
  console.log("message length is OK")
  const cacheKey = `chat:${message.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~?]/g, "").trim()}`;
  try{
    const cachedResponse = await redisClient.get(cacheKey);
    if (cachedResponse) {
      console.log(`[Redis Cache Hit] Serving data instantly`);
      // Redis only stores strings, so we must parse it back into a JSON object
      return res.json(JSON.parse(cachedResponse));
    }
    console.log("redis cache miss!")

    console.log(`[Redis Cache Miss] Proceeding to Neon DB and Groq API`);
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
    //may delete
    const finalResponse = { reply, context_used: dbResult.rows };
    //add to redis
    await redisClient.set(cacheKey, JSON.stringify(finalResponse), {
      EX: 3600 
    });
    // res.json({
    //   reply,
    //   context_used: dbResult.rows   //showing result 
    // });
    res.json(finalResponse);
  }catch(err){
    console.error("CHAT ERROR: ",err.message);
    res.status(500).json({error: "AI not working somehow, Try again"})
  }
};

module.exports = {handleChat};