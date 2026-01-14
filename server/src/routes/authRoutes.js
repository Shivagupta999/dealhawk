const express = require('express');
const { register, login, verifyOTP, resendOTP } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../utils/validators');

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

module.exports = router;