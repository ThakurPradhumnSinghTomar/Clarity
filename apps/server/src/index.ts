import express from "express"
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";

const app = express()
import cors from "cors";
import roomRouter from "./routes/room.js";

const allowedOrigins = [
  "http://localhost:3000",
  "https://rebuild-with-pradhumn.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps / curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());

app.get("/", (req, res) => res.send("API running!"));

app.use("/api/auth",authRouter);
app.use("/api/user",userRouter);
app.use("/api/room",roomRouter);

app.listen(4000, () => console.log("Server started on http://localhost:4000"));
