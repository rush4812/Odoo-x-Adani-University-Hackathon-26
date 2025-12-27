const express = require('express');
const db = require('../db/database');
const router = express.Router();

// Get all equipment with team info
router.get('/', (req, res) => {
  db.all(`
    SELECT e.*, 
           t.name as team_name,
           tm.name as technician_name,
           COUNT(mr.id) as open_requests
    FROM equipment e
    LEFT JOIN teams t ON e.maintenance_team_id = t.id
    LEFT JOIN team_members tm ON e.default_technician_id = tm.id
    LEFT JOIN maintenance_requests mr ON e.id = mr.equipment_id AND mr.stage NOT IN ('Repaired', 'Scrap')
    GROUP BY e.id
    ORDER BY e.name
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get equipment maintenance requests
router.get('/:id/requests', (req, res) => {
  db.all(`
    SELECT mr.*, tm.name as technician_name
    FROM maintenance_requests mr
    LEFT JOIN team_members tm ON mr.assigned_technician_id = tm.id
    WHERE mr.equipment_id = ?
    ORDER BY mr.created_at DESC
  `, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create equipment
router.post('/', (req, res) => {
  const { name, serial_number, category, department, assigned_employee, 
          purchase_date, warranty_expiry, physical_location, 
          maintenance_team_id, default_technician_id, status, notes } = req.body;
  
  db.run(`INSERT INTO equipment (name, serial_number, category, department, assigned_employee, 
          purchase_date, warranty_expiry, physical_location, maintenance_team_id, 
          default_technician_id, status, notes) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    [name, serial_number, category, department, assigned_employee, 
     purchase_date, warranty_expiry, physical_location, 
     maintenance_team_id, default_technician_id, status, notes], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, message: 'Equipment created' });
  });
});

// Update equipment status (for scrap logic)
router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  db.run('UPDATE equipment SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Status updated' });
  });
});

module.exports = router;