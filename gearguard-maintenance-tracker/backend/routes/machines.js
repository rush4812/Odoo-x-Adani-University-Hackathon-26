const express = require("express");
const router = express.Router();
const db = require("../db/database");

// Add new machine
router.post("/", (req, res) => {
  const { name, category, location } = req.body;

  db.run(
    "INSERT INTO machines (name, category, location) VALUES (?, ?, ?)",
    [name, category, location],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({
          message: "Machine added successfully",
          id: this.lastID
        });
      }
    }
  );
});

// Get all machines
router.get("/", (req, res) => {
  db.all("SELECT * FROM machines", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

module.exports = router;
