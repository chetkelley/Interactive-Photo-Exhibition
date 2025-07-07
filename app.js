const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const path = require('path');

const app = express();
const db = new sqlite3.Database('data.db');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'photo-exhibit-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 12 * 60 * 60 * 1000 } // 12 hours
}));

// Initialize DB
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS photo (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS description (
    id INTEGER PRIMARY KEY,
    photo_id INTEGER,
    text TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(photo_id) REFERENCES photo(id)
  )`);
  db.get('SELECT COUNT(*) AS count FROM photo', (err, row) => {
    if (row.count === 0) {
      db.run(`INSERT INTO photo (title) VALUES ('Sunset Over Berlin')`);
      db.run(`INSERT INTO photo (title) VALUES ('City Park at Dawn')`);
    }
  });
});

// Routes
app.get('/photo/:id', (req, res) => {
  const photoId = req.params.id;
  const submittedKey = `photo_${photoId}_submitted`;
  db.get('SELECT * FROM photo WHERE id = ?', [photoId], (err, photo) => {
    if (err || !photo) return res.status(404).send('Photo not found');
    if (req.session[submittedKey]) {
      db.all('SELECT text FROM description WHERE photo_id = ? ORDER BY timestamp DESC', [photoId], (err, descriptions) => {
        const userDesc = req.session[submittedKey];
        const otherDescs = descriptions.filter(d => d.text !== userDesc);
        res.render('photo_show', { photo, descriptions: [{ text: userDesc }, ...otherDescs] });
      });
    } else {
      res.render('photo_form', { photo });
    }
  });
});

app.post('/photo/:id', (req, res) => {
  const photoId = req.params.id;
  const text = req.body.text;
  if (!text) return res.redirect(`/photo/${photoId}`);
  db.run('INSERT INTO description (photo_id, text) VALUES (?, ?)', [photoId, text], () => {
    req.session[`photo_${photoId}_submitted`] = text;
    res.redirect(`/photo/${photoId}`);
  });
});

app.listen(80, () => console.log('App running on http://<pi-ip>/photo/1 etc.'));

