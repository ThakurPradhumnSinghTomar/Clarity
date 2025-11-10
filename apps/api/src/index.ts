import express from "express"
const app = express()

app.get("/", (req, res) => res.send("API running!"))

app.listen(4000, () => console.log("Server started on http://localhost:4000"))
