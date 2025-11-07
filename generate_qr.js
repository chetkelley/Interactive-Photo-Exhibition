require('dotenv').config();
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false // or adjust depending on Railway / PostgreSQL setup
});

(async () => {
  try {
    const res = await pool.query('SELECT id, title FROM photo');
    for (const row of res.rows) {
      const photoId = row.id;
      const url = `${process.env.APP_URL}/photo/${photoId}`; // e.g., https://myapp.example.com/photo/1
      const filePath = path.join(__dirname, `photo_${photoId}.png`);
      
      await QRCode.toFile(filePath, url, { width: 300 });
      console.log(`Generated QR for "${row.title}" at ${filePath}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
})();
