const mongoose = require("mongoose");
const { Schema } = mongoose;

const submissionSchema = new Schema(
  {
    problemId: {
      type: Schema.Types.ObjectId,
      ref: "problem",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: ["c++", "java", "javascript"],
    },
    code: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "wrong",
        "runtime_error",
        "timeout",
        "compile_error",
        "runtime_error_nzec", // Non-zero exit code
        "runtime_error_sigsegv", // Segmentation fault
        "runtime_error_sigabrt", // Aborted
        "runtime_error_sigfpe", // Floating-point exception
        "runtime_error_other", // Other runtime errors
        "internal_error", // Judge system error
      ],
      default: "pending",
    },
    runtime: {
      type: Number,
      default: 0,
    },
    memory: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
      default: "",
    },
    testCasesPassed: {
      type: Number,
      default: 0,
    },
    testCasesTotal: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

submissionSchema.index({ userId: 1, problemId: 1 });
//-1 means descending order and 1 means ascending

const Submission = mongoose.model("submission", submissionSchema);
module.exports = Submission;
