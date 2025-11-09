require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false // Railway internal Postgres does not need SSL
});

// Health check route
app.get('/', (req, res) => {
  res.send('App is running.');
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`Database connected successfully! Server time: ${result.rows[0].now}`);
  } catch (err) {
    console.error('Database connection failed:', err);
    res.status(500).send(`Database error: ${err.message}`);
  }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Test server started on port ${PORT}`);
});
