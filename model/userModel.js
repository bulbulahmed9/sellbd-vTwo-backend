const mongoose = require("mongoose");

// User Schema
const userSchema = new mongoose.Schema(
  {
    provider: String,
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });

module.exports = mongoose.model("User", userSchema);