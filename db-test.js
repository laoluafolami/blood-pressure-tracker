const { Pool } = require('pg');
require('dotenv').config();

console.log('Testing database connection...');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.log('Environment variables:');
        console.log('DB_USER:', process.env.DB_USER);
        console.log('DB_HOST:', process.env.DB_HOST);
        console.log('DB_NAME:', process.env.DB_NAME);
        console.log('DB_PORT:', process.env.DB_PORT);
    } else {
        console.log('✅ Database connected successfully');
        console.log('Current time:', res.rows[0].now);
    }
    pool.end();
});