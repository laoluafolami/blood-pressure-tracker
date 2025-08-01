const { Pool } = require('pg');
require('dotenv').config();

// Validate environment variables
const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'DB_PORT'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars);
    process.exit(1);
}

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    // Add connection timeout
    connectionTimeoutMillis: 5000,
});

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        console.error('Please check your database credentials in .env file');
    } else {
        console.log('✅ Database connected successfully');
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};