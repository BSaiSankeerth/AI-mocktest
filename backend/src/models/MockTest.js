const mongoose = require("mongoose");

const mockTestSchema = new mongoose.Schema(
  {
    resumeHash: {
      type: String,
      required: true,
      unique: true
    },
    questions: {
      type: Array,
      required: true
    },
    duration: {
      type: Number,
      default: 35
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MockTest", mockTestSchema);
