require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/database');
const { connectRedis } = require('./src/config/redis');

const PORT = process.env.PORT || 5000;
let server;

/* -------------------- Start Server -------------------- */
const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    server = app.listen(PORT, () => {
      console.log(`🚀 API Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start API server:', error);
    process.exit(1);
  }
};

startServer();

/* -------------------- Graceful Shutdown -------------------- */
const shutdown = (signal) => {
  console.log(`🛑 ${signal} received. Shutting down API server...`);

  if (server) {
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM')); // Railway stop
process.on('SIGINT', () => shutdown('SIGINT'));   // Local Ctrl+C

/* -------------------- Crash Protection -------------------- */
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  shutdown('UNHANDLED_REJECTION');
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  shutdown('UNCAUGHT_EXCEPTION');
});
