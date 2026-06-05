# FraudShield AI — Setup Instructions

## Prerequisites
- **XAMPP** (Apache + MySQL) — [Download](https://www.apachefriends.org/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **Python 3.8+** — [Download](https://www.python.org/) *(optional for Flask API)*

---

## 📁 Project Structure
```
d:\credit\
├── frontend/    → React + Vite + Tailwind frontend
├── backend/     → PHP Core backend (copy to XAMPP htdocs)
├── database/    → MySQL schema + seed data
├── api/         → Python Flask fraud detection API
└── README.md
```

---

## 🗄️ Step 1: Database Setup (XAMPP)

1. Start **XAMPP** → Start **Apache** and **MySQL**
2. Open **phpMyAdmin**: http://localhost/phpmyadmin
3. Click **Import** → Select `database/schema.sql` → Click **Go**
4. After schema imports, click **Import** again → Select `database/seed.sql` → Click **Go**

**Default Credentials:**
| Role  | Email                     | Password   |
|-------|---------------------------|------------|
| Admin | admin@fraudshield.ai      | `password` |
| User  | john@example.com          | `password` |

> ⚠️ **Note**: The seed.sql uses a bcrypt hash for the literal word `password`.
> For security in production, change all passwords after setup.

---

## 🐘 Step 2: PHP Backend Setup (XAMPP)

1. Copy the `backend/` folder to your XAMPP htdocs directory:
   ```
   Copy d:\credit\backend  →  C:\xampp\htdocs\fraudshield\backend
   ```
2. (Optional) Edit `C:\xampp\htdocs\fraudshield\backend\config\database.php`:
   - Change `DB_PASS` if your MySQL root has a password (default is empty for XAMPP)
3. Enable Apache **mod_rewrite** if needed (usually on by default in XAMPP)
4. Test the API: http://localhost/fraudshield/backend/api/auth/me.php

---

## 🐍 Step 3: Python Flask API (Optional but Recommended)

```powershell
cd d:\credit\api
pip install -r requirements.txt
python app.py
```

The Flask API will run on **http://localhost:5001**

> ✅ If Flask is not running, the frontend automatically uses a built-in JavaScript mock model — the app still works!

---

## ⚛️ Step 4: React Frontend

```powershell
cd d:\credit\frontend
npm install       # (already done if you ran the setup)
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔗 How the Services Connect

```
Browser (localhost:5173)
    ↕ React Frontend
    ├── /phpapi/*  → Proxy to XAMPP (localhost/fraudshield/backend)
    └── localhost:5001 → Flask Fraud Detection API
```

> The Vite dev server proxies `/phpapi` requests to XAMPP automatically.

---

## 📋 Sample CSV Format

Upload this to the CSV analyzer:
```csv
amount,merchant,location,category
150.00,Amazon,New York NY,shopping
5500.00,Unknown Vendor,Lagos Nigeria,general
45.99,Starbucks,Chicago IL,food
2800.00,Crypto Exchange XYZ,Unknown,crypto
89.99,Netflix,Online,subscription
```

---

## 🚀 Features Overview

| Feature | Description |
|---------|-------------|
| 🔐 Auth | Role-based login (Admin/User) with PHP sessions |
| 🔍 Detect | Real-time AI fraud analysis (Flask or mock) |
| 📂 CSV Upload | Bulk analyze up to 100 transactions |
| 📊 Charts | Line, Bar, Doughnut charts with Chart.js |
| 🔔 Alerts | In-app notifications for fraud events |
| 🎙️ Voice | AI assistant with speech-to-text + TTS |
| 👑 Admin | User CRUD, all transactions, analytics, system logs |
| ⬇️ Export | Download transaction history as CSV |

---

## 🛠️ Troubleshooting

**Backend returns 404 / CORS errors:**
- Make sure the backend folder is at `C:\xampp\htdocs\fraudshield\backend\`
- Restart Apache in XAMPP

**Login fails:**
- Check that you imported both `schema.sql` AND `seed.sql` in phpMyAdmin

**Flask API not responding:**
- The app falls back to a JS mock — functionality is preserved
- To start Flask: `cd d:\credit\api && python app.py`

**Charts not loading:**
- Ensure the backend is running and returning data
- Mock data is displayed automatically when backend is offline
