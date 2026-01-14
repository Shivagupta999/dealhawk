require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/database');
const { redisClient,connectRedis } = require('./src/config/redis');

const { startCronJobs } = require('./src/jobs/priceAlertJob');

const PORT = process.env.PORT || 5000;

let server;
const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);

      if (process.env.ENABLE_CRON_JOBS !== 'false') {
        startCronJobs();
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

/* -------------------- Graceful Shutdown -------------------- */
const shutdown = (signal) => {
  console.log(`🛑 ${signal} received, shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
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
