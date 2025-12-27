const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const users = require("../db/users");
const passwordResets = require("../db/passwordResets");
const nodemailer = require("nodemailer");

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret_in_env";
const EMAIL_USER = process.env.EMAIL_USER || null;
const EMAIL_PASS = process.env.EMAIL_PASS || null;
const OTP_TARGET_EMAIL = process.env.OTP_TARGET_EMAIL || null; // if set, OTPs will be sent to this address instead of user's entered email

let transporter = null;
if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
}

function validatePasswordStrength(password) {
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  return re.test(password);
}

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, rePassword } = req.body;
    if (!name || !email || !password || !rePassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password !== rePassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    if (!validatePasswordStrength(password)) {
      return res.status(400).json({ message: "Password does not meet strength requirements" });
    }

    const existing = await users.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    const created = await users.createUser(name, email, hash);
    const token = jwt.sign({ id: created.id, email: created.email }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ user: created, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await users.getUserByEmail(email);
    if (!user) return res.status(404).json({ message: "Account not exist" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Forgot password - send OTP
router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const user = await users.getUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'Account not exist' });

    // generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Math.floor(Date.now() / 1000) + 10 * 60; // 10 minutes in seconds

    await passwordResets.upsertOTP(email, otp, expiresAt);

    const recipient = OTP_TARGET_EMAIL || email;
    const mail = {
      from: EMAIL_USER || `no-reply@${recipient.split('@')[1]}`,
      to: recipient,
      replyTo: email,
      subject: 'Your password reset OTP',
      text: `Your OTP code is: ${otp}. It expires in 10 minutes.`,
    };

    if (!transporter) {
      // In development, when email is not configured, log OTP so developer can proceed.
      console.warn('Email not configured. OTP for', email, 'is', otp);
    } else {
      await transporter.sendMail(mail);
    }

    res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });
    const row = await passwordResets.getOTP(email);
    if (!row) return res.status(404).json({ message: 'No OTP request found' });
    const now = Math.floor(Date.now() / 1000);
    if (now > row.expires_at) return res.status(400).json({ message: 'OTP expired' });
    if (row.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    res.json({ message: 'OTP verified' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, password, rePassword } = req.body;
    if (!email || !otp || !password || !rePassword) return res.status(400).json({ message: 'All fields required' });
    if (password !== rePassword) return res.status(400).json({ message: 'Passwords do not match' });
    if (!validatePasswordStrength(password)) return res.status(400).json({ message: 'Password does not meet strength requirements' });

    const row = await passwordResets.getOTP(email);
    if (!row) return res.status(404).json({ message: 'No OTP request found' });
    const now = Math.floor(Date.now() / 1000);
    if (now > row.expires_at) return res.status(400).json({ message: 'OTP expired' });
    if (row.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    // update user password
    await new Promise((resolve, reject) => {
      const stmt = `UPDATE users SET password_hash = ? WHERE email = ?`;
      const db = require('../db/database');
      db.run(stmt, [hash, email], function (err) {
        if (err) return reject(err);
        resolve(true);
      });
    });

    await passwordResets.deleteOTP(email);
    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
