import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import emailRoutes from "./routes/email.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// Security
app.use(helmet());

// Allow frontend to access backend
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// Request parsing
app.use(express.json());

// Request logging
app.use(morgan("dev"));

// Health check
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Email Scheduler API is running",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/emails", emailRoutes);

export default app;