const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();
const dbPath = process.env.DB_FILE || path.join(__dirname, '../beware.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password_hash TEXT,
      name TEXT, 
      country TEXT,
      bio TEXT,
      helpful_posts JSON DEFAULT '[]', 
      unhelpful_posts JSON DEFAULT '[]',
      reputation INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      location TEXT,
      must_visit TEXT,
      must_avoid TEXT,
      food_recommendations TEXT,
      money_tips TEXT,
      norms TEXT,
      extra_tips TEXT,
      helpful_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
});

module.exports = db;