require("dotenv").config();
const express = require("express");
const emailRoutes = require("./routes/email.route");

const app = express();

// Middleware to read JSON body
app.use(express.json());

// Routes
app.use("/api", emailRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`📧 Email API running on http://localhost:${PORT}`);
});
