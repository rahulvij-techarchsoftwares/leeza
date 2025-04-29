const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./db/connectdb");
const roleRoutes = require("./routes/roleRoutes");
const authRoutes = require("./routes/userRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api", roleRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
