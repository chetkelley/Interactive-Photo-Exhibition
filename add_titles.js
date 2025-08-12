const { Pool } = require('pg');

// Uses your .env DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addPhotoTitle(title) {
  try {
    const result = await pool.query(
      'INSERT INTO photo (title) VALUES ($1) RETURNING id',
      [title]
    );
    console.log(`Photo inserted with id: ${result.rows[0].id}`);
  } catch (err) {
    console.error('Error inserting photo:', err);
  }
}

// Example usage:
addPhotoTitle('Sunset');
