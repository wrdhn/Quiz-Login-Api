const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Validation schemas
const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).required()
});

// JWT utilities
const generateToken = (userId, username) => {
    return jwt.sign(
        { userId, username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

const routes = [
    // Register endpoint
    {
        method: 'POST',
        path: '/register',
        options: {
            validate: {
                payload: registerSchema,
                failAction: (request, h, err) => {
                    throw err;
                }
            }
        },
        handler: async (request, h) => {
            try {
                const { username, password } = request.payload;

                // Check if user already exists
                const existingUser = await pool.query(
                    'SELECT id FROM users WHERE username = $1',
                    [username]
                );

                if (existingUser.rows.length > 0) {
                    return h.response({
                        error: true,
                        message: 'Username already exists'
                    }).code(400);
                }

                // Hash password
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);

                // Insert new user
                const result = await pool.query(
                    'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
                    [username, hashedPassword]
                );

                const newUser = result.rows[0];
                const token = generateToken(newUser.id, newUser.username);

                return h.response({
                    error: false,
                    message: 'User registered successfully',
                    data: {
                        userId: newUser.id,
                        username: newUser.username,
                        token
                    }
                }).code(201);

            } catch (error) {
                console.error('Register error:', error);
                return h.response({
                    error: true,
                    message: 'Internal server error'
                }).code(500);
            }
        }
    },

    // Login endpoint
    {
        method: 'POST',
        path: '/login',
        options: {
            validate: {
                payload: loginSchema,
                failAction: (request, h, err) => {
                    throw err;
                }
            }
        },
        handler: async (request, h) => {
            try {
                const { username, password } = request.payload;

                // Find user
                const result = await pool.query(
                    'SELECT id, username, password FROM users WHERE username = $1',
                    [username]
                );

                if (result.rows.length === 0) {
                    return h.response({
                        error: true,
                        message: 'Invalid username or password'
                    }).code(401);
                }

                const user = result.rows[0];

                // Verify password
                const validPassword = await bcrypt.compare(password, user.password);
                
                if (!validPassword) {
                    return h.response({
                        error: true,
                        message: 'Invalid username or password'
                    }).code(401);
                }

                // Generate token
                const token = generateToken(user.id, user.username);

                return h.response({
                    error: false,
                    message: 'Login successful',
                    data: {
                        userId: user.id,
                        username: user.username,
                        token
                    }
                }).code(200);

            } catch (error) {
                console.error('Login error:', error);
                return h.response({
                    error: true,
                    message: 'Internal server error'
                }).code(500);
            }
        }
    },

    // Verify token endpoint
    {
        method: 'GET',
        path: '/verify',
        handler: async (request, h) => {
            try {
                const authorization = request.headers.authorization;

                if (!authorization || !authorization.startsWith('Bearer ')) {
                    return h.response({
                        error: true,
                        message: 'Access token required'
                    }).code(401);
                }

                const token = authorization.split(' ')[1];
                const decoded = verifyToken(token);

                return h.response({
                    error: false,
                    message: 'Token is valid',
                    data: {
                        userId: decoded.userId,
                        username: decoded.username
                    }
                }).code(200);

            } catch (error) {
                if (error.name === 'TokenExpiredError') {
                    return h.response({
                        error: true,
                        message: 'Token expired'
                    }).code(401);
                }

                if (error.name === 'JsonWebTokenError') {
                    return h.response({
                        error: true,
                        message: 'Invalid token'
                    }).code(401);
                }

                console.error('Verify error:', error);
                return h.response({
                    error: true,
                    message: 'Internal server error'
                }).code(500);
            }
        }
    }
];

module.exports = routes;