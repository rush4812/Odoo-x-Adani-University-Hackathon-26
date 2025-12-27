require('dotenv').config();
const express = require("express");
const cors = require("cors");

// Init app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/teams", require("./routes/teams"));
app.use("/api/equipment", require("./routes/equipment"));
app.use("/api/maintenance-requests", require("./routes/maintenanceRequests"));
app.use("/api/task-activities", require("./routes/taskActivities"));
app.use("/api/reports", require("./routes/reports"));
// Legacy routes (keep for compatibility)
app.use("/api/assets", require("./routes/assets"));
app.use("/api/maintenance-logs", require("./routes/maintenanceLogs"));
app.use("/api/dashboard", require("./routes/dashboard"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
