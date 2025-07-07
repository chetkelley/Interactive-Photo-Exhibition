
# Interactive Photo Exhibition

This is a lightweight Node.js web app designed for interactive photo exhibitions. Visitors scan a QR code next to a photo, submit their own description of what they see, and then view the photo's title along with descriptions submitted by other visitors.

✅ **Key Features**
- No user accounts (anonymous contributions)
- Visitors must enter a description before seeing others' impressions
- Descriptions are shown instantly after submission (their own at the top)
- Titles + descriptions are stored in a local SQLite database
- Designed to run on a Raspberry Pi (e.g. Raspberry Pi 5)
- Can work on local Wi-Fi without Internet access
- Easily generate QR codes linking to each photo

---

## 🚀 **How It Works**
- Each photo has a record in the SQLite database with a unique `id` and title.
- QR codes link to URLs like `http://<pi-ip>/photo/1`, where `1` is the photo's database ID.
- When visitors scan the code, they’re prompted to submit a description.
- After submitting, they see:
  - The photo’s title
  - A list of descriptions others have entered

---

## 📦 **Installation Instructions**

### 1️⃣ **Prerequisites**
- Raspberry Pi (or other Linux server)
- Node.js + npm installed  
- SQLite3 installed  
- `qrencode` installed (for generating QR codes)

### 2️⃣ **Clone this repo**
```bash
git clone https://github.com/chetkelley/Interactive-Photo-Exhibition.git
cd Interactive-Photo-Exhibition
```

### 3️⃣ **Install dependencies**
```bash
npm install
```

### 4️⃣ **Start the app**
```bash
node app.js
```
➡ The app will listen on `http://<pi-ip>:3000/`

### 5️⃣ **Add photo titles**
Create a file `titles.txt` with one photo title per line:
```
Sunset Over Berlin
City Park at Dawn
Old Town Square
```
Run:
```bash
node add_titles.js
```
➡ This will insert the titles into the database and print their assigned IDs.

### 6️⃣ **Generate QR codes**
For each photo ID:
```bash
qrencode -o photo_1.png "http://<pi-ip>:3000/photo/1"
qrencode -o photo_2.png "http://<pi-ip>:3000/photo/2"
```
➡ Replace `<pi-ip>` with your Pi’s actual IP address.

When you get a static IP for the venue, simply regenerate the QR codes.

---

## ⚙️ **Project Structure**
```
.
├── app.js               # Main server code
├── add_titles.js        # Helper to bulk-insert photo titles
├── data.db              # SQLite database (excluded via .gitignore)
├── views/               # EJS templates
├── public/              # Static files (optional)
├── package.json         # Node.js dependencies
├── .gitignore           # Files and folders to exclude from git
```

---

## 📝 **Deployment Notes**
- You can run this app on a Raspberry Pi without Internet — just provide local Wi-Fi access.
- To start the app on boot, set up a systemd service (ask if you want help creating this).
- Remember to regenerate QR codes if the IP address changes.
- The app listens on port 3000 (adjustable in `app.js`).

---

## 🔒 **.gitignore**
This repo excludes:
- `data.db` — your live database (keeps visitor input private)
- `node_modules/` — dependencies are installed on deploy
- logs, temp files

---

## 📌 **Known Limitations**
- No authentication (by design — anonymous usage)
- All data is stored locally in `data.db`
- No built-in export for descriptions (can be added!)

---

## 🤝 **Contributing**
Feel free to fork, adapt, or suggest improvements via pull requests.

---

## 📜 **License**
MIT License (or add your preferred license)

---

## 🙏 **Credits**
Built for a photo exhibit at a public library by [Chet Kelley](https://github.com/chetkelley) with guidance from OpenAI’s ChatGPT.
