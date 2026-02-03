import { Client } from 'pg';

export default async function handler(request, response) {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        // ssl: { rejectUnauthorized: false } // Uncomment if needed for Neon/others
    });

    try {
        await client.connect();

        // 1. Lazy Migration (Create Table)
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS recovery_state (
                id SERIAL PRIMARY KEY,
                data JSONB NOT NULL
            );
        `;
        await client.query(createTableQuery);

        // 2. Ensure Row 1 Exists
        const initRowQuery = `
            INSERT INTO recovery_state (id, data)
            VALUES (1, '{}')
            ON CONFLICT (id) DO NOTHING;
        `;
        await client.query(initRowQuery);

        // 3. Handle Methods
        if (request.method === 'GET') {
            const res = await client.query('SELECT data FROM recovery_state WHERE id = 1');
            const data = res.rows[0]?.data || {};
            await client.end();

            return response.status(200).json(data);
        }

        if (request.method === 'POST') {
            // Vercel auto-parses JSON body
            const newData = request.body;

            const updateQuery = 'UPDATE recovery_state SET data = $1 WHERE id = 1';
            await client.query(updateQuery, [newData]);
            await client.end();

            return response.status(200).json({ message: "Synced successfully" });
        }

        await client.end();
        return response.status(405).json({ error: "Method Not Allowed" });

    } catch (error) {
        console.error("Database Error:", error);
        // Ensure client is closed if it was opened
        try { await client.end(); } catch { }

        return response.status(500).json({
            error: "Database connection failed",
            details: error.message
        });
    }
}
