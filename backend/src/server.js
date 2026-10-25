import express from "express"
import authRoutes from './routes/authRoutes.js'
import dotenv from 'dotenv'
import { connect } from "mongoose";
import connectDB from "./config/db.js";

dotenv.config();

connectDB();
const app = express();
const PORT = 5000

app.use(express.json());

app.use('/api/auth', authRoutes)

app.listen(5000, () => {
    console.log("server start at port ", PORT);
})