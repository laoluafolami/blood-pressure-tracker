const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
    console.log('Testing database connection...');
    console.log('Using credentials:');
    console.log('- User:', process.env.DB_USER);
    console.log('- Host:', process.env.DB_HOST);
    console.log('- Database:', process.env.DB_NAME);
    console.log('- Port:', process.env.DB_PORT);

    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: 'postgres', // Test with default database first
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });

    try {
        await client.connect();
        console.log('✅ Successfully connected to PostgreSQL!');
        await client.end();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        
        // Common troubleshooting tips for Windows
        console.log('\nTroubleshooting tips for Windows:');
        console.log('1. Make sure PostgreSQL service is running');
        console.log('2. Check Windows Services for "postgresql"');
        console.log('3. Try connecting with pgAdmin first');
        console.log('4. Verify PostgreSQL is on port 5432');
    }
}

testConnection();