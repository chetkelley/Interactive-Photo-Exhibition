# Interactive Photo Exhibition

This is a lightweight Node.js web app designed for interactive photo exhibitions. Visitors scan a QR code next to a photo, submit their own description of what they see, and then view the photo's title along with descriptions submitted by other visitors.

✅ **Key Features**
- No user accounts (anonymous contributions)
- Visitors must enter a description before seeing others' impressions
- Descriptions are shown instantly after submission (their own at the top)
- Titles + descriptions are stored in a PostgreSQL database
- Persistent session storage in PostgreSQL for better scalability
- Sanitizes user input to prevent HTML/script injection
- Designed to run on a Raspberry Pi or cloud platforms (Railway, VPS, etc.)
- Supports environment variables for configuration
- Easily generate QR codes linking to each photo

---

## 🚀 **How It Works**
- Each photo has a record in the PostgreSQL database with a unique `id` and title.
- QR codes link to URLs like `http://<domain-or-ip>/photo/1`, where `1` is the photo's database ID.
- When visitors scan the code, they’re prompted to submit a description.
- After submitting, they see:
  - The photo’s title
  - A list of descriptions others have entered

---

## 📦 **Installation Instructions**

### 1️⃣ **Prerequisites**
- Node.js + npm installed  
- PostgreSQL database (local or hosted, e.g., Railway PostgreSQL plugin)  
- `qrencode` installed (for generating QR codes)  
- Create a `.env` file based on `.env.example` (see below)

### 2️⃣ **Clone this repo**
```bash
  git clone https://github.com/chetkelley/Interactive-Photo-Exhibition.git
  cd Interactive-Photo-Exhibition

3️⃣ Install dependencies
  npm install

4️⃣ Create database schema

Run the SQL commands in schema.sql (included) on your PostgreSQL database to create the necessary tables.
	•	On Railway: use their SQL editor to run schema.sql once.
	•	On local PostgreSQL:
  psql -d your_database -f schema.sql

5️⃣ Configure environment variables 
  Create a .env file in the project root (do not commit this file) with content like:
  DATABASE_URL=postgresql://username:password@host:port/database
  SESSION_SECRET=your_super_secret_session_key
  PGSSLMODE=disable # optional, if your DB does not require SSL
  PORT=3000

6️⃣ Start the app
  npm start

➡ The app will listen on the port specified in PORT or default to 3000.

7️⃣ Add photo titles

Use a script or SQL to insert photo titles into the photo table (no automated script included now, but you can insert manually):
  INSERT INTO photo (title) VALUES ('Sunset Over Berlin');
  INSERT INTO photo (title) VALUES ('City Park at Dawn');

8️⃣ Generate QR codes
  For each photo ID:
  qrencode -o photo_1.png "http://<domain-or-ip>:3000/photo/1"
  qrencode -o photo_2.png "http://<domain-or-ip>:3000/photo/2"

➡ Replace <domain-or-ip> with your actual hostname or IP address.

⚙️ Project Structure
.
├── app.js               # Main server code
├── schema.sql           # PostgreSQL schema file (tables and constraints)
├── views/               # EJS templates
├── public/              # Static files (optional)
├── package.json         # Node.js dependencies
├── .env.example         # Sample environment variable config
├── .gitignore           # Files and folders excluded from git

📝 Deployment Notes
	•	For Raspberry Pi local deployment, install and configure PostgreSQL or use a managed PostgreSQL.
	•	For cloud deployment (Railway, VPS), set environment variables in your hosting dashboard.
	•	Use the schema.sql file to initialize your database.
	•	Persistent sessions stored in PostgreSQL avoid session loss on server restart.
	•	The app listens on port specified by PORT environment variable or 3000 by default.
	•	Remember to regenerate QR codes if the domain or IP changes.

⸻

🔒 .gitignore

This repo excludes:
	•	.env — your environment secrets
	•	node_modules/ — dependencies are installed on deploy
	•	logs, temp files

⸻

📌 Known Limitations
	•	No authentication (anonymous usage by design)
	•	No built-in export for descriptions (can be added!)
	•	Photo title adding is manual or via SQL (no script included)

⸻

🤝 Contributing

Feel free to fork, adapt, or suggest improvements via pull requests.

⸻

📜 License

MIT License (or add your preferred license)

⸻

🙏 Credits

Built for a photo exhibit at a public library by Chet Kelley with guidance from OpenAI’s ChatGPT.