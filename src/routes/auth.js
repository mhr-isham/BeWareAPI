/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Login and Register, you stay logged in for an hour each session.
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: mhrisham
 *               email:
 *                 type: string
 *                 format: email
 *                 example: mhrisham@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 0P3N_$e$@m3
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Email or username already registered
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login to your profile
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: mhrisham@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 0P3N_$e$@m3
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Wrong password
 *       400:
 *         description: User not found
 */

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const router = express.Router();

// Sorry but I am a cysec guy, so need to think about security and so implemented rate-limiter
const rateLimit = require('express-rate-limit');

const RegisterLoginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 10, 
  message: 'Too many attempts, please try again later',
});

// Register
router.post('/register', RegisterLoginLimiter, async (req, res) => {
  const { username, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  // Check if email/username already exists
  db.get(
    `SELECT * FROM users WHERE email = ? OR username = ?`,
    [email, username],
    (err, row) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (row) {
        return res.status(400).json({ error: 'Email or username already registered' });
      }

      db.run(
        `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`,
        [username, email, hash],
        function (err) {
          if (err) {
            console.error('Database error:', err.message);
            return res.status(400).json({ error: 'An error occurred while processing your request' });
          }


          const token = jwt.sign(
            { id: this.lastID, username, email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
          );

 
          res.status(201).json({
            message: 'User registered successfully',
            id: this.lastID,
            username,
            email,
            token,
          });
        }
      );
    }
  );
});

// Login
router.post('/login', RegisterLoginLimiter, (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
       return res.status(401).json({ message: "Wrong password" });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ message:'Login Successful', id: user.id, username: user.username, email: user.email, token });
  });
});

module.exports = router;
