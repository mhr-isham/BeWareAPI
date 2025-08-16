/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: You can create, update and delete your post through this endpoint. View others posts and mark them as helpful ;)
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get posts. You can add parameters to get posts by username, user_id, location or get all the posts at once. Pagination is supported to tackle multiple posts There's also options to sort posts by reputation count.
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: ids
 *         schema:
 *           type: string
 *         description: Comma-separated post IDs
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         default: 10
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [helpful_count_asc, helpful_count_desc, created_at_desc, created_at_asc]
 *     responses:
 *       200:
 *         description: List of posts
 *       404:
 *         description: No posts found
 */

/**
 * @swagger
 * /posts/search/location:
 *   get:
 *     summary: Search posts by location
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: location
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of posts
 *       404:
 *         description: No posts found
 */

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post(you need to be logged in to create,update, mark or delete a post)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - location
 *             properties:
 *               location:
 *                 type: string
 *               must_visit:
 *                 type: string
 *               must_avoid:
 *                 type: string
 *               food_recommendations:
 *                 type: string
 *               money_tips:
 *                 type: string
 *               norms:
 *                 type: string
 *               extra_tips:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post created successfully
 *       400:
 *         description: Invalid data
 */

/**
 * @swagger
 * /posts/{id}/helpful:
 *   post:
 *     summary: Mark a post as helpful
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post marked as helpful
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /posts/{id}/unhelpful:
 *   post:
 *     summary: If the tips turned out to be not working or turning your travel sideways, you MAY post it as unhelpful, but let's keep in mind people posted their tips here just for helping others.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post marked as unhelpful
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /posts/{id}/unvote:
 *   delete:
 *     summary: Unvote a post, if you changed your mind
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post unvoted successfully
 *       404:
 *         description: Post not found or unauthorized
 */

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update your post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: string
 *               must_visit:
 *                 type: string
 *               must_avoid:
 *                 type: string
 *               food_recommendations:
 *                 type: string
 *               money_tips:
 *                 type: string
 *               norms:
 *                 type: string
 *               extra_tips:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated
 *       403:
 *         description: Not authorized or post not found
 *
 *   delete:
 *     summary: Delete your post.!
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post deleted
 *       400:
 *         description: Error deleting post
 */
const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Allowed sorting options
const allowedSortOptions = {
  helpful_count_asc: 'helpful_count ASC',
  helpful_count_desc: 'helpful_count DESC',
  created_at_desc: 'created_at DESC',
  created_at_asc: 'created_at ASC',
};

// GET posts by id, username and user_id
router.get('/', (req, res) => {
  const { ids, username, user_id, page = 1, limit = 10, sort } = req.query;

const orderBy = allowedSortOptions[sort] || 'created_at DESC';

  if (ids) {
    // Retrieving multiple post with post ids
    const idsArray = ids.split(',').map(id => parseInt(id.trim())).filter(Boolean);
    if (idsArray.length == 0) {
      return res.status(400).json({ error: 'Invalid ids provided'});
    }
    
    // TO avoid SQL injection, cause why not ;)
    const placeholders = idsArray.map(() => '?').join(',');

    db.all(
      `SELECT * FROM posts WHERE id IN (${placeholders}) ORDER BY ${orderBy}`,
      idsArray,
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length === 0) return res.status(404).json({ error: 'No posts found for provided ids' });
        res.json(rows);
      }
    );
  } else if (username) {
    // Retrieving multiple post with username
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    db.all(
      `SELECT p.* FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE u.username = ?
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [username, limitNum, offset],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length === 0) return res.status(404).json({ error: 'No posts found for that user' });
        res.json({
          page: pageNum,
          limit: limitNum,
          posts: rows,
        });
      }
    );

  } else if (user_id) {
    // Retrieving multiple post with post ids
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    db.all(
      `SELECT * FROM posts WHERE user_id = ? ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [user_id, limitNum, offset],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length === 0) return res.status(404).json({ error: 'No posts found for that user_id' });
        res.json({
          page: pageNum,
          limit: limitNum,
          posts: rows,
        });
      }
    );

  } else {
    // Retrieving all posts without any filter
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    db.all(
      `SELECT * FROM posts ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [limitNum, offset],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length === 0) return res.status(404).json({ error: 'No posts found' });
        res.json({
          page: pageNum,
          limit: limitNum,
          posts: rows,
        });
      }
    );
  }
});

// // Retrieving multiple post with locations
router.get('/search/location', (req, res) => {
  const { location } = req.query;
  if (!location) {
    return res.status(400).json({ error: 'Please provide location query parameter' });
  }

  db.all(
    `SELECT * FROM posts WHERE LOWER(location) LIKE LOWER(?) ORDER BY created_at DESC`,
    [`%${location}%`],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (rows.length === 0) return res.status(404).json({ error: 'No posts found for that location' });
      res.json(rows);
    }
  );
});

// Create post
router.post('/', auth, (req, res) => {
  const { location, must_visit, must_avoid, food_recommendations, money_tips, norms, extra_tips } = req.body;
  db.run(
    `INSERT INTO posts (user_id, location, must_visit, must_avoid, food_recommendations, money_tips, norms, extra_tips)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, location, must_visit, must_avoid, food_recommendations, money_tips, norms, extra_tips],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

//GRAB VOTE
async function handleVoteChange(postId, userId, action) {
  postId = Number(postId);
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      // VOTE(helpful/unhelpful/unvote)
      db.get(`SELECT helpful_posts, unhelpful_posts FROM users WHERE id = ?`, [userId], (err, user) => {
        if (err) { db.run("ROLLBACK"); return reject(err); }
        if (!user) { db.run("ROLLBACK"); return reject(new Error("User not found")); }

        let helpfulPosts, unhelpfulPosts;
        try {
          helpfulPosts = JSON.parse(user.helpful_posts || '[]');
          unhelpfulPosts = JSON.parse(user.unhelpful_posts || '[]');
        } catch {
          db.run("ROLLBACK");
          return reject(new Error("Invalid vote data in database"));
        }

        let helpfulCountChange = 0;
        let voteChanged = false;
//helpful
        if (action === "helpful") {
          if (helpfulPosts.includes(postId)) {
            db.run("ROLLBACK");
            return reject(new Error("Post already marked as helpful"));
          }
          if (unhelpfulPosts.includes(postId)) {
            unhelpfulPosts.splice(unhelpfulPosts.indexOf(postId), 1);
            helpfulCountChange = 2;
          } else {
            helpfulCountChange = 1;
          }
          helpfulPosts.push(postId);
          voteChanged = true;
//Unhelpful
        } else if (action === "unhelpful") {
          if (unhelpfulPosts.includes(postId)) {
            db.run("ROLLBACK");
            return reject(new Error("Post already marked as unhelpful"));
          }
          if (helpfulPosts.includes(postId)) {
            helpfulPosts.splice(helpfulPosts.indexOf(postId), 1);
            helpfulCountChange = -2;
          } else {
            helpfulCountChange = -1;
          }
          unhelpfulPosts.push(postId);
          voteChanged = true;
//Unvote
        } else if (action === "unvote") {
          if (helpfulPosts.includes(postId)) {
            helpfulPosts.splice(helpfulPosts.indexOf(postId), 1);
            helpfulCountChange = -1;
            voteChanged = true;
          } else if (unhelpfulPosts.includes(postId)) {
            unhelpfulPosts.splice(unhelpfulPosts.indexOf(postId), 1);
            helpfulCountChange = 1;
            voteChanged = true;
          } else {
            db.run("ROLLBACK");
            return reject(new Error("Post has not been voted on by user"));
          }
        }

        // Get id of post owner
        db.get(`SELECT user_id FROM posts WHERE id = ?`, [postId], (err, post) => {
          if (err) return reject(err);
          if (!post) return reject(new Error("Post not found"));
        
          const postOwnerId = post.user_id;

          // Update helpful_count for the post
          db.run(`UPDATE posts SET helpful_count = helpful_count + ? WHERE id = ?`,
            [helpfulCountChange, postId],
            function (err) {
              if (err || this.changes === 0) {
                db.run("ROLLBACK");
                return reject(err || new Error("Post not found"));
              }

              // Update user's voted posts
              db.run(
                `UPDATE users SET helpful_posts = ?, unhelpful_posts = ? WHERE id = ?`,
                [JSON.stringify(helpfulPosts), JSON.stringify(unhelpfulPosts), userId],
                async function (err) {
                  if (err) {
                    db.run("ROLLBACK");
                    return reject(err);
                  }
                  //Update owner's reputation count
                  db.run(
                    `UPDATE users SET reputation = reputation + ? WHERE id = ?`, [helpfulCountChange, postOwnerId], function(err) {
                      if (err) {
                        db.run("ROLLBACK");
                        return reject(err);
                      }
                  //transaction
                  db.run("COMMIT", async (err) => {
                    if (err) return reject(err);

                    resolve(`${action} action processed successfully`);
                  });
                }
              );
            }
          );
        });
      });
    });
  });
});
};

//helpful post
router.post('/:id/helpful', auth, async (req, res) => {
  try {
    const msg = await handleVoteChange(req.params.id.toString(), req.user.id, "helpful");
    res.json({ message: msg });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//unhelpful post
router.post('/:id/unhelpful', auth, async (req, res) => {
  try {
    const msg = await handleVoteChange(req.params.id.toString(), req.user.id, "unhelpful");
    res.json({ message: msg });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Unvote
router.delete('/:id/unvote', auth, async (req, res) => {
  try {
    const msg = await handleVoteChange(req.params.id.toString(), req.user.id, "unvote");
    res.json({ message: msg });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update post
router.put('/:id', auth, (req, res) => {
  const { location, must_visit, must_avoid, food_recommendations, money_tips, norms, extra_tips } = req.body;
  db.run(
    `UPDATE posts SET location=?, must_visit=?, must_avoid=?, food_recommendations=?, money_tips=?, norms=?, extra_tips=?
     WHERE id = ? AND user_id = ?`,
    [location, must_visit, must_avoid, food_recommendations, money_tips, norms, extra_tips, req.params.id, req.user.id],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      if (this.changes === 0) return res.status(403).json({ message: "Not authorized or post not found" });
      res.json({ message: "Post updated" });
    }
  );
});


// Delete post
router.delete('/:id', auth, (req, res) => {
  const postId = req.params.id;

  // Get the post's helpful_count
  db.get(`SELECT user_id, helpful_count FROM posts WHERE id = ? AND user_id = ?`, [postId, req.user.id], (err, post) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!post) return res.status(403).json({ message: "Not authorized or post not found" });

    const postOwnerId = post.user_id;
    const helpfulCount = post.helpful_count || 0;

    // Delete the post
    db.run(`DELETE FROM posts WHERE id = ? AND user_id = ?`, [postId, req.user.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(403).json({ message: "Not authorized or post not found" });

      // Update user's reputation
      db.run(`UPDATE users SET reputation = reputation - ? WHERE id = ?`, [helpfulCount, postOwnerId], function(err) {
        if (err) return res.status(500).json({ error: err.message });

        res.json({ message: "Post deleted successfully" });
      });
    });
  });
});

module.exports = router;