require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const QRCode = require('qrcode');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

(async () => {
  try {
    const res = await pool.query('SELECT id, title FROM photo ORDER BY id');
    const photos = res.rows;

    for (const photo of photos) {
      const { id, title } = photo;
      const qrContent = `http://10.10.1.13:3000/photo/${id}`; // Update with your actual base URL
      const outputFile = path.join(__dirname, `qr_${id}.png`);

      await QRCode.toFile(outputFile, qrContent, {
        color: { dark: '#000000', light: '#ffffff' },
        width: 300,
      });

      console.log(`Generated QR for "${title}" (ID: ${id}) at ${outputFile}`);
    }
  } catch (err) {
    console.error('Error generating QR codes:', err.message);
  } finally {
    await pool.end();
  }
})();