const express = require('express');
const db = require('../db/database');
const router = express.Router();

// Get all teams
router.get('/', (req, res) => {
  db.all(`
    SELECT t.*, 
           COUNT(tm.id) as member_count
    FROM teams t
    LEFT JOIN team_members tm ON t.id = tm.team_id
    GROUP BY t.id
    ORDER BY t.name
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get team members
router.get('/:id/members', (req, res) => {
  db.all('SELECT * FROM team_members WHERE team_id = ? ORDER BY name', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create team
router.post('/', (req, res) => {
  const { name, description, location, company } = req.body;
  db.run('INSERT INTO teams (name, description, location, company) VALUES (?, ?, ?, ?)', 
    [name, description, location, company], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, message: 'Team created' });
  });
});

// Add team member
router.post('/:id/members', (req, res) => {
  const { name, email, role, is_default_technician } = req.body;
  db.run('INSERT INTO team_members (team_id, name, email, role, is_default_technician) VALUES (?, ?, ?, ?, ?)', 
    [req.params.id, name, email, role, is_default_technician || 0], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, message: 'Member added' });
  });
});

module.exports = router;