const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  verified: { type: Boolean, default: false },
  verificationToken: String
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
