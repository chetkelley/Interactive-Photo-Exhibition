const fs = require('fs');
const { Pool } = require('pg');

// Adjust connection details as needed or use DATABASE_URL from .env
const pool = new Pool({
  user: 'your_pg_username',
  host: 'localhost',
  database: 'your_database_name',
  password: 'your_pg_password',
  port: 5432,
});

(async () => {
  const titles = fs.readFileSync('titles.txt', 'utf-8').split('\n').filter(Boolean);

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