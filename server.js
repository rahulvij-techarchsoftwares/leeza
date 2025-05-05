const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./db/connectdb");
const roleRoutes = require("./routes/roleRoutes");
const authRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");
const jobsRoutes = require("./routes/jobsRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const ticketRoutes = require("./routes/ticketRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api", roleRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/apply", applicationRoutes);
app.use("/api/ticket", ticketRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
