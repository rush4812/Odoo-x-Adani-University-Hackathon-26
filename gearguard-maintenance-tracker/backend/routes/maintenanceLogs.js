const express = require('express');
const router = express.Router();
const maintenanceLogs = require('../db/maintenanceLogs');
const assetsDb = require('../db/assets');

// Create maintenance log and update asset last_maintenance_date
router.post('/', async (req, res) => {
  try {
    const log = await maintenanceLogs.createLog(req.body);
    // update asset last_maintenance_date
    if (req.body.asset_id && req.body.maintenance_date) {
      await assetsDb.updateAsset(req.body.asset_id, { last_maintenance_date: req.body.maintenance_date });
    }
    res.json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List logs with filters
router.get('/', async (req, res) => {
  try {
    const logs = await maintenanceLogs.listLogs(req.query);
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
