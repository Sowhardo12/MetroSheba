const request = require('supertest');
const Express = require('express');
const { handlePunch } = require('../controllers/gateController');

// 1. Mock the 'pg' module so it doesn't connect to Neon DB during tests
jest.mock('pg', () => {
  const mClient = {
    query: jest.fn(),
    release: jest.fn(),
  };
  const mPool = {
    query: jest.fn(),
    connect: jest.fn(() => Promise.resolve(mClient)),
  };
  return { Pool: jest.fn(() => mPool) };
});

// Import the mocked pool instances to manipulate their return values
const { Pool } = require('pg');
const pool = new Pool();

// 2. Set up a mini Express app to run the controller
const app = Express();
app.use(Express.json());
// Mock user authentication middleware
app.use((req, res, next) => {
  req.user = { id: 42 }; // Mocked User ID
  next();
});
app.post('/gate/punch', handlePunch); //it hits the handlePunch function which takes id, currentStationid and QR data

describe('Gate Controller - handlePunch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TEST CASE 1: Validation Check
  it('should return 400 if QR format is invalid', async () => {
    const response = await request(app)
      .post('/gate/punch')
      .send({
        qrData: 'INVALID-QR-FORMAT',
        currentStationId: 1
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid QR format' });
  });

  // TEST CASE 2: Successful Punch In (Entry Logic)
  it('should successfully punch in a user if ticket is active and at correct station', async () => {
    // Simulate DB response for finding an active ticket
    // QR format: TICKET-userId-timestamp-from-to-fare (e.g. from station 1 to station 5)
    const validQr = 'TICKET-42-1717320000-1-5-20'; 
    
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 101, status: 'active', qr_code_data: validQr, user_id: 42 }]
    });

    const response = await request(app)
      .post('/gate/punch')
      .send({
        qrData: validQr,
        currentStationId: 1 // Matching the 'from' station in QR
      });

    // Check that database update statement was triggered correctly
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE tickets SET status = $1'),
      ['in-transit', 1, 101]
    );
    
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toContain('Entry Successful');
  });

  // TEST CASE 3: Wrong Station Entry
  it('should block entry if user tries to punch in at the wrong station', async () => {
    const validQr = 'TICKET-42-1717320000-1-5-20'; // From station 1
    
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 101, status: 'active', qr_code_data: validQr, user_id: 42 }]
    });

    const response = await request(app)
      .post('/gate/punch')
      .send({
        qrData: validQr,
        currentStationId: 3 // But entering at station 3
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toContain('Must enter at Station 1');
  });
});

// TEST CASE 4: motijhil to uttora Route - Exiting one station ahead (current < destination)
  it('should deduct penalty and grant exit on Uttara-Motijhil route when exiting a station ahead', async () => {
    // Route: Station 10 -> Station 5. Exiting ahead at Station 4.
    // current (4) != destination (5) AND current (4) < destination (5) -> triggers penalty
    const validQr = 'TICKET-42-1717320000-10-5-40'; 
    const currentStation = 4;
    const extraStops = Math.abs(currentStation - 5); // 1 stop
    const expectedPenalty = extraStops * 10; // 10 Tk

    // Mock initial ticket search
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 101, status: 'in-transit', qr_code_data: validQr, user_id: 42 }]
    });

    // Get the client mock for the transaction
    const mClient = await pool.connect();
    // Mock user balance inquiry inside transaction
    mClient.query.mockResolvedValueOnce({}) // For 'BEGIN'
                 .mockResolvedValueOnce({ rows: [{ balance: 100 }] }); // For 'SELECT balance ...'

    const response = await request(app)
      .post('/gate/punch')
      .send({
        qrData: validQr,
        currentStationId: currentStation
      });

    // Verify penalty deduction query was made with calculated penalty
    expect(mClient.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE users SET balance = balance - $1'),
      [expectedPenalty, 42]
    );

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toContain(`Penalty of ৳${expectedPenalty} deducted`);
  });

  // TEST CASE 5: Uttora to Motijhil Route - Exiting one station ahead (current > destination)
  it('should deduct penalty and grant exit on Motijhil-Uttara route when exiting a station ahead', async () => {
    // Route: Station 1 -> Station 5. Exiting ahead at Station 6.
    // current (6) != destination (5) AND current (6) > destination (5) -> triggers penalty
    const validQr = 'TICKET-42-1717320000-1-5-20'; 
    const currentStation = 6;
    const extraStops = Math.abs(currentStation - 5); // 1 stop
    const expectedPenalty = extraStops * 10; // 10 Tk

    // Mock initial ticket search
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 101, status: 'in-transit', qr_code_data: validQr, user_id: 42 }]
    });

    // Get the client mock for the transaction
    const mClient = await pool.connect();
    // Mock transaction operations
    mClient.query.mockResolvedValueOnce({}) // For 'BEGIN'
                 .mockResolvedValueOnce({ rows: [{ balance: 50 }] }); // For 'SELECT balance ...'

    const response = await request(app)
      .post('/gate/punch')
      .send({
        qrData: validQr,
        currentStationId: currentStation
      });

    // Verify database update statements executed
    expect(mClient.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE tickets SET status = $1'),
      ['completed', currentStation, 101]
    );

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toContain(`Penalty of ৳${expectedPenalty} deducted`);
  });