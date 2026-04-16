const { Groq } = require("groq-sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");
// require('dotenv').config();
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

//API keys injection from .env file
const groq = new Groq({ apiKey:process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateEmbedding = async (text) =>{
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-2-preview" });
  const result = await model.embedContent({
    content: {parts:[{text}]},
    taskType: "RETRIEVAL_DOCUMENT"
  });
  return result.embedding.values;
}

const getGroqChatResponse = async (userQuery, context) => {
  const prompt = `
    ROLE: You are "MetroSheba AI", the official Dhaka MRT-6 assistant.
    STRICT RULE 1: Try to use the provided Context to answer. 
    STRICT RULE 2: If the Context mentions a station name (e.g., Shahbagh), use EXACTLY that name. 
    STRICT RULE 3: Answer shortly and concisely.
    STRICT RULE 4: If you don't find the answer in the Context, first try
    to find that answer based on authentic searches keeping mind of Dhaka city, Bangladesh and Important places
    in Dhaka City, if u cant then say "I'm sorry, I don't have information about that location in my Metro database yet."
    
    Context:
    ${context}
    
    Guidelines:
    
    - Be polite and very shortly mention the specific Dahak Metro Rail (MRT LINE-6) station.

    User Question: ${userQuery}
  `;

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
  });

  return response.choices[0].message.content;
};


//testing functions
async function testGroq() {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Say 'Hi' and nothing else" }],
      model: "llama-3.1-8b-instant", // Standard fast model
    });

    console.log("Groq Response:", chatCompletion.choices[0]?.message?.content);
  } catch (error) {
    console.error("Groq Error:", error.message);
  }
}

async function testGemini() {
  try {
    // 1. Use the correct 2026 Model ID
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-2-preview" });

    // 2. Modern syntax often prefers specifying the task type (e.g., RETRIEVAL_QUERY or CLASSIFICATION)
    const result = await model.embedContent({
      content: { parts: [{ text: "Testing my 2026 multimodal embeddings." }] },
      taskType: "RETRIEVAL_QUERY" 
    });

    const embedding = result.embedding;

    console.log("Gemini Success!");
    console.log("Vector Dimensions:", embedding.values.length); // Should be 3072
    console.log("First few values:", embedding.values.slice(0, 3));

  } catch (error) {
    console.error("Gemini Error:", error.message);
    
    // If it STILL 404s, try the last remaining stable alias:
    console.log("Try one last fallback: 'text-embedding-005' if 'gemini-embedding-2-preview' fails.");
  }
}

// async function runTests() {
//   console.log("--- Starting API Tests ---");
//   await testGroq();
//   await testGemini();
//   console.log("--- Tests Complete ---");
// }
// runTests();


module.exports = { generateEmbedding, getGroqChatResponse };