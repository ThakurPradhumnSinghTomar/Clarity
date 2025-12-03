import express from "express"
import authRouter from "./routes/auth.js";
const app = express()

app.get("/", (req, res) => res.send("API running!"));

app.use("/api/auth",authRouter);

app.listen(4000, () => console.log("Server started on http://localhost:4000"));
