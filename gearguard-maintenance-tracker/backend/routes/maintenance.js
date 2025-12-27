const express = require("express");
const router = express.Router();
const db = require("../db/database");

// Add maintenance record
router.post("/", (req, res) => {
  const { machine_id, service_date, status, notes } = req.body;

  db.run(
    `INSERT INTO maintenance (machine_id, service_date, status, notes)
     VALUES (?, ?, ?, ?)`,
    [machine_id, service_date, status, notes],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({
          message: "Maintenance record added",
          id: this.lastID
        });
      }
    }
  );
});

// Get maintenance records
router.get("/", (req, res) => {
  db.all(
    `SELECT maintenance.*, machines.name AS machine_name
     FROM maintenance
     LEFT JOIN machines ON machines.id = maintenance.machine_id`,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows);
      }
    }
  );
});

module.exports = router;
