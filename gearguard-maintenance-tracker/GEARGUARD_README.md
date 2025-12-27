# GearGuard - The Ultimate Maintenance Tracker

A comprehensive, enterprise-grade maintenance management system built with React and Node.js, following Odoo-inspired design principles.

## 🚀 Features

### Core Modules

1. **Maintenance** - Kanban-based request management with drag & drop functionality
2. **Dashboard** - Real-time overview of equipment, requests, and performance metrics
3. **Maintenance Calendar** - Visual scheduling for preventive maintenance
4. **Equipment** - Complete asset management with team assignments
5. **Reporting** - Advanced analytics and performance insights
6. **Teams** - Team and technician management

### Key Capabilities

- **Equipment Management**: Track assets with serial numbers, categories, departments, and team assignments
- **Maintenance Requests**: Handle both corrective (breakdown) and preventive maintenance
- **Kanban Workflow**: Visual task management with stages (New → In Progress → Repaired → Scrap)
- **Task Activities**: Detailed workflow with time tracking and performance ratings
- **Team Management**: Organize technicians into teams with role-based assignments
- **Smart Scheduling**: Calendar-based preventive maintenance planning
- **Advanced Reporting**: Equipment history, costs, technician performance, and downtime analysis
- **Scrap Logic**: Automatic equipment status updates when marked as scrap

## 🏗️ Architecture

### Backend (Node.js + SQLite)
- **Database**: SQLite with comprehensive schema for teams, equipment, requests, and activities
- **API Routes**: RESTful endpoints for all modules
- **Authentication**: JWT-based user authentication with password reset

### Frontend (React + Bootstrap)
- **Responsive Design**: Mobile-friendly interface with Bootstrap 5
- **Component Architecture**: Modular React components for each module
- **State Management**: React hooks for local state management
- **Routing**: React Router for navigation

## 📋 Database Schema

### Core Tables
- `teams` - Maintenance teams
- `team_members` - Team technicians and roles
- `equipment` - Asset management with team relationships
- `maintenance_requests` - Core workflow management
- `task_activities` - Detailed work tracking
- `users` - Authentication system

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
node db/seedGearGuard.js  # Populate with sample data
npm start  # Runs on port 5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Runs on port 5173
```

### Environment Variables
Create `.env` files in both backend and frontend directories:

**Backend (.env):**
```
PORT=5000
JWT_SECRET=your_jwt_secret_here
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000
```

## 📊 Sample Data

The system includes a comprehensive seed script that creates:
- 3 maintenance teams (Electrical, Mechanical, HVAC)
- 6 team members with different roles
- 5 pieces of equipment with realistic specifications
- 5 maintenance requests in various stages
- Sample task activities with performance ratings

Run the seed script: `node backend/db/seedGearGuard.js`

## 🎯 Usage Guide

### 1. Authentication
- Register a new account or login with existing credentials
- Password reset functionality with OTP verification

### 2. Equipment Management
- Add equipment with detailed specifications
- Assign maintenance teams and default technicians
- View maintenance history via smart buttons
- Filter and search by department, category, or team

### 3. Maintenance Workflow
- Create maintenance requests (Corrective or Preventive)
- Use kanban board to track progress through stages
- Assign technicians and set priorities
- Access detailed task activities for work tracking

### 4. Task Activities (Detailed Workflow)
1. **Start Task**: Log start time automatically
2. **Work Progress**: Record work context, observations, and parts used
3. **Complete Task**: Add performance rating and feedback
4. **Automatic Calculations**: Total time and completion tracking

### 5. Preventive Maintenance
- Use calendar view to schedule preventive tasks
- Visual indicators for completed, pending, and overdue tasks
- Bulk scheduling capabilities

### 6. Team Management
- Create teams with location and company assignments
- Add team members with roles (Technician, Senior Technician, Team Lead, Supervisor)
- Designate default technicians for equipment

### 7. Reporting & Analytics
- **Equipment History**: Maintenance counts, completion rates, average repair times
- **Maintenance Costs**: Cost analysis by equipment and category
- **Technician Performance**: Completion rates, ratings, and overdue tasks
- **Downtime Analysis**: Breakdown frequency and impact assessment
- **Preventive vs Corrective Ratio**: Strategic maintenance insights

## 🔧 API Endpoints

### Teams
- `GET /api/teams` - List all teams
- `POST /api/teams` - Create team
- `GET /api/teams/:id/members` - Get team members
- `POST /api/teams/:id/members` - Add team member

### Equipment
- `GET /api/equipment` - List equipment with team info
- `POST /api/equipment` - Create equipment
- `GET /api/equipment/:id/requests` - Get equipment maintenance requests
- `PATCH /api/equipment/:id/status` - Update equipment status

### Maintenance Requests
- `GET /api/maintenance-requests` - List all requests
- `GET /api/maintenance-requests/kanban` - Kanban view data
- `POST /api/maintenance-requests` - Create request
- `PATCH /api/maintenance-requests/:id/stage` - Update stage
- `GET /api/maintenance-requests/preventive` - Preventive requests for calendar

### Task Activities
- `GET /api/task-activities/request/:id` - Get task activity
- `POST /api/task-activities/:requestId/start` - Start task
- `PATCH /api/task-activities/:requestId/progress` - Update progress
- `POST /api/task-activities/:requestId/complete` - Complete task

### Reports
- `GET /api/reports/equipment-history` - Equipment maintenance history
- `GET /api/reports/maintenance-costs` - Cost analysis
- `GET /api/reports/technician-performance` - Performance metrics
- `GET /api/reports/downtime-analysis` - Downtime statistics
- `GET /api/reports/maintenance-ratio` - Preventive vs corrective ratio
- `GET /api/reports/dashboard-summary` - Dashboard overview

## 🎨 Design Philosophy

GearGuard follows enterprise software design principles:
- **Clean Interface**: Minimal, professional styling inspired by Odoo
- **Logical Flow**: Equipment → Teams → Requests → Activities → Reports
- **Smart Automation**: Automatic status updates and time calculations
- **Visual Feedback**: Color-coded statuses, progress indicators, and badges
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🔒 Security Features

- JWT-based authentication
- Password complexity validation
- OTP-based password reset
- Input validation and sanitization
- Protected routes requiring authentication

## 🚀 Future Enhancements

- File attachments for maintenance requests
- Email notifications for overdue tasks
- Mobile app for technicians
- Integration with IoT sensors
- Advanced scheduling algorithms
- Multi-company support
- Inventory management integration

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions, please create an issue in the GitHub repository.

---

**GearGuard** - Built for Reliability • Crafted with Care