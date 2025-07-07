const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data.db');

const titles = fs.readFileSync('titles.txt', 'utf-8').split('\n').filter(Boolean);

titles.forEach(title => {
  db.run(`INSERT INTO photo (title) VALUES (?)`, [title], function(err) {
    if (err) {
      console.error(`Error inserting "${title}": ${err.message}`);
    } else {
      console.log(`Inserted "${title}" with ID ${this.lastID}`);
    }
  });
});
