import express from "express"
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";

const app = express()
import cors from "cors";

app.use(cors({
  origin: 'https://rebuild-with-pradhumn.vercel.app',
   // Your Next.js frontend URL
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => res.send("API running!"));

app.use("/api/auth",authRouter);
app.use("/api/user",userRouter);

app.listen(4000, () => console.log("Server started on http://localhost:4000"));
