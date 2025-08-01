const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// Register new user
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const userExists = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const result = await db.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, hashedPassword]
        );

        const user = result.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const result = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = result.rows[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// Get user profile - updated version
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            'SELECT id, name, email, created_at FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = result.rows[0];
        
        // Ensure created_at is properly formatted as ISO string
        const formattedUser = {
            ...user,
            created_at: user.created_at ? new Date(user.created_at).toISOString() : null
        };

        res.status(200).json({
            success: true,
            user: formattedUser
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error retrieving profile'
        });
    }
};

// Request password reset
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const result = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            // Don't reveal if email exists for security
            return res.status(200).json({
                success: true,
                message: 'If your email is registered, you will receive a password reset link.'
            });
        }

        const user = result.rows[0];

        // In a real app, you would:
        // 1. Generate a secure reset token
        // 2. Save it to the database with expiration
        // 3. Send email with reset link
        
        // For this demo, we'll simulate the process
        console.log(`Password reset requested for user ${user.email}`);
        console.log(`Reset token would be sent to: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'If your email is registered, you will receive a password reset link.'
        });
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error processing password reset request'
        });
    }
};

// Reset password
const resetPassword = async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;

        // In a real app, you would:
        // 1. Verify the token is valid and not expired
        // 2. Find user by email and token
        // 3. Hash the new password
        // 4. Update user's password in database
        // 5. Invalidate the reset token

        // For this demo, we'll simulate the process
        console.log(`Password reset for user ${email} with token ${token}`);

        // Check if user exists
        const result = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reset request'
            });
        }

        const user = result.rows[0];

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await db.query(
            'UPDATE users SET password_hash = $1 WHERE email = $2',
            [hashedPassword, email]
        );

        res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now login with your new password.'
        });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error resetting password'
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    requestPasswordReset,
    resetPassword
};