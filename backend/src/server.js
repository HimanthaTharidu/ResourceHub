import express from "express"
import authRoutes from './routes/authRoutes.js'
import dotenv from 'dotenv'
import connectDB from "./config/db.js";
import cors from "cors"
import cookieParser from "cookie-parser"

dotenv.config();

connectDB();
const app = express();


app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);

app.listen(5000, () => {
    console.log("server start at port", process.env.PORT);
})