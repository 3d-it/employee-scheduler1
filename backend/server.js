const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

const db = new sqlite3.Database("./scheduler.db");
const JWT_SECRET = "CHANGE_THIS_SECRET";

/* =====================
   DATABASE
===================== */

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password_hash TEXT,
      role TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER,
      day TEXT,
      shift_time TEXT,
      shift_type TEXT
    )
  `);
});

/* =====================
   AUTH
===================== */

function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function adminOnly(req, res, next) {
  if (req.user.role !== "admin") return res.sendStatus(403);
  next();
}

/* =====================
   LOGIN
===================== */

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (!user) return res.status(401).send("Invalid credentials");

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).send("Invalid credentials");

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token, role: user.role });
  });
});

/* =====================
   EMPLOYEES (ADMIN)
===================== */

app.get("/admin/employees", auth, adminOnly, (req, res) => {
  db.all("SELECT id, name FROM employees ORDER BY name", (err, rows) => {
    res.json(rows);
  });
});

app.post("/admin/employees", auth, adminOnly, (req, res) => {
  db.run(
    "INSERT INTO employees (name) VALUES (?)",
    [req.body.name],
    function () {
      res.json({ id: this.lastID });
    }
  );
});

app.delete("/admin/employees/:id", auth, adminOnly, (req, res) => {
  db.run("DELETE FROM employees WHERE id = ?", [req.params.id]);
  db.run("DELETE FROM schedules WHERE employee_id = ?", [req.params.id]);
  res.sendStatus(204);
});

/* =====================
   SHIFTS (NO WEEK)
===================== */

app.get("/admin/shifts", auth, adminOnly, (req, res) => {
  db.all("SELECT * FROM schedules", (err, rows) => {
    res.json(rows);
  });
});

app.post("/admin/shifts", auth, adminOnly, (req, res) => {
  const { employeeId, day, time, type } = req.body;

  db.run(
    `
    INSERT INTO schedules (employee_id, day, shift_time, shift_type)
    VALUES (?, ?, ?, ?)
    `,
    [employeeId, day, time, type],
    () => res.sendStatus(200)
  );
});

app.delete("/admin/shifts", auth, adminOnly, (req, res) => {
  const { employeeId, day } = req.body;

  db.run(
    "DELETE FROM schedules WHERE employee_id = ? AND day = ?",
    [employeeId, day],
    () => res.sendStatus(204)
  );
});

/* =====================
   SERVER
===================== */

app.listen(4000, () =>
  console.log("Backend running on http://localhost:4000")
);
