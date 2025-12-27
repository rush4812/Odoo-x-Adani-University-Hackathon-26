const db = require('./database');

function run() {
  db.serialize(() => {
    // Insert sample assets
    db.run(`INSERT OR IGNORE INTO assets (id, name, category, asset_code, purchase_date, warranty_expiry, maintenance_interval_days, status, notes, last_maintenance_date) VALUES (1,'Air Compressor','Equipment','AC-001','2022-01-10','2024-01-10',90,'Active','Main plant compressor','2024-09-01')`);
    db.run(`INSERT OR IGNORE INTO assets (id, name, category, asset_code, purchase_date, warranty_expiry, maintenance_interval_days, status, notes, last_maintenance_date) VALUES (2,'CNC Machine','Machine','CNC-101','2021-05-05','2026-05-05',180,'Active','Precision CNC','2024-06-15')`);
    db.run(`INSERT OR IGNORE INTO assets (id, name, category, asset_code, purchase_date, warranty_expiry, maintenance_interval_days, status, notes, last_maintenance_date) VALUES (3,'Forklift','Vehicle','FL-20','2020-08-20','2025-08-20',30,'Active','Warehouse forklift','2024-12-01')`);

    // Insert sample maintenance logs
    db.run(`INSERT OR IGNORE INTO maintenance_logs (id, asset_id, maintenance_date, maintenance_type, description, cost, performed_by, remarks) VALUES (1,1,'2024-09-01','Preventive','Routine check and filter replacement',120.5,'Technician A','OK')`);
    db.run(`INSERT OR IGNORE INTO maintenance_logs (id, asset_id, maintenance_date, maintenance_type, description, cost, performed_by, remarks) VALUES (2,2,'2024-06-15','Corrective','Replaced spindle motor',890.0,'Technician B','Repaired')`);
    db.run(`INSERT OR IGNORE INTO maintenance_logs (id, asset_id, maintenance_date, maintenance_type, description, cost, performed_by, remarks) VALUES (3,3,'2024-12-01','Preventive','Battery check and oil top-up',60.0,'Technician C','Good')`);

    console.log('Seed data inserted');
  });
}

run();
