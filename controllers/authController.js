const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendVerificationEmail = require("../utils/sendVerificationEmail");
const crypto = require('crypto');

exports.signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    console.log("Registering user...");
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });
    console.log('exiting registration process...');

    const hashed = await bcrypt.hash(password, 10);
    console.log('hashed password...');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    console.log('Generated verification token...', verificationToken);

    const user = new User({ firstName, lastName, email, password: hashed, verificationToken }); // Simulated verification
    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.BASE_URL}/api/auth/verify/${verificationToken}`;
    await sendVerificationEmail(user.email, verificationUrl);

    res.status(201).json({ message: "Registered successfully. Please verify your email." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid email or password" });

    if (!user.verified) return res.status(401).json({ message: 'Please verify your email before logging in.' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ user: { id: user._id, email: user.email, 
      firstName: user.firstName,
      lastName: user.lastName }, token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).send('Invalid or expired verification token');
    }

    user.verified = true;
    user.verificationToken = null;
    await user.save();

    res.send('Email verified successfully. You can now log in.');
  } catch (err) {
    res.status(500).send('Something went wrong.');
  }
};