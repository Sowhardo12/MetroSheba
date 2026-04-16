const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const topUpBalance = async (req, res) => {
  const { account_number, pin, amount } = req.body;
  const userId = req.user.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const bankRes = await client.query(
      'SELECT * FROM bank_accounts WHERE account_number = $1 AND pin = $2 FOR UPDATE',
      [account_number, pin]
    );

    if (bankRes.rows.length === 0) {
      throw new Error("Invalid Bank Details");
    }

    if (parseFloat(bankRes.rows[0].balance) < parseFloat(amount)) {
      throw new Error("Insufficient Funds in Bank");
    }

    await client.query(
      'UPDATE bank_accounts SET balance = balance - $1 WHERE account_number = $2',
      [amount, account_number]
    );

    const userRes = await client.query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING balance',
      [amount, userId]
    );

    await client.query('COMMIT');  //final commit
    res.json({ message: "Top-up successful!", newBalance: userRes.rows[0].balance });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
};

module.exports = { topUpBalance };