require('dotenv').config();
const express = require("express");
const cors = require("cors");

// Init app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/machines", require("./routes/machines"));
app.use("/api/maintenance", require("./routes/maintenance"));
app.use("/api/auth", require("./routes/auth"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
