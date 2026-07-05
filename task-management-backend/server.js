require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./config/db");
const routes = require("./src/routes");
const { notFound, globalErrorHandler } = require("./src/middlewares/error.middleware");
const { initSocket } = require("./src/sockets/socket");

const app = express();
const server = http.createServer(app);

// Socket.IO 
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_ORIGIN || "http://localhost:4200",
        methods: ["GET", "POST", "PATCH", "DELETE"],
        credentials: true,
    },
});
initSocket(io);

app.set("io", io);

// Core Middleware
app.use(
    cors({
        origin: process.env.CLIENT_ORIGIN || "http://localhost:4200",
        credentials: true,
    })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan(process.env.NODE_ENV));

// Health Check 
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Task Management API is running",
        data: {
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
        },
    });
});

// API Routes
app.use("/api", routes);

// Error Handling 
app.use(notFound);
app.use(globalErrorHandler);

// Start Server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await connectDB();
    server.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || "development"} mode`);
        console.log(`   HTTP  → http://localhost:${PORT}`);
        console.log(`   WS    → ws://localhost:${PORT}`);
        console.log(`   Health→ http://localhost:${PORT}/health\n`);
    });
};

startServer();

module.exports = { app, server };
