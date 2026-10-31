import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import resourceRoute from "./routes/resourceRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
 

const app = express();
 
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
 
app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoute);
app.use("/api/reservations", reservationRoutes);
 
export default app;

