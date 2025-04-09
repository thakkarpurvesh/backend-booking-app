const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  customerName: String,
  customerEmail: String,
  bookingDate: Date,
  bookingType: String, // Full Day | Half Day | Custom
  bookingSlot: String, // First Half | Second Half
  fromTime: String,
  toTime: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
