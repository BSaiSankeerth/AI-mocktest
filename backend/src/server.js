require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");

const app = express();

connectDB();

// Init Scheduler
const initScheduler = require("./cron/testScheduler");
initScheduler();

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: "Too many requests. Please try again later."
});

app.use(limiter);
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "AI Adaptive Mock Interview API Running" });
});
console.log("Loaded GROQ KEY:", process.env.GROQ_API_KEY);


app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
