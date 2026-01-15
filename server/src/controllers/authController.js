const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendOTP, verifyOTP:verifyotp } = require('../services/otpService');

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      iss: 'Dealhawk-api'
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d'
    }
  );
};

exports.register = async (req, res, next) => {
  try {
    let { email, password, name } = req.body;
    email = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists'
      });
    }

    const user = new User({ email, password , name});
    await user.save();
    sendOTP(email).catch(err =>
      console.error('⚠️ OTP send failed:', err.message)
    );

    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      email: user.email,
      userId: user._id
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    let { email, otp } = req.body;
    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({
        error: 'Email already verified'
      });
    }

    const isValid = await verifyotp(email, otp);
    if (!isValid) {
      return res.status(400).json({
        error: 'Invalid or expired OTP'
      });
    }

    user.isVerified = true;
    await user.save();

    const token = generateToken(user);

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    next(error);
  }
};


exports.login = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: 'Please verify your email first'
      });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.resendOTP = async (req, res, next) => {
  try {
    let { email } = req.body;
    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        error: 'Email already verified'
      });
    }

    await sendOTP(email);

    res.json({
      message: 'OTP resent successfully'
    });
  } catch (error) {
    next(error);
  }
};
