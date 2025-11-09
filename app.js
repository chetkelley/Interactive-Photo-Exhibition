require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();

// Log the DATABASE_URL being used
console.log('🔍 DATABASE_URL =', process.env.DATABASE_URL);

// --- Database connection ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false // For Railway internal database connections
});

// Test database connection on startup
pool.connect()
  .then(client => {
    console.log('✅ Successfully connected to the database');
    client.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
  });

// --- Routes ---

// Simple health check
app.get('/', (req, res) => {
  res.send('Interactive Photo Exhibition app is running.');
});

// Test database connectivity
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`Database connected successfully! Server time: ${result.rows[0].now}`);
  } catch (err) {
    console.error('Database error on /test-db:', err);
    res.status(500).send(`Database error: ${err.message}`);
  }
});

// Fetch a photo by ID
app.get('/photo/:id', async (req, res) => {
  const photoId = req.params.id;
  try {
    const result = await pool.query('SELECT * FROM photo WHERE id = $1', [photoId]);
    if (result.rows.length === 0) {
      return res.status(404).send('Photo not found');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Database error on /photo/:id:', err);
    res.status(500).send('Database error');
  }
});

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server started on port ${PORT}`);
});
