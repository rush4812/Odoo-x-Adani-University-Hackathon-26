const db = require('./database');

function createLog(data) {
  const stmt = `INSERT INTO maintenance_logs (asset_id, maintenance_date, maintenance_type, description, cost, performed_by, remarks) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const params = [data.asset_id, data.maintenance_date, data.maintenance_type, data.description, data.cost || 0, data.performed_by || null, data.remarks || null];
  return new Promise((resolve, reject) => {
    db.run(stmt, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, ...data });
    });
  });
}

function listLogs(filter) {
  filter = filter || {};
  let stmt = `SELECT maintenance_logs.*, assets.name as asset_name FROM maintenance_logs LEFT JOIN assets ON assets.id = maintenance_logs.asset_id WHERE 1=1`;
  const params = [];
  if (filter.asset_id) { stmt += ` AND asset_id = ?`; params.push(filter.asset_id); }
  if (filter.from && filter.to) { stmt += ` AND maintenance_date BETWEEN ? AND ?`; params.push(filter.from, filter.to); }
  if (filter.type) { stmt += ` AND maintenance_type = ?`; params.push(filter.type); }
  stmt += ` ORDER BY maintenance_date DESC`;
  return new Promise((resolve, reject) => {
    db.all(stmt, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = { createLog, listLogs };
