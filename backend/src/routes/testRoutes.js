const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const { uploadResume, startTest, submitTest, getDashboard, getResultById } = require("../controllers/testController");



router.post("/upload", protect, upload.single("resume"), uploadResume);
router.get("/start/:testId", protect, startTest);
router.post("/submit/:attemptId", protect, submitTest);

router.get("/dashboard", protect, getDashboard);
router.get("/result/:attemptId", protect, getResultById);



module.exports = router;
