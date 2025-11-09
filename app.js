require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const path = require('path');
const sanitizeHtml = require('sanitize-html');

const app = express();

// Database connection with pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, // Internal Railway Postgres does not need SSL
});

// Log connection info for debugging
try {
  const dbUrl = new URL(process.env.DATABASE_URL);
  console.log(`🔍 Attempting DB connection to host: ${dbUrl.hostname}, port: ${dbUrl.port}, database: ${dbUrl.pathname.slice(1)}`);
} catch (err) {
  console.error('❌ Failed to parse DATABASE_URL', err);
}

// Log pool errors globally
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Function to verify DB connection before server start
async function checkDatabaseConnection(retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT NOW()');
      console.log('✅ Database connection successful');
      return;
    } catch (err) {
      console.error(`Database connection failed (attempt ${i + 1}):`, err.message);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Database connection failed after multiple attempts');
}

// Session storage
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 12 * 60 * 60 * 1000 }, // 12 hours
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));

// Root / health check route
app.get('/', (req, res) => {
  res.send('Interactive Photo Exhibition app is running.');
});

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
    console.error('Database error on GET /photo/:id', err);
    res.status(500).send('Database error');
  }
});

app.post('/photo/:id', async (req, res) => {
  const photoId = req.params.id;
  let text = req.body.text;
  if (!text) return res.redirect(`/photo/${photoId}`);

  text = sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} });

  try {
    await pool.query('INSERT INTO description (photo_id, text) VALUES ($1, $2)', [photoId, text]);
    req.session[`photo_${photoId}_submitted`] = text;
    res.redirect(`/photo/${photoId}`);
  } catch (err) {
    console.error('Database error on POST /photo/:id', err);
    res.status(500).send('Database error');
  }
});

// Debug route to test database connectivity
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`Database connected successfully! Server time: ${result.rows[0].now}`);
  } catch (err) {
    console.error('Database connection failed:', err);
    res.status(500).send(`Database error: ${err.message}`);
  }
});

// Start server after DB check
const PORT = process.env.PORT || 3000;

checkDatabaseConnection()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('🚨 Could not start server:', err);
    process.exit(1); // Exit container if DB cannot connect
  });
