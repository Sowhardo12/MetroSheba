const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const handlePunch = async (req, res) => {
    const { qrData, currentStationId } = req.body;
    const userId = req.user.id;

    // 1. Extract data from QR String: TICKET-userId-timestamp-from-to-fare
    const parts = qrData.split('-');
    if (parts.length < 6) return res.status(400).json({ error: "Invalid QR format" });

    const [_, ticketUserId, timestamp, fromStation, toStation, paidFare] = parts;
    const ticketId = timestamp; // Using timestamp as a temporary unique identifier or fetch by UID

    try {
        // Fetch current ticket state from DB
        const ticketQuery = await pool.query(
            'SELECT * FROM tickets WHERE qr_code_data = $1 AND user_id = $2', 
            [qrData, userId]
        );
        const ticket = ticketQuery.rows[0];

        if (!ticket) return res.status(404).json({ error: "Ticket not found in system" });
        if (ticket.status === 'completed') return res.status(400).json({ error: "Ticket already used" });

        // 2. ENTRY LOGIC (Punch In)
        if (ticket.status === 'active') {
            if (parseInt(currentStationId) !== parseInt(fromStation)) {
                return res.status(400).json({ error: `Must enter at Station ${fromStation}` });
            }

            await pool.query(
                'UPDATE tickets SET status = $1, entry_station_id = $2 WHERE id = $3',
                ['in-transit', currentStationId, ticket.id]
            );
            return res.json({ message: "Entry Successful. Welcome to MRT-6!" });
        }

        // 3. EXIT LOGIC (Punch Out)
        if (ticket.status === 'in-transit') {  //means already punched in the entry
            const current = parseInt(currentStationId);
            const destination = parseInt(toStation);
            const source = parseInt(fromStation);

            // Check if traveling backwards or punching at source
            if (current === source) return res.status(400).json({ error: "Cannot exit at entry station" });

            // Penalty Logic: If current station is beyond destination
            if (current > destination) {
                // Here you would normally call your fare calculation function
                // For simulation, let's assume a flat penalty of 20 per extra station
                const extraStops = current - destination;
                const penalty = extraStops * 10; 

                // ACID Transaction for Balance Deduction
                const client = await pool.connect();
                try {
                    await client.query('BEGIN');
                    const userRes = await client.query('SELECT balance FROM users WHERE id = $1 FOR UPDATE', [userId]);
                    if (userRes.rows[0].balance < penalty) {
                        throw new Error("Insufficient balance for journey adjustment");
                    }
                    await client.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [penalty, userId]);
                    await client.query(
                        'UPDATE tickets SET status = $1, exit_station_id = $2 WHERE id = $3',
                        ['completed', current, ticket.id]
                    );
                    await client.query('COMMIT');
                    return res.json({ message: `Penalty of ৳${penalty} deducted. Exit granted.` });
                } catch (e) {
                    await client.query('ROLLBACK');
                    return res.status(400).json({ error: e.message });
                } finally {
                    client.release();
                }
            }

            // Normal Exit (Destination or before destination)
            await pool.query(
                'UPDATE tickets SET status = $1, exit_station_id = $2 WHERE id = $3',
                ['completed', current, ticket.id]
            );
            return res.json({ message: "Exit Successful. Thank you for traveling with us!" });
        }

    } catch (err) {
        res.status(500).json({ error: "Gate System Error" });
    }
};


module.exports={handlePunch};