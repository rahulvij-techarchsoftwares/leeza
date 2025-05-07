const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const http = require("http"); 
const { Server } = require("socket.io");
const connectDB = require("./db/connectdb");
const cors = require('cors');
const roleRoutes = require("./routes/roleRoutes");
const authRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");
const jobsRoutes = require("./routes/jobsRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const adminRoutes = require("./routes/adminRoutes");
const jwt = require('jsonwebtoken');
const { authenticateSocket } = require("./controllers/userController");

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, 
  },
});

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));


app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.use(authenticateSocket);


io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("join_ticket", (ticketId) => {
    socket.join(ticketId);
    console.log(`🛠️ Socket ${socket.id} joined ticket room: ${ticketId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔌 User disconnected:", socket.id);
  });
});

app.use("/api", roleRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/apply", applicationRoutes);
app.use("/api/ticket", ticketRoutes);
app.use("/api/admin", adminRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
