const MockTest = require("../models/MockTest");
const TestAttempt = require("../models/TestAttempt");
const { extractText, generateHash } = require("../utils/resumeUtils");
const { generateMockTestFromResume } = require("../services/groqService");
const { generateStudyPlan } = require("../services/studyPlanService");

/**
 * ================================
 * 1️⃣ Upload Resume & Generate Test
 * ================================
 */
exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Resume file is required" });
        }

        const text = await extractText(req.file);

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ message: "Could not extract resume text" });
        }

        const resumeHash = generateHash(text);

        // Check cache
        const existingTest = await MockTest.findOne({ resumeHash });

        if (existingTest) {
            return res.status(200).json({
                message: "Existing test reused",
                testId: existingTest._id,
                duration: existingTest.duration,
                cached: true
            });
        }

        // Generate AI Questions
        let aiQuestions;
        try {
            aiQuestions = await generateMockTestFromResume(text);
        } catch (err) {
            console.error("❌ AI Generation Error:", err.message);
            return res.status(500).json({
                message: "Failed to generate questions from AI"
            });
        }

        if (!Array.isArray(aiQuestions) || aiQuestions.length === 0) {
            return res.status(500).json({
                message: "Invalid AI response format"
            });
        }

        const newTest = await MockTest.create({
            resumeHash,
            questions: aiQuestions,
            duration: 35
        });


        return res.status(201).json({
            message: "New test generated",
            testId: newTest._id,
            duration: newTest.duration,
            cached: false
        });

    } catch (error) {
        console.error("❌ Upload Resume Error:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * ================================
 * 2️⃣ Start Test
 * ================================
 */
exports.startTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const userId = req.user._id;

        const test = await MockTest.findById(testId);

        if (!test) {
            return res.status(404).json({ message: "Test not found" });
        }

        // Check for existing in-progress attempt (resume it)
        const existingAttempt = await TestAttempt.findOne({
            userId,
            testId,
            status: "in-progress"
        });

        if (existingAttempt) {
            return res.json({
                message: "Resuming ongoing test",
                attemptId: existingAttempt._id,
                duration: test.duration,
                questions: test.questions.map(q => ({
                    question: q.question,
                    options: q.options,
                    topic: q.topic,
                    difficulty: q.difficulty
                })),
                startedAt: existingAttempt.startedAt
            });
        }

        // Create new attempt (allows retakes of completed tests)
        const attempt = await TestAttempt.create({
            userId,
            testId: test._id,
            startedAt: new Date(),
            status: "in-progress"
        });


        return res.json({
            message: "Test started",
            attemptId: attempt._id,
            duration: test.duration,
            questions: test.questions.map(q => ({
                question: q.question,
                options: q.options,
                topic: q.topic,
                difficulty: q.difficulty
            })),
            startedAt: attempt.startedAt
        });

    } catch (error) {
        console.error("❌ Start Test Error:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * ================================
 * 3️⃣ Submit Test & Analyze Results
 * ================================
 */
exports.submitTest = async (req, res) => {
    try {
        const { attemptId } = req.params;
        const answers = req.body?.answers;

        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: "Answers array is required" });
        }

        const attempt = await TestAttempt.findOne({
            _id: attemptId,
            userId: req.user._id
        });

        if (!attempt) {
            return res.status(404).json({ message: "Attempt not found" });
        }

        if (attempt.status === "completed") {
            return res.status(400).json({
                message: "Test already submitted",
                attemptId: attempt._id
            });
        }

        if (attempt.status === "expired") {
            return res.status(400).json({ message: "Test expired" });
        }

        const test = await MockTest.findById(attempt.testId);

        if (!test) {
            return res.status(404).json({ message: "Test data not found" });
        }

        // Score calculation
        let score = 0;
        let topicStats = {};

        test.questions.forEach((q, index) => {
            const userAnswer = answers[index] || null;

            if (!topicStats[q.topic]) {
                topicStats[q.topic] = { correct: 0, total: 0 };
            }

            topicStats[q.topic].total += 1;

            if (userAnswer === q.correctAnswer) {
                score++;
                topicStats[q.topic].correct += 1;
            }
        });

        const percentage = parseFloat(
            ((score / test.questions.length) * 100).toFixed(2)
        );

        // Generate AI Study Plan (with guaranteed fallback)
        let recommendation = null;
        try {
            recommendation = await generateStudyPlan(topicStats);
        } catch (err) {
            console.error("❌ Study Plan Generation Failed:", err.message);
        }

        // If study plan service returned null somehow, build a minimal fallback
        if (!recommendation) {
            const weakTopics = Object.entries(topicStats)
                .filter(([_, s]) => (s.correct / s.total) < 0.6)
                .map(([topic]) => topic);
            recommendation = {
                weakAreas: weakTopics,
                studyPlan: [],
                recommendations: ["Focus on weak areas and practice more problems"]
            };
        }

        // Save everything BEFORE responding
        attempt.answers = answers;
        attempt.score = score;
        attempt.percentage = percentage;
        attempt.topicStats = topicStats;
        attempt.recommendation = recommendation;
        attempt.submittedAt = new Date();
        attempt.status = "completed";

        await attempt.save();


        // Return full result so frontend can use it immediately
        return res.json({
            message: "Test submitted successfully",
            attemptId: attempt._id,
            score,
            percentage,
            totalQuestions: test.questions.length,
            topicStats,
            recommendation
        });

    } catch (error) {
        console.error("❌ Submit Test Error:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * ================================
 * 4️⃣ Get User Dashboard
 * ================================
 */
exports.getDashboard = async (req, res) => {
    try {
        const attempts = await TestAttempt.find({
            userId: req.user._id,
            status: "completed"
        })
            .sort({ createdAt: -1 })
            .select("score percentage createdAt testId status submittedAt topicStats");

        // Calculate aggregate stats
        const totalAttempts = attempts.length;
        const avgPercentage = totalAttempts > 0
            ? parseFloat((attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts).toFixed(1))
            : 0;

        return res.status(200).json({
            message: "Dashboard data fetched successfully",
            totalAttempts,
            avgPercentage,
            attempts
        });

    } catch (error) {
        console.error("❌ Dashboard Error:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * ================================
 * 5️⃣ Get Full Result By Attempt
 * ================================
 */
exports.getResultById = async (req, res) => {
    try {
        const { attemptId } = req.params;

        const attempt = await TestAttempt.findOne({
            _id: attemptId,
            userId: req.user._id
        });

        if (!attempt) {
            return res.status(404).json({
                message: "Result not found"
            });
        }

        const test = await MockTest.findById(attempt.testId);

        return res.status(200).json({
            message: "Result fetched successfully",
            attemptId: attempt._id,
            score: attempt.score,
            percentage: attempt.percentage,
            totalQuestions: test ? test.questions.length : 0,
            topicStats: attempt.topicStats,
            recommendation: attempt.recommendation,
            questions: test ? test.questions.map((q, index) => ({
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                userAnswer: attempt.answers ? attempt.answers[index] : null,
                topic: q.topic,
                difficulty: q.difficulty
            })) : [],
            createdAt: attempt.createdAt,
            submittedAt: attempt.submittedAt
        });

    } catch (error) {
        console.error("❌ Result Fetch Error:", error);
        return res.status(500).json({ message: error.message });
    }
};
