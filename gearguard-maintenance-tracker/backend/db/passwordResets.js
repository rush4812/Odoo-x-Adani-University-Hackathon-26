const db = require("./database");

function upsertOTP(email, otp, expiresAt) {
  return new Promise((resolve, reject) => {
    // Remove any existing entries for email then insert
    db.run(`DELETE FROM password_resets WHERE email = ?`, [email], function (dErr) {
      if (dErr) return reject(dErr);
      db.run(`INSERT INTO password_resets (email, otp, expires_at) VALUES (?, ?, ?)`, [email, otp, expiresAt], function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, email, otp, expires_at: expiresAt });
      });
    });
  });
}

function getOTP(email) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM password_resets WHERE email = ?`, [email], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function deleteOTP(email) {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM password_resets WHERE email = ?`, [email], function (err) {
      if (err) return reject(err);
      resolve(true);
    });
  });
}

module.exports = {
  upsertOTP,
  getOTP,
  deleteOTP,
};
