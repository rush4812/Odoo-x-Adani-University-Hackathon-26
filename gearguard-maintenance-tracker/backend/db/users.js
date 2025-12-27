const db = require("./database");

function createUser(name, email, passwordHash) {
  return new Promise((resolve, reject) => {
    const stmt = `INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`;
    db.run(stmt, [name, email, passwordHash], function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, name, email });
    });
  });
}

function getUserByEmail(email) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

module.exports = {
  createUser,
  getUserByEmail,
};
