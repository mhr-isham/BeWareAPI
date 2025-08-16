/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Update you profile and search other users. Your reputation defines you helpfulness through your posts.
 */

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update your profile, you can add your name, Country and a short bio(no worries, there's no word limit)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - country
 *               - bio
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ibteeker Mahir Ishum
 *               country:
 *                 type: string
 *                 example: Bangladesh
 *               bio:
 *                 type: string
 *                 example: An enthusiast and procastinor at the same time who is longing for travelling somewhere. Last travelled to Singapore to attend the ICO 2025, loved the gardens by the bay and NUS Campus.
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Search other users on basis of their name, username and country
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of matching users
 */

/**
 * @swagger
 * /users/{username}:
 *   get:
 *     summary: Get a user profile by username
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile data
 *       404:
 *         description: User not found
 */
const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Update Profile
router.put('/profile', auth, (req, res) => {
    const { name, country, bio } = req.body;
  
    // Validation: Check for missing or empty fields
    if (!name || !country || !bio) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    db.run(
      `UPDATE users SET name = ?, country = ?, bio = ? WHERE id = ?`,
      [name, country, bio, req.user.id],
      function (err) {
        if (err) {
          console.error('Database error:', err.message);
          return res.status(500).json({ error: 'Internal server error' });
        }
  
        if (this.changes === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
  
        res.status(200).json({ message: 'Profile updated successfully' });
      }
    );
  });

// Search Users
router.get('/search', (req, res) => {
  const { username, name, country } = req.query;

  let query = `SELECT username, name, country, bio, reputation FROM users WHERE 1=1`;
  const params = [];

  if (username) {
    query += ` AND username LIKE ?`;
    params.push(`%${username}%`);
  }
  if (name) {
    query += ` AND name LIKE ?`;
    params.push(`%${name}%`);
  }
  if (country) {
    query += ` AND country LIKE ?`;
    params.push(`%${country}%`);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.status(200).json(rows);
  });
});

// Get User Profile
router.get('/:username', (req, res) => {
  const { username } = req.params;

  db.get(
    `SELECT username, name, country, bio, reputation FROM users WHERE username = ?`,
    [username],
    (err, user) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(user);
    }
  );
});

module.exports = router;