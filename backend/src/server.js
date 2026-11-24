import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";

dotenv.config();

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("server started on port", PORT);
});