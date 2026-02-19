const mongoose = require("mongoose");

const testAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MockTest",
      required: true
    },
    answers: {
      type: Array,
      default: []
    },
    score: {
      type: Number,
      default: null
    },
    percentage: {
      type: Number,
      default: null
    },
    topicStats: {
      type: Object,
      default: null
    },
    recommendation: {
      type: Object,
      default: null
    },
    startedAt: {
      type: Date
    },
    submittedAt: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ["in-progress", "completed", "expired"],
      default: "in-progress"
    }
  },
  { timestamps: true }
);

// Compound index for fast lookups
testAttemptSchema.index({ userId: 1, testId: 1, status: 1 });

module.exports = mongoose.model("TestAttempt", testAttemptSchema);
