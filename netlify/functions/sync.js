const { Client } = require('pg');

exports.handler = async (event, context) => {
    // 1. Connection Header (Secure way to get string)
    // Debugging: Check if variable exists
    console.log("DB URL Length:", process.env.DATABASE_URL ? process.env.DATABASE_URL.length : "Undefined");
    console.log("DB URL Start:", process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 10) : "None");

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        // Neon handles SSL via the connection string params usually (`sslmode=require`)
        // If that fails, we might need to uncomment the object below.
        // ssl: { rejectUnauthorized: false } 
    });

    try {
        await client.connect();

        // 2. Lazy Migration (Create Table if not exists on first run)
        // We use a simple JSONB column to store the entire state.
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS recovery_state (
                id SERIAL PRIMARY KEY,
                data JSONB NOT NULL
            );
        `;
        await client.query(createTableQuery);

        // Ensure row 1 exists
        const initRowQuery = `
            INSERT INTO recovery_state (id, data)
            VALUES (1, '{}')
            ON CONFLICT (id) DO NOTHING;
        `;
        await client.query(initRowQuery);

        // 3. Handle Request Methods
        if (event.httpMethod === 'GET') {
            // READ
            const res = await client.query('SELECT data FROM recovery_state WHERE id = 1');
            const data = res.rows[0].data;
            await client.end();

            return {
                statusCode: 200,
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            };

        } else if (event.httpMethod === 'POST') {
            // WRITE
            const newData = JSON.parse(event.body);

            // Update row 1
            const updateQuery = 'UPDATE recovery_state SET data = $1 WHERE id = 1';
            await client.query(updateQuery, [newData]);
            await client.end();

            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Synced successfully" }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        await client.end();
        return { statusCode: 405, body: "Method Not Allowed" };

    } catch (error) {
        console.error("Database Error:", error);
        await client.end();
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Database connection failed", details: error.message })
        };
    }
};
