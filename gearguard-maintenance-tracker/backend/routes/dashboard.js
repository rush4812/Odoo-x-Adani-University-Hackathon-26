const express = require('express');
const router = express.Router();
const db = require('../db/database');

function addDays(dateStr, days) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  d.setDate(d.getDate() + Number(days));
  return d;
}

router.get('/', async (req, res) => {
  try {
    const now = new Date();

    // Total assets
    const total = await new Promise((resolve, reject) => {
      db.get(`SELECT COUNT(*) as cnt FROM assets WHERE deleted = 0`, [], (err, row) => {
        if (err) return reject(err);
        resolve(row.cnt);
      });
    });

    // Fetch all assets with maintenance interval and last maintenance
    const assets = await new Promise((resolve, reject) => {
      db.all(`SELECT id, name, maintenance_interval_days, last_maintenance_date FROM assets WHERE deleted = 0`, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

    let overdue = 0;
    let due = 0;

    assets.forEach(a => {
      const interval = a.maintenance_interval_days;
      if (!interval) return;
      const last = a.last_maintenance_date || a.created_at || null;
      const lastDate = last ? new Date(last) : new Date();
      const next = new Date(lastDate);
      next.setDate(next.getDate() + Number(interval));
      if (next < now) overdue++;
      else {
        const in7 = new Date(); in7.setDate(in7.getDate() + 7);
        if (next <= in7) due++;
      }
    });

    // Completed maintenance count (total logs)
    const completed = await new Promise((resolve, reject) => {
      db.get(`SELECT COUNT(*) as cnt FROM maintenance_logs`, [], (err, row) => {
        if (err) return reject(err);
        resolve(row.cnt);
      });
    });

    // Recent maintenance activity
    const recent = await new Promise((resolve, reject) => {
      db.all(`SELECT ml.*, a.name as asset_name FROM maintenance_logs ml LEFT JOIN assets a ON a.id = ml.asset_id ORDER BY maintenance_date DESC LIMIT 5`, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

    res.json({ totalAssets: total, maintenanceDue: due, overdueMaintenance: overdue, completedMaintenance: completed, recent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
