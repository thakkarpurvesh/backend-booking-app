const express = require("express");
const router = express.Router();
const { createBooking } = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, createBooking);

module.exports = router;
