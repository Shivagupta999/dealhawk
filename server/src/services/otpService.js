const { redisClient, isRedisReady } = require('../config/redis');
const { sendEmail } = require('./emailService');

const OTP_TTL = 600;
const OTP_RATE_LIMIT_TTL = 600;
const OTP_MAX_REQUESTS = 3;
const OTP_VERIFY_MAX_ATTEMPTS = 5;

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

exports.sendOTP = async (email) => {
  if (!isRedisReady()) {
    throw new Error('Redis service is not available');
  }

  const rateLimitKey = `otp:rate:${email}`;
  const otpKey = `otp:${email}`;
  const attemptsKey = `otp:attempts:${email}`;

  try {
    const count = await redisClient.get(rateLimitKey);
    if (count && Number(count) >= OTP_MAX_REQUESTS) {
      throw new Error('Too many OTP requests. Please try again later.');
    }

    const otp = generateOTP();
    console.log(`📧 Generated OTP for ${email}: ${otp}`); 

    await redisClient.set(otpKey, otp, { ex: OTP_TTL });
    await redisClient.set(attemptsKey, '0', { ex: OTP_TTL });

    const stored = await redisClient.get(otpKey);
    console.log(`✅ OTP stored in Redis: ${stored}, Type: ${typeof stored}`); 

    if (!count) {
      await redisClient.set(rateLimitKey, '1', { ex: OTP_RATE_LIMIT_TTL });
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

    console.log(`✅ OTP sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ OTP send error:', error.message);
    throw error;
  }
};

exports.verifyOTP = async (email, otp) => {
  if (!isRedisReady()) {
    throw new Error('Redis service is not available');
  }

  const otpKey = `otp:${email}`;
  const attemptsKey = `otp:attempts:${email}`;

  try {
    const storedOTP = await redisClient.get(otpKey);
    
    // Enhanced logging
    console.log('🔍 OTP Verification Debug:');
    console.log(`   Email: ${email}`);
    console.log(`   Provided OTP: "${otp}" (Type: ${typeof otp}, Length: ${otp?.length})`);
    console.log(`   Stored OTP: "${storedOTP}" (Type: ${typeof storedOTP}, Length: ${storedOTP?.length})`);
    console.log(`   Match: ${storedOTP === otp}`);
    console.log(`   Loose Match: ${storedOTP == otp}`);
    
    if (!storedOTP) {
      console.log('❌ OTP not found or expired');
      return false;
    }

    const attempts = await redisClient.get(attemptsKey);
    if (attempts && Number(attempts) >= OTP_VERIFY_MAX_ATTEMPTS) {
      await redisClient.del(otpKey);
      await redisClient.del(attemptsKey);
      throw new Error('Too many invalid attempts. OTP expired.');
    }

    // Convert both to strings and trim whitespace
    const normalizedStored = String(storedOTP).trim();
    const normalizedProvided = String(otp).trim();

    console.log(`   Normalized Stored: "${normalizedStored}"`);
    console.log(`   Normalized Provided: "${normalizedProvided}"`);

    if (normalizedStored !== normalizedProvided) {
      await redisClient.incr(attemptsKey);
      console.log('❌ OTP mismatch');
      return false;
    }

    await redisClient.del(otpKey);
    await redisClient.del(attemptsKey);
    console.log('✅ OTP verified successfully');
    return true;
  } catch (error) {
    console.error('❌ OTP verify error:', error.message);
    throw error;
  }
};