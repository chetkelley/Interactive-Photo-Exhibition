require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

// Connect to PostgreSQL via the DATABASE_URL from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Railway requires this for their managed Postgres
  }
});

(async () => {
  try {
    // Read titles.txt, one title per line
    const titles = fs.readFileSync('titles.txt', 'utf-8')
      .split('\n')
      .map(t => t.trim())
      .filter(Boolean);

    for (const title of titles) {
      const res = await pool.query(
        'INSERT INTO photo (title) VALUES ($1) RETURNING id',
        [title]
      );
      console.log(`Inserted "${title}" with ID ${res.rows[0].id}`);
    }

    console.log('All titles added successfully!');
  } catch (err) {
    console.error('Error inserting titles:', err.message);
  } finally {
    await pool.end();
  }
})();
