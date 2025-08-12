require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

(async () => {
  const titles = fs.readFileSync('titles.txt', 'utf-8')
    .split('\n')
    .filter(Boolean);

  for (const title of titles) {
    try {
      const res = await pool.query(
        'INSERT INTO photo (title) VALUES ($1) RETURNING id',
        [title]
      );
      console.log(`Inserted "${title}" with ID ${res.rows[0].id}`);
    } catch (err) {
      console.error(`Error inserting "${title}": ${err.message}`);
    }
  }

  await pool.end();
})();