const db = require('./database');

function createAsset(data) {
  const stmt = `INSERT INTO assets (name, category, asset_code, purchase_date, warranty_expiry, maintenance_interval_days, status, notes, last_maintenance_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [data.name, data.category, data.asset_code, data.purchase_date, data.warranty_expiry, data.maintenance_interval_days || null, data.status || 'Active', data.notes || null, data.last_maintenance_date || null];
  return new Promise((resolve, reject) => {
    db.run(stmt, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, ...data });
    });
  });
}

function updateAsset(id, data) {
  const fields = [];
  const params = [];
  Object.keys(data).forEach((k) => {
    fields.push(`${k} = ?`);
    params.push(data[k]);
  });
  params.push(id);
  const stmt = `UPDATE assets SET ${fields.join(', ')} WHERE id = ?`;
  return new Promise((resolve, reject) => {
    db.run(stmt, params, function (err) {
      if (err) return reject(err);
      resolve(true);
    });
  });
}

function softDeleteAsset(id) {
  return new Promise((resolve, reject) => {
    db.run(`UPDATE assets SET deleted = 1 WHERE id = ?`, [id], function (err) {
      if (err) return reject(err);
      resolve(true);
    });
  });
}

function getAssetById(id) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM assets WHERE id = ? AND deleted = 0`, [id], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function listAssets(filter) {
  filter = filter || {};
  let stmt = `SELECT * FROM assets WHERE deleted = 0`;
  const params = [];
  if (filter.search) {
    stmt += ` AND (name LIKE ? OR asset_code LIKE ?)`;
    params.push(`%${filter.search}%`, `%${filter.search}%`);
  }
  if (filter.category) {
    stmt += ` AND category = ?`;
    params.push(filter.category);
  }
  stmt += ` ORDER BY id DESC`;
  return new Promise((resolve, reject) => {
    db.all(stmt, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = { createAsset, updateAsset, softDeleteAsset, getAssetById, listAssets };
