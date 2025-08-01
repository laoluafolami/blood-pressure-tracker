const express = require('express');
const { register, login, getProfile, requestPasswordReset, resetPassword } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', auth, getProfile);

module.exports = router;