import express from "express";
import { config } from "dotenv";
import { connectDB, disconnectDB } from "./config/db.js";
import userRouter from "./routes/user.route.js";
import cors from "cors";
import { protect } from "./middleware/authMiddleware.js";

import { initSocket } from "./socket.js";
import http from "http";
import rateLimit from "express-rate-limit";
import productRouter from "./routes/product.route.js";
import paymentRouter from "./routes/payment.route.js";
import adminAuthRouter from "./routes/auth.admin.route.js";
import userAuthRouter from "./routes/auth.user.routes.js";
import adminRouter from "./routes/admin.route.js";
// import userJob from "./jobs/user.job.js";

config();
connectDB();
// userJob();

const app = express();
const server = http.createServer(app);
const io = initSocket(server);
app.set("io", io);

const globalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 500,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://e-tutoring-seven.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(globalLimiter);

app.use("/api/v1/admin/auth", adminAuthRouter);
app.use("/api/v1/auth", userAuthRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admins", adminRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/payments", paymentRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection", err);
  disconnectDB();
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception", err);
  disconnectDB();
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received");
  disconnectDB();
  process.exit(0);
});

export default app;
