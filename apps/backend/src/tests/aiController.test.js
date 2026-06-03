const request = require('supertest');
const Express = require('express');

// 1. Mock the Redis library completely BEFORE importing the controller
const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  on: jest.fn(),
};
jest.mock('redis', () => ({
  createClient: jest.fn(() => mockRedisClient)
}));

// 2. Mock the pg library for database querying
const mockPool = {
  query: jest.fn(),
};
jest.mock('pg', () => ({
  Pool: jest.fn(() => mockPool)
}));

// 3. Mock internal AI service functions
jest.mock('../services/aiService', () => ({
  generateEmbedding: jest.fn(),
  getGroqChatResponse: jest.fn(),
}));

// Now safely import your code wrappers
const { handleChat } = require('../controllers/aiController');
const { generateEmbedding, getGroqChatResponse } = require('../services/aiService');

// Express App Scaffold for integration verification
const app = Express();
app.use(Express.json());
app.post('/api/ai/chat', handleChat);

describe('AI Controller - Test Suites', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- CASE 1: INPUT LIMITS ---
  it('should return 400 and protect pipeline if message length exceeds 200 characters', async () => {
    const maliciousAttackString = 'a'.repeat(201);

    const response = await request(app)
      .post('/api/ai/chat')
      .send({ message: maliciousAttackString });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toContain('Message too long');
    // Ensure it was blocked right at the gate
    expect(mockRedisClient.get).not.toHaveBeenCalled();
  });

  // --- CASE 2: CACHE HIT ---
  it('should return cached response instantly on a Redis Cache Hit', async () => {
    const mockCachedPayload = {
      reply: "The National Museum is near Shahbagh.",
      context_used: [{ landmark_name: "National Museum", official_station_name: "Shahbagh" }]
    };
    
    // Simulate Redis finding the item in memory
    mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(mockCachedPayload));

    const response = await request(app)
      .post('/api/ai/chat')
      .send({ message: "Where is the museum?" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockCachedPayload);
    
    // Ensure it short-circuited and skipped Neon DB / Groq calls
    expect(generateEmbedding).not.toHaveBeenCalled();
    expect(mockPool.query).not.toHaveBeenCalled();
  });

  // --- CASE 3: CACHE MISS ---
  it('should hit DB and LLM on a cache miss, then populate the cache', async () => {
    // 1. Redis lookup fails (returns null)
    mockRedisClient.get.mockResolvedValueOnce(null);
    
    // 2. Mock downstream resolutions
    generateEmbedding.mockResolvedValueOnce([0.1, 0.2, 0.3]);
    mockPool.query.mockResolvedValueOnce({
      rows: [{ landmark_name: "National Museum", description: "Artifacts", official_station_name: "Shahbagh" }]
    });
    getGroqChatResponse.mockResolvedValueOnce("Take the train to Shahbagh for the museum.");

    const response = await request(app)
      .post('/api/ai/chat')
      .send({ message: "Where is the museum" });

    // Assertions
    expect(response.statusCode).toBe(200);
    expect(response.body.reply).toBe("Take the train to Shahbagh for the museum.");
    expect(response.body.context_used).toHaveLength(1);

    // Verify cache key cleaning logic rules stripped punctuation and updated Redis
    expect(mockRedisClient.set).toHaveBeenCalledWith(
      "chat:where is the museum", // Stripped trailing question mark/formatting symbols
      JSON.stringify({
        reply: "Take the train to Shahbagh for the museum.",
        context_used: [{ landmark_name: "National Museum", description: "Artifacts", official_station_name: "Shahbagh" }]
      }),
      { EX: 3600 }
    );
  });

  // --- CASE 4: EXCEPTION GRACEFUL FAILURE ---
  it('should catch runtime exceptions gracefully and throw a 500 status code', async () => {
    mockRedisClient.get.mockRejectedValueOnce(new Error("Redis exploded"));

    const response = await request(app)
      .post('/api/ai/chat')
      .send({ message: "Test error handling stability" });

    expect(response.statusCode).toBe(500);
    expect(response.body.error).toContain("AI not working somehow");
  });
});