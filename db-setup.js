const { Client } = require('pg');
require('dotenv').config();

async function setupDatabase() {
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: 'postgres', // Connect to default database first
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL');

        // Create database if it doesn't exist
        const dbName = process.env.DB_NAME;
        const res = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`
        );

        if (res.rowCount === 0) {
            await client.query(`CREATE DATABASE ${dbName}`);
            console.log(`✅ Database '${dbName}' created`);
        } else {
            console.log(`✅ Database '${dbName}' already exists`);
        }

        await client.end();

        // Now connect to the specific database and create tables
        const appClient = new Client({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
        });

        await appClient.connect();

        // Create users table
        await appClient.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table created/verified');

        // Create bp_readings table
        await appClient.query(`
            CREATE TABLE IF NOT EXISTS bp_readings (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                systolic INTEGER NOT NULL,
                diastolic INTEGER NOT NULL,
                reading_date TIMESTAMP NOT NULL,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ BP readings table created/verified');

        await appClient.end();
        console.log('✅ Database setup complete!');

    } catch (err) {
        console.error('❌ Database setup error:', err.message);
        process.exit(1);
    }
}

setupDatabase();