const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./scheduler.db");

db.all(
  "SELECT id, email, role FROM users",
  (err, rows) => {
    if (err) {
      console.error("❌ Error:", err.message);
    } else {
      console.table(rows);
    }
    db.close();
  }
);