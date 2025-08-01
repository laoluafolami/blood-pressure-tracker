const db = require('../config/db');

// Add new blood pressure reading
const addReading = async (req, res) => {
    try {
        const { systolic, diastolic, date, notes } = req.body;
        const userId = req.user.id;

        const result = await db.query(
            'INSERT INTO bp_readings (user_id, systolic, diastolic, reading_date, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, systolic, diastolic, date, notes || null]
        );

        const reading = result.rows[0];

        res.status(201).json({
            success: true,
            message: 'Blood pressure reading added successfully',
            reading
        });
    } catch (error) {
        console.error('Add reading error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error adding reading'
        });
    }
};

// Get all readings for user
const getReadings = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            'SELECT * FROM bp_readings WHERE user_id = $1 ORDER BY reading_date DESC',
            [userId]
        );

        res.status(200).json({
            success: true,
            count: result.rows.length,
            readings: result.rows
        });
    } catch (error) {
        console.error('Get readings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error retrieving readings'
        });
    }
};

// Get reading by ID
const getReadingById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await db.query(
            'SELECT * FROM bp_readings WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reading not found'
            });
        }

        res.status(200).json({
            success: true,
            reading: result.rows[0]
        });
    } catch (error) {
        console.error('Get reading error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error retrieving reading'
        });
    }
};

// Update reading
const updateReading = async (req, res) => {
    try {
        const { id } = req.params;
        const { systolic, diastolic, date, notes } = req.body;
        const userId = req.user.id;

        // Check if reading exists and belongs to user
        const existing = await db.query(
            'SELECT * FROM bp_readings WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reading not found'
            });
        }

        const result = await db.query(
            'UPDATE bp_readings SET systolic = $1, diastolic = $2, reading_date = $3, notes = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
            [systolic, diastolic, date, notes || null, id, userId]
        );

        res.status(200).json({
            success: true,
            message: 'Reading updated successfully',
            reading: result.rows[0]
        });
    } catch (error) {
        console.error('Update reading error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating reading'
        });
    }
};

// Delete reading
const deleteReading = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if reading exists and belongs to user
        const existing = await db.query(
            'SELECT * FROM bp_readings WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reading not found'
            });
        }

        await db.query(
            'DELETE FROM bp_readings WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        res.status(200).json({
            success: true,
            message: 'Reading deleted successfully'
        });
    } catch (error) {
        console.error('Delete reading error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting reading'
        });
    }
};

// Get statistics
const getStatistics = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get average readings
        const avgResult = await db.query(
            `SELECT 
                AVG(systolic) as avg_systolic,
                AVG(diastolic) as avg_diastolic,
                COUNT(*) as total_readings
            FROM bp_readings 
            WHERE user_id = $1`,
            [userId]
        );

        // Get recent readings (last 5)
        const recentResult = await db.query(
            `SELECT * FROM bp_readings 
            WHERE user_id = $1 
            ORDER BY reading_date DESC 
            LIMIT 5`,
            [userId]
        );

        res.status(200).json({
            success: true,
            statistics: avgResult.rows[0],
            recentReadings: recentResult.rows
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error retrieving statistics'
        });
    }
};

// Export readings as CSV
const exportReadingsCSV = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            `SELECT 
                id,
                systolic,
                diastolic,
                reading_date,
                notes,
                created_at
            FROM bp_readings 
            WHERE user_id = $1 
            ORDER BY reading_date DESC`,
            [userId]
        );

        // Create CSV content
        let csvContent = 'ID,Systolic,Diastolic,Reading Date,Notes,Created At\n';
        
        result.rows.forEach(reading => {
            csvContent += `"${reading.id}",` +
                         `"${reading.systolic}",` +
                         `"${reading.diastolic}",` +
                         `"${reading.reading_date}",` +
                         `"${reading.notes || ''}",` +
                         `"${reading.created_at}"\n`;
        });

        // Set headers for CSV download
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename="blood-pressure-readings.csv"');
        
        res.status(200).send(csvContent);
    } catch (error) {
        console.error('Export CSV error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error exporting CSV'
        });
    }
};

// Export readings as JSON
const exportReadingsJSON = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            `SELECT 
                id,
                systolic,
                diastolic,
                reading_date,
                notes,
                created_at
            FROM bp_readings 
            WHERE user_id = $1 
            ORDER BY reading_date DESC`,
            [userId]
        );

        // Set headers for JSON download
        res.header('Content-Type', 'application/json');
        res.header('Content-Disposition', 'attachment; filename="blood-pressure-readings.json"');
        
        res.status(200).send(JSON.stringify(result.rows, null, 2));
    } catch (error) {
        console.error('Export JSON error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error exporting JSON'
        });
    }
};

// Export summary statistics
const exportSummary = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user info
        const userResult = await db.query(
            'SELECT name, email FROM users WHERE id = $1',
            [userId]
        );
        
        const user = userResult.rows[0];

        // Get statistics
        const statsResult = await db.query(
            `SELECT 
                COUNT(*) as total_readings,
                AVG(systolic) as avg_systolic,
                AVG(diastolic) as avg_diastolic,
                MAX(reading_date) as last_reading_date
            FROM bp_readings 
            WHERE user_id = $1`,
            [userId]
        );

        const stats = statsResult.rows[0];

        // Create summary text
        const summary = `
Blood Pressure Readings Summary
===============================

Patient: ${user.name}
Email: ${user.email}
Report Generated: ${new Date().toLocaleString()}

Statistics:
-----------
Total Readings: ${stats.total_readings}
Average Systolic: ${Math.round(stats.avg_systolic) || 0} mmHg
Average Diastolic: ${Math.round(stats.avg_diastolic) || 0} mmHg
Last Reading: ${stats.last_reading_date ? new Date(stats.last_reading_date).toLocaleString() : 'None'}

This report was generated by the Blood Pressure Tracker application.
        `.trim();

        // Set headers for text download
        res.header('Content-Type', 'text/plain');
        res.header('Content-Disposition', 'attachment; filename="blood-pressure-summary.txt"');
        
        res.status(200).send(summary);
    } catch (error) {
        console.error('Export Summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error exporting summary'
        });
    }
};

module.exports = {
    addReading,
    getReadings,
    getReadingById,
    updateReading,
    deleteReading,
    getStatistics,
    exportReadingsCSV,
    exportReadingsJSON,
    exportSummary
};