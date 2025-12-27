const express = require('express');
const db = require('../db/database');
const router = express.Router();

// Equipment history report
router.get('/equipment-history', (req, res) => {
  db.all(`
    SELECT e.name as equipment_name, e.category, e.department,
           COUNT(mr.id) as total_requests,
           COUNT(CASE WHEN mr.request_type = 'Preventive' THEN 1 END) as preventive_count,
           COUNT(CASE WHEN mr.request_type = 'Corrective' THEN 1 END) as corrective_count,
           COUNT(CASE WHEN mr.stage = 'Repaired' THEN 1 END) as completed_count,
           AVG(ta.total_time_minutes) as avg_repair_time,
           AVG(ta.performance_rating) as avg_rating
    FROM equipment e
    LEFT JOIN maintenance_requests mr ON e.id = mr.equipment_id
    LEFT JOIN task_activities ta ON mr.id = ta.request_id
    GROUP BY e.id, e.name
    ORDER BY total_requests DESC
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Maintenance costs report
router.get('/maintenance-costs', (req, res) => {
  db.all(`
    SELECT e.name as equipment_name, e.category,
           COUNT(ml.id) as maintenance_count,
           SUM(ml.cost) as total_cost,
           AVG(ml.cost) as avg_cost,
           MAX(ml.cost) as max_cost
    FROM equipment e
    LEFT JOIN assets a ON e.name = a.name
    LEFT JOIN maintenance_logs ml ON a.id = ml.asset_id
    WHERE ml.cost > 0
    GROUP BY e.id, e.name
    ORDER BY total_cost DESC
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Technician performance report
router.get('/technician-performance', (req, res) => {
  db.all(`
    SELECT tm.name as technician_name, t.name as team_name,
           COUNT(mr.id) as total_assignments,
           COUNT(CASE WHEN mr.stage = 'Repaired' THEN 1 END) as completed_tasks,
           AVG(ta.total_time_minutes) as avg_completion_time,
           AVG(ta.performance_rating) as avg_rating,
           COUNT(CASE WHEN mr.scheduled_date < date('now') AND mr.stage NOT IN ('Repaired', 'Scrap') THEN 1 END) as overdue_tasks
    FROM team_members tm
    LEFT JOIN teams t ON tm.team_id = t.id
    LEFT JOIN maintenance_requests mr ON tm.id = mr.assigned_technician_id
    LEFT JOIN task_activities ta ON mr.id = ta.request_id
    GROUP BY tm.id, tm.name
    HAVING total_assignments > 0
    ORDER BY avg_rating DESC, completed_tasks DESC
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Downtime analysis
router.get('/downtime-analysis', (req, res) => {
  db.all(`
    SELECT e.name as equipment_name, e.category, e.department,
           COUNT(CASE WHEN mr.request_type = 'Corrective' THEN 1 END) as breakdown_count,
           SUM(CASE WHEN mr.request_type = 'Corrective' THEN ta.total_time_minutes ELSE 0 END) as total_downtime_minutes,
           AVG(CASE WHEN mr.request_type = 'Corrective' THEN ta.total_time_minutes END) as avg_downtime_minutes
    FROM equipment e
    LEFT JOIN maintenance_requests mr ON e.id = mr.equipment_id
    LEFT JOIN task_activities ta ON mr.id = ta.request_id
    GROUP BY e.id, e.name
    HAVING breakdown_count > 0
    ORDER BY total_downtime_minutes DESC
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Preventive vs Corrective ratio
router.get('/maintenance-ratio', (req, res) => {
  db.get(`
    SELECT 
      COUNT(CASE WHEN request_type = 'Preventive' THEN 1 END) as preventive_count,
      COUNT(CASE WHEN request_type = 'Corrective' THEN 1 END) as corrective_count,
      COUNT(*) as total_requests,
      ROUND(COUNT(CASE WHEN request_type = 'Preventive' THEN 1 END) * 100.0 / COUNT(*), 2) as preventive_percentage,
      ROUND(COUNT(CASE WHEN request_type = 'Corrective' THEN 1 END) * 100.0 / COUNT(*), 2) as corrective_percentage
    FROM maintenance_requests
  `, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || {});
  });
});

// Dashboard summary
router.get('/dashboard-summary', (req, res) => {
  const summary = {};
  
  // Get equipment count
  db.get('SELECT COUNT(*) as total FROM equipment', (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    summary.totalEquipment = row.total;
    
    // Get open requests
    db.get("SELECT COUNT(*) as total FROM maintenance_requests WHERE stage NOT IN ('Repaired', 'Scrap')", (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      summary.openRequests = row.total;
      
      // Get overdue tasks
      db.get("SELECT COUNT(*) as total FROM maintenance_requests WHERE scheduled_date < date('now') AND stage NOT IN ('Repaired', 'Scrap')", (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        summary.overdueTasks = row.total;
        
        // Get completed tasks
        db.get("SELECT COUNT(*) as total FROM maintenance_requests WHERE stage = 'Repaired'", (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          summary.completedTasks = row.total;
          
          // Get recent activities
          db.all(`
            SELECT mr.subject, mr.stage, mr.created_at, e.name as equipment_name, tm.name as technician_name
            FROM maintenance_requests mr
            LEFT JOIN equipment e ON mr.equipment_id = e.id
            LEFT JOIN team_members tm ON mr.assigned_technician_id = tm.id
            ORDER BY mr.created_at DESC
            LIMIT 10
          `, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            summary.recentActivities = rows;
            res.json(summary);
          });
        });
      });
    });
  });
});

module.exports = router;