// backend/server.js

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const app = express();

// ======================
// MIDDLEWARE
// ======================
app.use(helmet());
app.use(cors());
app.use(express.json());

// ======================
// ENV + PORT (RENDER SAFE)
// ======================
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET is not set");
  process.exit(1);
}

// ======================
// SQLITE DATABASE
// ======================
const dbPath = path.join(__dirname, "scheduler.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Failed to connect to SQLite:", err);
    process.exit(1);
  }
  console.log("✅ Connected to SQLite database");
});

// ======================
// DATABASE TABLES
// ======================
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      day TEXT NOT NULL,
      time TEXT NOT NULL,
      type TEXT NOT NULL,
      FOREIGN KEY(employee_id) REFERENCES employees(id)
    )
  `);
});

// ======================
// AUTH MIDDLEWARE
// ======================
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token" });

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
}

// ======================
// API ROUTES
// ======================

// Health check (Render test)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ---------- LOGIN ----------
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: "Invalid login" });
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid login" });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "8h" }
      );

      res.json({ token, role: user.role });
    }
  );
});

// ---------- EMPLOYEES ----------
app.get("/employees", authenticate, (req, res) => {
  db.all("SELECT * FROM employees", (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.post("/employees", authenticate, adminOnly, (req, res) => {
  const { name } = req.body;
  db.run(
    "INSERT INTO employees (name) VALUES (?)",
    [name],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ id: this.lastID, name });
    }
  );
});

app.delete("/employees/:id", authenticate, adminOnly, (req, res) => {
  db.run(
    "DELETE FROM employees WHERE id = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

// ---------- SHIFTS ----------
app.get("/shifts", authenticate, (req, res) => {
  db.all("SELECT * FROM shifts", (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.post("/shifts", authenticate, adminOnly, (req, res) => {
  const { employee_id, day, time, type } = req.body;

  db.run(
    `INSERT INTO shifts (employee_id, day, time, type)
     VALUES (?, ?, ?, ?)`,
    [employee_id, day, time, type],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ id: this.lastID });
    }
  );
});

app.delete("/shifts/:id", authenticate, adminOnly, (req, res) => {
  db.run(
    "DELETE FROM shifts WHERE id = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

// ======================
// 🔑 SERVE REACT FRONTEND (FIXED)
// ======================

// Path to React build folder
const frontendBuildPath = path.join(__dirname, "../frontend/build");

// Serve static React files
app.use(express.static(frontendBuildPath));

// ✅ FIXED catch-all route (Node 22 safe)
app.get("/*", (req, res) => {
  res.sendFile(path.join(frontendBuildPath, "index.html"));
});

// ======================
// START SERVER (RENDER SAFE)
// ======================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
