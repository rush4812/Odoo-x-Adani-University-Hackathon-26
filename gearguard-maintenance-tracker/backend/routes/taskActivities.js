const express = require('express');
const db = require('../db/database');
const router = express.Router();

// Get task activity by request ID
router.get('/request/:id', (req, res) => {
  db.get('SELECT * FROM task_activities WHERE request_id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || {});
  });
});

// Start task (log start time)
router.post('/:requestId/start', (req, res) => {
  const startTime = new Date().toISOString();
  
  db.run(`INSERT OR REPLACE INTO task_activities (request_id, actual_start_time) 
          VALUES (?, ?)`, [req.params.requestId, startTime], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    // Update request stage to In Progress
    db.run('UPDATE maintenance_requests SET stage = ? WHERE id = ?', 
      ['In Progress', req.params.requestId]);
    
    res.json({ message: 'Task started', start_time: startTime });
  });
});

// Update work progress
router.patch('/:requestId/progress', (req, res) => {
  const { work_context, observations, parts_used } = req.body;
  
  db.run(`UPDATE task_activities 
          SET work_context = ?, observations = ?, parts_used = ?
          WHERE request_id = ?`, 
    [work_context, observations, parts_used, req.params.requestId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Progress updated' });
  });
});

// Complete task (log finish time and calculate duration)
router.post('/:requestId/complete', (req, res) => {
  const { performance_rating, feedback } = req.body;
  const finishTime = new Date().toISOString();
  
  // Get start time to calculate duration
  db.get('SELECT actual_start_time FROM task_activities WHERE request_id = ?', 
    [req.params.requestId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    
    let totalMinutes = 0;
    if (row && row.actual_start_time) {
      const start = new Date(row.actual_start_time);
      const finish = new Date(finishTime);
      totalMinutes = Math.round((finish - start) / (1000 * 60));
    }
    
    db.run(`UPDATE task_activities 
            SET actual_finish_time = ?, total_time_minutes = ?, 
                performance_rating = ?, feedback = ?
            WHERE request_id = ?`, 
      [finishTime, totalMinutes, performance_rating, feedback, req.params.requestId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      // Update request stage to Repaired
      db.run('UPDATE maintenance_requests SET stage = ? WHERE id = ?', 
        ['Repaired', req.params.requestId]);
      
      res.json({ 
        message: 'Task completed', 
        finish_time: finishTime, 
        total_minutes: totalMinutes 
      });
    });
  });
});

// Get all completed tasks for reporting
router.get('/completed', (req, res) => {
  db.all(`
    SELECT ta.*, mr.subject, mr.request_type, e.name as equipment_name, 
           tm.name as technician_name
    FROM task_activities ta
    JOIN maintenance_requests mr ON ta.request_id = mr.id
    JOIN equipment e ON mr.equipment_id = e.id
    LEFT JOIN team_members tm ON mr.assigned_technician_id = tm.id
    WHERE ta.actual_finish_time IS NOT NULL
    ORDER BY ta.actual_finish_time DESC
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;