import express from "express"

const app = express();
const PORT = 5000

app.listen(5000, () => {
    console.log("server start at port ", PORT);
})