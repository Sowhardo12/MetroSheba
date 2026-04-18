const request = require('supertest');
const app = require('../app');
const { Pool } = require('pg');

// Mocking pg Pool
jest.mock('pg', () => {
  const mClient = {
    query: jest.fn(),
    release: jest.fn(),
  };
  const mPool = {
    query: jest.fn(),
    connect: jest.fn(() => mClient),
  };
  return { Pool: jest.fn(() => mPool) };
});

describe('Gate System API - handlePunch', () => {
  let pool;
  let client;

  beforeEach(() => {
    pool = new Pool();
    client = pool.connect();
    jest.clearAllMocks();
  });

  // 1. Test Entry Logic (Punch In)
  test('POST /api/tickets/punch - Successful Entry', async () => {
    const mockTicket = {
      id: 101,
      status: 'active',
      qr_code_data: 'TICKET-1-12345-1-5-40'
    };

    pool.query.mockResolvedValueOnce({ rows: [mockTicket] }); // Ticket lookup
    pool.query.mockResolvedValueOnce({}); // Update status

    const response = await request(app)
      .post('/api/gate/punch')
      .send({
        qrData: 'TICKET-1-12345-1-5-40',
        currentStationId: '1'
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toContain("Entry Successful");
  });

  // 2. Test Invalid Station Entry
  test('POST /api/gate/punch - Wrong Entry Station', async () => {
    const mockTicket = {
      id: 101,
      status: 'active',
      qr_code_data: 'TICKET-1-12345-1-5-40'
    };

    pool.query.mockResolvedValueOnce({ rows: [mockTicket] });

    const response = await request(app)
      .post('/api/gate/punch')
      .send({
        qrData: 'TICKET-1-12345-1-5-40',
        currentStationId: '2' // Trying to enter at station 2 instead of 1
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Must enter at Station 1");
  });

  // 3. Test Normal Exit (Punch Out)
  test('POST /api/gate/punch - Successful Exit', async () => {
    const mockTicket = {
      id: 101,
      status: 'in-transit',
      qr_code_data: 'TICKET-1-12345-1-5-40'
    };

    pool.query.mockResolvedValueOnce({ rows: [mockTicket] }); // Ticket lookup
    pool.query.mockResolvedValueOnce({}); // Update status to completed

    const response = await request(app)
      .post('/api/gate/punch')
      .send({
        qrData: 'TICKET-1-12345-1-5-40',
        currentStationId: '5'
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toContain("Exit Successful");
  });

  // 4. Test Over-travel Penalty Logic
  test('POST /api/gate/punch - Exit with Penalty (Insufficient Balance)', async () => {
    const mockTicket = {
      id: 101,
      status: 'in-transit',
      qr_code_data: 'TICKET-1-12345-1-3-20' // Ends at station 3
    };

    pool.query.mockResolvedValueOnce({ rows: [mockTicket] }); // Ticket lookup
    
    // Transaction mocks
    client.query.mockResolvedValueOnce({}); // BEGIN
    client.query.mockResolvedValueOnce({ rows: [{ balance: 5 }] }); // SELECT balance (Too low)
    client.query.mockResolvedValueOnce({}); // ROLLBACK

    const response = await request(app)
      .post('/api/gate/punch')
      .send({
        qrData: 'TICKET-1-12345-1-3-20',
        currentStationId: '5' // Over-traveled to station 5
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Insufficient balance for journey adjustment");
  });

  // 5. Test Ticket Already Used
  test('POST /api/gate/punch - Ticket Already Completed', async () => {
    const mockTicket = {
      id: 101,
      status: 'completed',
      qr_code_data: 'TICKET-1-12345-1-5-40'
    };

    pool.query.mockResolvedValueOnce({ rows: [mockTicket] });

    const response = await request(app)
      .post('/api/gate/punch')
      .send({
        qrData: 'TICKET-1-12345-1-5-40',
        currentStationId: '5'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Ticket already used");
  });
});