const request = require('supertest');
const Express = require('express');
const { topUpBalance } = require('../controllers/paymentController');

//  mock for 'pg' client transactions
const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};

jest.mock('pg', () => {
  const mPool = {
    connect: jest.fn(() => Promise.resolve(mockClient)),
  };
  return { Pool: jest.fn(() => mPool) };
});

const { Pool } = require('pg');
const pool = new Pool();

// mock Express server
const app = Express();
app.use(Express.json());
app.use((req, res, next) => {
  req.user = { id: 42 }; // Mocked User ID
  next();
});
app.post('/payment/topup', topUpBalance);

describe('Payment Controller - topUpBalance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TEST CASE 1: Successful Top-Up Transaction
  it('should successfully deduct bank account and top up user balance', async () => {
    // mock the sequential database queries inside the transaction block
    mockClient.query
      .mockResolvedValueOnce({}) // 1. For 'BEGIN'
      .mockResolvedValueOnce({   // 2. For 'SELECT * FROM bank_accounts...'
        rows: [{ account_number: '123456', balance: 500.00 }]
      })
      .mockResolvedValueOnce({}) // 3. For 'UPDATE bank_accounts...'
      .mockResolvedValueOnce({   // 4. For 'UPDATE users... RETURNING balance'
        rows: [{ balance: 150.00 }]
      })
      .mockResolvedValueOnce({}); // 5. For 'COMMIT'

    const response = await request(app)
      .post('/payment/topup')
      .send({
        account_number: '123456',
        pin: '1122',
        amount: 100
      });

    // Asserts
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT'); // Ensure it committed
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: 'Top-up successful!',
      newBalance: 150.00
    });
  });

  // TEST CASE 2: Failure - Invalid Bank Details (Trigger Rollback)
  it('should rollback transaction if bank account details are invalid', async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // 1. For 'BEGIN'
      .mockResolvedValueOnce({   // 2. For 'SELECT...', returning empty rows
        rows: []
      })
      .mockResolvedValueOnce({}); // 3. For 'ROLLBACK'

    const response = await request(app)
      .post('/payment/topup')
      .send({
        account_number: '000000', // Fake account
        pin: '0000',
        amount: 100
      });

    // Asserts
    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK'); // Ensure it rolled back
    expect(mockClient.release).toHaveBeenCalled(); // Ensure client is released back to pool
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Invalid Bank Details');
  });

  // TEST CASE 3: Failure - Insufficient Bank Funds (Trigger Rollback)
  it('should rollback transaction if bank balance is insufficient', async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // 1. For 'BEGIN'
      .mockResolvedValueOnce({   // 2. For 'SELECT...' returning low balance
        rows: [{ account_number: '123456', balance: 20.00 }]
      })
      .mockResolvedValueOnce({}); // 3. For 'ROLLBACK'

    const response = await request(app)
      .post('/payment/topup')
      .send({
        account_number: '123456',
        pin: '1122',
        amount: 100 // Requesting more than the 20.00 available
      });

    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Insufficient Funds in Bank');
  });
});