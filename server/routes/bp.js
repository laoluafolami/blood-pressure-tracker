const express = require('express');
const {
    addReading,
    getReadings,
    getReadingById,
    updateReading,
    deleteReading,
    getStatistics,
    exportReadingsCSV,
    exportReadingsJSON,
    exportSummary
} = require('../controllers/bpController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.post('/', auth, addReading);
router.get('/', auth, getReadings);
router.get('/statistics', auth, getStatistics);
router.get('/:id', auth, getReadingById);
router.put('/:id', auth, updateReading);
router.delete('/:id', auth, deleteReading);

// Export routes (new)
router.get('/export/csv', auth, exportReadingsCSV);
router.get('/export/json', auth, exportReadingsJSON);
router.get('/export/summary', auth, exportSummary);

module.exports = router;