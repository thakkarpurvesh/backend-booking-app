const Booking = require("../models/Booking");

const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

exports.createBooking = async (req, res) => {
  const {
    customerName, customerEmail, bookingDate,
    bookingType, bookingSlot, fromTime, toTime
  } = req.body;

  try {
    const date = new Date(bookingDate);
    const existingBookings = await Booking.find({ bookingDate: date });

    const newStart = bookingType === "Custom" ? timeToMinutes(fromTime) : null;
    const newEnd = bookingType === "Custom" ? timeToMinutes(toTime) : null;

    const isOverlap = existingBookings.some(b => {
      if (b.bookingType === "Full Day" || bookingType === "Full Day") return true;

      if (bookingType === "Half Day" && b.bookingType === "Half Day") {
        return b.bookingSlot === bookingSlot;
      }

      if (bookingType === "Half Day" && b.bookingType === "Custom") {
        const slotRange = bookingSlot === "First Half" ? [0, 720] : [720, 1440];
        const bStart = timeToMinutes(b.fromTime);
        const bEnd = timeToMinutes(b.toTime);
        return bStart < slotRange[1] && bEnd > slotRange[0];
      }

      if (bookingType === "Custom") {
        if (b.bookingType === "Half Day") {
          const halfRange = b.bookingSlot === "First Half" ? [0, 720] : [720, 1440];
          return newStart < halfRange[1] && newEnd > halfRange[0];
        }

        if (b.bookingType === "Custom") {
          const bStart = timeToMinutes(b.fromTime);
          const bEnd = timeToMinutes(b.toTime);
          return newStart < bEnd && newEnd > bStart;
        }
      }

      return false;
    });

    if (isOverlap) {
      return res.status(400).json({ message: "Booking overlaps with existing booking." });
    }

    const booking = new Booking({
      customerName,
      customerEmail,
      bookingDate: date,
      bookingType,
      bookingSlot,
      fromTime,
      toTime,
    });

    await booking.save();
    res.status(201).json({ message: "Booking successful" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};