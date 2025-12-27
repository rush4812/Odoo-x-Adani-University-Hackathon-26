const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Database file path
const dbPath = path.join(__dirname, "../gearguard.db");

// Create / connect database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

// Create tables only if they don't exist
db.serialize(() => {
  // Users table for authentication
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Password resets (OTP) table
  db.run(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      otp TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    )
  `);

  // Teams table
  db.run(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      location TEXT,
      company TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Team members table
  db.run(`
    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER,
      name TEXT NOT NULL,
      email TEXT,
      role TEXT,
      is_default_technician INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Equipment table
  db.run(`
    CREATE TABLE IF NOT EXISTS equipment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      serial_number TEXT,
      category TEXT,
      department TEXT,
      assigned_employee TEXT,
      purchase_date TEXT,
      warranty_expiry TEXT,
      physical_location TEXT,
      maintenance_team_id INTEGER,
      default_technician_id INTEGER,
      status TEXT DEFAULT 'Active',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Maintenance requests table
  db.run(`
    CREATE TABLE IF NOT EXISTS maintenance_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      equipment_id INTEGER,
      request_type TEXT,
      priority TEXT DEFAULT 'Medium',
      stage TEXT DEFAULT 'New',
      assigned_technician_id INTEGER,
      scheduled_date TEXT,
      created_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Task activities table
  db.run(`
    CREATE TABLE IF NOT EXISTS task_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER,
      actual_start_time TEXT,
      actual_finish_time TEXT,
      total_time_minutes INTEGER,
      work_context TEXT,
      observations TEXT,
      parts_used TEXT,
      performance_rating INTEGER,
      feedback TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Legacy tables
  db.run(`
    CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT,
      asset_code TEXT,
      purchase_date TEXT,
      warranty_expiry TEXT,
      maintenance_interval_days INTEGER,
      status TEXT DEFAULT 'Active',
      notes TEXT,
      deleted INTEGER DEFAULT 0,
      last_maintenance_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS maintenance_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_id INTEGER,
      maintenance_date TEXT,
      maintenance_type TEXT,
      description TEXT,
      cost REAL,
      performed_by TEXT,
      remarks TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
