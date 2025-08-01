const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Import routes
const authRoutes = require('./routes/auth');
const bpRoutes = require('./routes/bp');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bp', bpRoutes);

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Application Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log('❌ Unhandled Rejection at:', promise, 'reason:', err);
    // Application specific logging, throwing an error, or other logic here
    process.exit(1);
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Frontend available at http://localhost:${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log('❌ Uncaught Exception:', err);
    process.exit(1);
});