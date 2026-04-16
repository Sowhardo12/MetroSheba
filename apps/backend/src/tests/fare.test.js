const request = require('supertest');
const app = require('../app'); 

describe('Metro Fare API', () => {
  //test multi station gap
  test('GET /api/stations/fare - Success Case', async () => {
    const response = await request(app)
      .get('/api/stations/fare')
      .query({ startId: '1', endId: '4' }); // Uttara North to Pallabi

    expect(response.status).toBe(200);
    expect(response.body.fare).toBe(30);
    expect(response.body.stops).toBe(3);
  });
  //test same station
  test('GET /api/stations/fare - Same Station', async () => {
    const response = await request(app)
      .get('/api/stations/fare')
      .query({ startId: '1', endId: '1' });

    expect(response.body.fare).toBe(0);
  });
  //test both invalid station
  test('GET /api/stations/fare - Invalid IDs', async () => {
    const response = await request(app)
      .get('/api/stations/fare')
      .query({ startId: '99', endId: '100' });

    expect(response.status).toBe(404);
  });
  //test one invalid id
  test('GET /api/stations/fare - one Invalid ID', async () => {
    const response = await request(app)
      .get('/api/stations/fare')
      .query({ startId: '-12', endId: '12' });

    expect(response.status).toBe(404);
  });
});