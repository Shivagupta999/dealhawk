require('dotenv').config();

const connectDB = require('./src/config/database');
const { connectRedis, redisClient } = require('./src/config/redis');
const { startCronJobs, stopCronJobs } = require('./src/jobs/priceAlertJob');

let shuttingDown = false;

/* -------------------- Start Worker -------------------- */
const startWorker = async () => {
  try {
    console.log('🧠 Cron Worker starting...');
    await connectDB();
    await connectRedis();
    startCronJobs();
  } catch (err) {
    console.error('❌ Worker startup failed:', err);
    process.exit(1);
  }
};

startWorker();

/* -------------------- Graceful Shutdown -------------------- */
const shutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`🛑 ${signal} received. Stopping cron worker...`);

  try {
    if (stopCronJobs) {
      stopCronJobs();
      console.log('⏹️ Cron jobs stopped');
    }

    if (redisClient?.isOpen) {
      await redisClient.quit();
      console.log('🧹 Redis connection closed');
    }

    console.log('✅ Worker shutdown complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during worker shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT')); 

/* -------------------- Crash Protection -------------------- */
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  shutdown('UNHANDLED_REJECTION');
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  shutdown('UNCAUGHT_EXCEPTION');
});
