import express from "express"
import authRoutes from './routes/authRoutes.js'

const app = express();
const PORT = 5000

app.use('/api/auth', authRoutes)

app.listen(5000, () => {
    console.log("server start at port ", PORT);
})