const cron = require("node-cron");
const TestAttempt = require("../models/TestAttempt");
const MockTest = require("../models/MockTest");

const initScheduler = () => {
    // Run every minute
    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date();

            // Find all in-progress attempts
            const attempts = await TestAttempt.find({
                status: "in-progress"
            }).populate("testId");

            for (const attempt of attempts) {
                if (!attempt.testId) continue;

                const { duration } = attempt.testId;
                const startedAt = new Date(attempt.startedAt);

                // Calculate expiration time (allow 2 mins buffer)
                const expirationTime = new Date(startedAt.getTime() + (duration + 2) * 60000);

                if (now > expirationTime) {
                    attempt.status = "expired";
                    await attempt.save();
                }
            }
        } catch (error) {
            console.error("Scheduler Error:", error);
        }
    });
};

module.exports = initScheduler;
