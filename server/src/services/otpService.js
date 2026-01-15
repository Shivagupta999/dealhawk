const { redisClient } = require('../config/redis');
const { sendEmail } = require('./emailService');

const OTP_TTL = 600;
const OTP_RATE_LIMIT_TTL = 600;
const OTP_MAX_REQUESTS = 3;
const OTP_VERIFY_MAX_ATTEMPTS = 5;

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();


exports.sendOTP = async (email) => {
  const rateLimitKey = `otp:rate:${email}`;
  const otpKey = `otp:${email}`;
  const attemptsKey = `otp:attempts:${email}`;

  const count = await redisClient.get(rateLimitKey);
  if (count && Number(count) >= OTP_MAX_REQUESTS) {
    throw new Error('Too many OTP requests. Please try again later.');
  }

  const otp = generateOTP();

  await redisClient.set(otpKey, otp, { EX: OTP_TTL });
  await redisClient.set(attemptsKey, '0', { EX: OTP_TTL });

  if (!count) {
    await redisClient.set(rateLimitKey, '1', { EX: OTP_RATE_LIMIT_TTL });
  } else {
    await redisClient.incr(rateLimitKey);
  }

  await sendEmail({
    to: email,
    subject: 'Your OTP for DealHawk',
    html: `
      <h2>Email Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
    `,
  });

  return true;
};


exports.verifyOTP = async (email, otp) => {
  const otpKey = `otp:${email}`;
  const attemptsKey = `otp:attempts:${email}`;

  const storedOTP = await redisClient.get(otpKey);
  const attempts = await redisClient.get(attemptsKey);

  console.log('🧪 OTP DEBUG', {
    storedOTP,
    userOTP: otp,
    storedType: typeof storedOTP,
    userType: typeof otp,
    attempts,
  });

  if (!storedOTP) return false;

  if (String(storedOTP) === String(otp)) {
    await redisClient.del(otpKey);
    await redisClient.del(attemptsKey);
    return true;
  }

  const newAttempts = await redisClient.incr(attemptsKey);
  await redisClient.expire(attemptsKey, OTP_TTL);

  if (newAttempts >= OTP_VERIFY_MAX_ATTEMPTS) {
    await redisClient.del(otpKey);
    await redisClient.del(attemptsKey);
    throw new Error('Too many invalid attempts. OTP expired.');
  }

  return false;
};

