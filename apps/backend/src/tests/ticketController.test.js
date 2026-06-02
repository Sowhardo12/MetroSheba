const request = require('supertest');
const Express = require('express');
const { buyTicket, getUserTickets } = require('../controllers/ticketController');

// 1. Setup a highly interactive mock for 'pg' pool and client transactions
const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};

jest.mock('pg', () => {
  const mPool = {
    connect: jest.fn(() => Promise.resolve(mockClient)),
    query: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

const { Pool } = require('pg');
const pool = new Pool();

// 2. Set up the mock Express app shell
const app = Express();
app.use(Express.json());
app.use((req, res, next) => {
  req.user = { id: 42 }; // Mocked User ID
  next();
});

app.post('/tickets/buy', buyTicket);
app.get('/tickets/history', getUserTickets);

describe('Ticket Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buyTicket', () => {
    // TEST CASE 1: Successful Ticket Purchase
    it('should successfully buy a ticket when balance is sufficient and no recent purchases exist', async () => {
      mockClient.query
        .mockResolvedValueOnce({}) // 1. For 'BEGIN'
        .mockResolvedValueOnce({ rows: [] }) // 2. For 'SELECT... tickets where created_at > 2 mins' (No recent tickets)
        .mockResolvedValueOnce({ rows: [{ balance: 100.00 }] }) // 3. For 'SELECT balance FROM users...' (Sufficient balance)
        .mockResolvedValueOnce({}) // 4. For 'UPDATE users SET balance...'
        .mockResolvedValueOnce({  // 5. For 'INSERT INTO tickets...'
          rows: [{ id: 1, qr_code_data: 'TICKET-42-123456-1-5-20', fare: 20 }]
        })
        .mockResolvedValueOnce({}); // 6. For 'COMMIT'

      const response = await request(app)
        .post('/tickets/buy')
        .send({ from_station: 1, to_station: 5, fare: 20 });

      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        qr_code_data: 'TICKET-42-123456-1-5-20',
        fare: 20
      });
    });

    // TEST CASE 2: Rate Limiting / Cooldown block
    it('should throw an error and rollback if a ticket was bought in the last 2 minutes', async () => {
      mockClient.query
        .mockResolvedValueOnce({}) // 1. For 'BEGIN'
        .mockResolvedValueOnce({   // 2. For recent ticket check -> Found a recent ticket!
          rows: [{ id: 99, created_at: '2026-06-02T10:00:00Z' }]
        })
        .mockResolvedValueOnce({}); // 3. For 'ROLLBACK'

      const response = await request(app)
        .post('/tickets/buy')
        .send({ from_station: 1, to_station: 5, fare: 20 });

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toContain('You already have an active ticket');
    });

    // TEST CASE 3: Insufficient Funds block
    it('should throw an error and rollback if user balance is lower than ticket fare', async () => {
      mockClient.query
        .mockResolvedValueOnce({}) // 1. For 'BEGIN'
        .mockResolvedValueOnce({ rows: [] }) // 2. No recent tickets
        .mockResolvedValueOnce({ rows: [{ balance: 5.00 }] }) // 3. Low balance!
        .mockResolvedValueOnce({}); // 4. For 'ROLLBACK'

      const response = await request(app)
        .post('/tickets/buy')
        .send({ from_station: 1, to_station: 5, fare: 20 }); // Costs 20, but user only has 5

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('Insufficient balance');
    });
  });

  describe('getUserTickets (Dashboard History)', () => {
    // TEST CASE 4: Successfully fetching dashboard ticket lists
    it('should return a list of recent tickets for the dashboard history', async () => {
      const mockTickets = [
        { id: 1, from_station_name: 'Uttara North', to_station_name: 'Motijheel', fare: 60 },
        { id: 2, from_station_name: 'Pallabi', to_station_name: 'Farmgate', fare: 30 }
      ];

      // getUserTickets does not use 'client.query' because it isn't a transaction.
      // It calls 'pool.query' directly, so we mock pool.query instead.
      pool.query.mockResolvedValueOnce({ rows: mockTickets });

      const response = await request(app).get('/tickets/history');

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM tickets t'),
        [42] // Verifying it queries using the correct authenticated user ID
      );
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockTickets);
    });

    // TEST CASE 5: Server / Database Connection Crash
    it('should return a 500 error status code if database fails to fetch', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database disconnected'));

      const response = await request(app).get('/tickets/history');

      expect(response.statusCode).toBe(500);
      expect(response.body.error).toBe('Failed to fetch journey history');
    });
  });
});