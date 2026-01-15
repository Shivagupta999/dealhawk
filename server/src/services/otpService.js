const {redisClient} = require('../config/redis');
const { sendEmail } = require('./emailService');

const OTP_TTL = 600;                
const OTP_RATE_LIMIT_TTL = 600;      
const OTP_MAX_REQUESTS = 3;          
const OTP_VERIFY_MAX_ATTEMPTS = 5;   

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.sendOTP = async (email) => {
  const rateLimitKey = `otp:rate:${email}`;

  const count = await redisClient.get(rateLimitKey);
  if (count && Number(count) >= OTP_MAX_REQUESTS) {
    throw new Error('Too many OTP requests. Please try again later.');
  }

  const otp = generateOTP();
  await redisClient.set(
    `otp:${email}`,
    OTP_TTL,
    otp
  );

  await redisClient.set(
    `otp:attempts:${email}`,
    OTP_TTL,
    "0"
  );

  if (!count) {
    await redisClient.set(
      rateLimitKey,
      OTP_RATE_LIMIT_TTL,
      "1"
    );
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
      <p>If you did not request this, please ignore.</p>
    `
  });

  console.log(`📧 OTP sent to ${email}`);
  return true;
};

exports.verifyOTP = async (email, otp) => {
  const otpKey = `otp:${email}`;
  const attemptsKey = `otp:attempts:${email}`;

  const storedOTP = await redisClient.get(otpKey);
  if (!storedOTP) {
    return false;
  }

  const attempts = await redisClient.get(attemptsKey);
  if (attempts && Number(attempts) >= OTP_VERIFY_MAX_ATTEMPTS) {
    await redisClient.del(otpKey);
    await redisClient.del(attemptsKey);
    throw new Error('Too many invalid attempts. OTP expired.');
  }

  if (storedOTP !== otp) {
    await redisClient.incr(attemptsKey);
    return false;
  }

  await redisClient.del(otpKey);
  await redisClient.del(attemptsKey);

  return true;
};
