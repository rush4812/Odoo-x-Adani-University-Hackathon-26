const db = require('./database');

// Sample data
const teams = [
  { name: 'Electrical Team', description: 'Handles all electrical equipment', location: 'Building A', company: 'GearGuard Corp' },
  { name: 'Mechanical Team', description: 'Mechanical maintenance specialists', location: 'Building B', company: 'GearGuard Corp' },
  { name: 'HVAC Team', description: 'Heating, ventilation, and air conditioning', location: 'Building C', company: 'GearGuard Corp' }
];

const teamMembers = [
  { team_id: 1, name: 'John Smith', email: 'john@gearguard.com', role: 'Senior Technician', is_default_technician: 1 },
  { team_id: 1, name: 'Sarah Johnson', email: 'sarah@gearguard.com', role: 'Technician', is_default_technician: 0 },
  { team_id: 2, name: 'Mike Wilson', email: 'mike@gearguard.com', role: 'Team Lead', is_default_technician: 1 },
  { team_id: 2, name: 'Lisa Brown', email: 'lisa@gearguard.com', role: 'Technician', is_default_technician: 0 },
  { team_id: 3, name: 'David Lee', email: 'david@gearguard.com', role: 'Senior Technician', is_default_technician: 1 },
  { team_id: 3, name: 'Emma Davis', email: 'emma@gearguard.com', role: 'Supervisor', is_default_technician: 0 }
];

const equipment = [
  {
    name: 'Generator Unit 1', serial_number: 'GEN001', category: 'Power Generation', 
    department: 'Facilities', assigned_employee: 'Facility Manager',
    purchase_date: '2022-01-15', warranty_expiry: '2025-01-15',
    physical_location: 'Basement Level 1', maintenance_team_id: 1, default_technician_id: 1,
    status: 'Active', notes: 'Primary backup generator'
  },
  {
    name: 'HVAC System A', serial_number: 'HVAC001', category: 'Climate Control',
    department: 'Facilities', assigned_employee: 'Building Manager',
    purchase_date: '2021-06-10', warranty_expiry: '2024-06-10',
    physical_location: 'Rooftop', maintenance_team_id: 3, default_technician_id: 5,
    status: 'Active', notes: 'Main building climate control'
  },
  {
    name: 'Conveyor Belt 1', serial_number: 'CONV001', category: 'Manufacturing',
    department: 'Production', assigned_employee: 'Production Manager',
    purchase_date: '2020-03-20', warranty_expiry: '2023-03-20',
    physical_location: 'Production Floor A', maintenance_team_id: 2, default_technician_id: 3,
    status: 'Active', notes: 'Primary production line conveyor'
  },
  {
    name: 'Compressor Unit 2', serial_number: 'COMP002', category: 'Air Systems',
    department: 'Production', assigned_employee: 'Operations Manager',
    purchase_date: '2021-11-05', warranty_expiry: '2024-11-05',
    physical_location: 'Compressor Room', maintenance_team_id: 2, default_technician_id: 3,
    status: 'Under Maintenance', notes: 'Secondary air compressor'
  },
  {
    name: 'Elevator System', serial_number: 'ELEV001', category: 'Transportation',
    department: 'Facilities', assigned_employee: 'Safety Manager',
    purchase_date: '2019-08-12', warranty_expiry: '2024-08-12',
    physical_location: 'Main Building', maintenance_team_id: 1, default_technician_id: 1,
    status: 'Active', notes: 'Main passenger elevator'
  }
];

const maintenanceRequests = [
  {
    subject: 'Monthly generator inspection', equipment_id: 1, request_type: 'Preventive',
    priority: 'Medium', stage: 'New', assigned_technician_id: 1,
    scheduled_date: '2024-02-15', created_by: 'System Admin'
  },
  {
    subject: 'HVAC filter replacement', equipment_id: 2, request_type: 'Preventive',
    priority: 'Low', stage: 'In Progress', assigned_technician_id: 5,
    scheduled_date: '2024-02-10', created_by: 'Facility Manager'
  },
  {
    subject: 'Conveyor belt motor failure', equipment_id: 3, request_type: 'Corrective',
    priority: 'High', stage: 'New', assigned_technician_id: 3,
    scheduled_date: '2024-02-08', created_by: 'Production Manager'
  },
  {
    subject: 'Compressor pressure issue', equipment_id: 4, request_type: 'Corrective',
    priority: 'High', stage: 'In Progress', assigned_technician_id: 3,
    scheduled_date: '2024-02-05', created_by: 'Operations Manager'
  },
  {
    subject: 'Elevator safety inspection', equipment_id: 5, request_type: 'Preventive',
    priority: 'High', stage: 'Repaired', assigned_technician_id: 1,
    scheduled_date: '2024-01-30', created_by: 'Safety Manager'
  }
];

async function seedDatabase() {
  console.log('Seeding database with sample data...');
  
  try {
    // Insert teams
    for (const team of teams) {
      await new Promise((resolve, reject) => {
        db.run('INSERT INTO teams (name, description, location, company) VALUES (?, ?, ?, ?)',
          [team.name, team.description, team.location, team.company],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    }
    console.log('✓ Teams inserted');

    // Insert team members
    for (const member of teamMembers) {
      await new Promise((resolve, reject) => {
        db.run('INSERT INTO team_members (team_id, name, email, role, is_default_technician) VALUES (?, ?, ?, ?, ?)',
          [member.team_id, member.name, member.email, member.role, member.is_default_technician],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    }
    console.log('✓ Team members inserted');

    // Insert equipment
    for (const eq of equipment) {
      await new Promise((resolve, reject) => {
        db.run(`INSERT INTO equipment (name, serial_number, category, department, assigned_employee, 
                purchase_date, warranty_expiry, physical_location, maintenance_team_id, 
                default_technician_id, status, notes) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [eq.name, eq.serial_number, eq.category, eq.department, eq.assigned_employee,
           eq.purchase_date, eq.warranty_expiry, eq.physical_location, eq.maintenance_team_id,
           eq.default_technician_id, eq.status, eq.notes],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    }
    console.log('✓ Equipment inserted');

    // Insert maintenance requests
    for (const request of maintenanceRequests) {
      await new Promise((resolve, reject) => {
        db.run(`INSERT INTO maintenance_requests (subject, equipment_id, request_type, priority, 
                stage, assigned_technician_id, scheduled_date, created_by) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [request.subject, request.equipment_id, request.request_type, request.priority,
           request.stage, request.assigned_technician_id, request.scheduled_date, request.created_by],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    }
    console.log('✓ Maintenance requests inserted');

    // Insert some task activities for completed requests
    await new Promise((resolve, reject) => {
      db.run(`INSERT INTO task_activities (request_id, actual_start_time, actual_finish_time, 
              total_time_minutes, work_context, observations, performance_rating, feedback) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [5, '2024-01-30T09:00:00Z', '2024-01-30T11:30:00Z', 150,
         'Performed comprehensive safety inspection of elevator system',
         'All safety systems functioning properly. Minor adjustment to door sensors.',
         5, 'Excellent work completed on schedule'],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    console.log('✓ Task activities inserted');

    console.log('🎉 Database seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase().then(() => {
    console.log('Seeding complete. You can now test the GearGuard system!');
    process.exit(0);
  });
}

module.exports = { seedDatabase };