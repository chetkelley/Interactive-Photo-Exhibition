require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const path = require('path');
const sanitizeHtml = require('sanitize-html');

const app = express();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false }
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));

// Persistent sessions in PostgreSQL
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 12 * 60 * 60 * 1000 } // 12 hours
}));

// Routes
app.get('/photo/:id', async (req, res) => {
  const photoId = req.params.id;
  const submittedKey = `photo_${photoId}_submitted`;

  try {
    const photoResult = await pool.query('SELECT * FROM photo WHERE id = $1', [photoId]);
    if (photoResult.rows.length === 0) return res.status(404).send('Photo not found');

    const photo = photoResult.rows[0];

    if (req.session[submittedKey]) {
      const descResult = await pool.query(
        'SELECT text FROM description WHERE photo_id = $1 ORDER BY timestamp DESC',
        [photoId]
      );
      const userDesc = req.session[submittedKey];
      const otherDescs = descResult.rows.filter(d => d.text !== userDesc);
      res.render('photo_show', { photo, descriptions: [{ text: userDesc }, ...otherDescs] });
    } else {
      res.render('photo_form', { photo });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

app.post('/photo/:id', async (req, res) => {
  const photoId = req.params.id;
  let text = req.body.text;
  if (!text) return res.redirect(`/photo/${photoId}`);

  // Sanitize user input
  text = sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {}
  });

  try {
    await pool.query(
      'INSERT INTO description (photo_id, text) VALUES ($1, $2)',
      [photoId, text]
    );
    req.session[`photo_${photoId}_submitted`] = text;
    res.redirect(`/photo/${photoId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});