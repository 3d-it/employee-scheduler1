const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const db = new sqlite3.Database("./scheduler.db");

// CHANGE THESE VALUES
const OLD_EMAIL = "admin@yourdomain.com"; // Use last know email i.e. original value from below
const NEW_EMAIL = "admin4@yourdomain.com"; // Change to new "Email@.com"
const NEW_PASSWORD = "Admin#202"; // optional -> To update password change value; Then in terminal backend file run command -> "node seedAdmin.js" <- to update password to new password

(async () => {
  const hash = await bcrypt.hash(NEW_PASSWORD, 10);

  db.run(
    `
    UPDATE users
    SET email = ?, password_hash = ?
    WHERE email = ?
    `,
    [NEW_EMAIL, hash, OLD_EMAIL],
    function (err) {
      if (err) {
        console.error("❌ Error:", err.message);
      } else if (this.changes === 0) {
        console.log("⚠️ No user found to update");
      } else {
        console.log("✅ Email and password updated");
      }
      db.close();
    }
  );
})();
