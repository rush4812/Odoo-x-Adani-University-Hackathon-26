const express = require('express');
const db = require('../db/database');
const router = express.Router();

// Get single maintenance request
router.get('/:id', (req, res) => {
  db.get(`
    SELECT mr.*, 
           e.name as equipment_name,
           tm.name as technician_name
    FROM maintenance_requests mr
    LEFT JOIN equipment e ON mr.equipment_id = e.id
    LEFT JOIN team_members tm ON mr.assigned_technician_id = tm.id
    WHERE mr.id = ?
  `, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Request not found' });
    res.json(row);
  });
});

// Get all maintenance requests (kanban view)
router.get('/', (req, res) => {
  db.all(`
    SELECT mr.*, 
           e.name as equipment_name,
           e.category as equipment_category,
           tm.name as technician_name,
           t.name as team_name,
           ta.performance_rating,
           CASE 
             WHEN mr.scheduled_date < date('now') AND mr.stage NOT IN ('Repaired', 'Scrap') 
             THEN 1 ELSE 0 
           END as is_overdue
    FROM maintenance_requests mr
    LEFT JOIN equipment e ON mr.equipment_id = e.id
    LEFT JOIN team_members tm ON mr.assigned_technician_id = tm.id
    LEFT JOIN teams t ON e.maintenance_team_id = t.id
    LEFT JOIN task_activities ta ON mr.id = ta.request_id
    ORDER BY mr.created_at DESC
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get requests by stage (for kanban)
router.get('/kanban', (req, res) => {
  const stages = ['New', 'In Progress', 'Repaired', 'Scrap'];
  const kanban = {};
  
  let completed = 0;
  stages.forEach(stage => {
    db.all(`
      SELECT mr.*, 
             e.name as equipment_name,
             tm.name as technician_name,
             CASE 
               WHEN mr.scheduled_date < date('now') AND mr.stage NOT IN ('Repaired', 'Scrap') 
               THEN 1 ELSE 0 
             END as is_overdue
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN team_members tm ON mr.assigned_technician_id = tm.id
      WHERE mr.stage = ?
      ORDER BY mr.created_at DESC
    `, [stage], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      kanban[stage] = rows;
      completed++;
      if (completed === stages.length) {
        res.json(kanban);
      }
    });
  });
});

// Create maintenance request
router.post('/', (req, res) => {
  const { subject, equipment_id, request_type, priority, assigned_technician_id, 
          scheduled_date, created_by } = req.body;
  
  db.run(`INSERT INTO maintenance_requests (subject, equipment_id, request_type, priority, 
          assigned_technician_id, scheduled_date, created_by) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`, 
    [subject, equipment_id, request_type, priority, assigned_technician_id, 
     scheduled_date, created_by], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, message: 'Request created' });
  });
});

// Update request stage (drag & drop)
router.patch('/:id/stage', (req, res) => {
  const { stage } = req.body;
  
  db.run('UPDATE maintenance_requests SET stage = ? WHERE id = ?', [stage, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    // If moved to Scrap, mark equipment as unusable
    if (stage === 'Scrap') {
      db.run(`UPDATE equipment SET status = 'Scrap' 
              WHERE id = (SELECT equipment_id FROM maintenance_requests WHERE id = ?)`, 
        [req.params.id]);
    }
    
    res.json({ message: 'Stage updated' });
  });
});

// Get preventive requests for calendar
router.get('/preventive', (req, res) => {
  db.all(`
    SELECT mr.*, e.name as equipment_name
    FROM maintenance_requests mr
    LEFT JOIN equipment e ON mr.equipment_id = e.id
    WHERE mr.request_type = 'Preventive'
    ORDER BY mr.scheduled_date
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;