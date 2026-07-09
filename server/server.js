const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { initRedis } = require('./config/redis');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');
const { apiLimiter } = require('./middlewares/rateLimiter');

// Load environment configurations
dotenv.config();

const app = express();

// 1. Security & Header Middlewares
app.use(helmet());
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'https://staywise.ai'],
    credentials: true,
  })
);
app.use(cookieParser());

// 2. Global API Rate Limiter
app.use('/api/', apiLimiter);

// 3. Health & Readiness Check Endpoint (Before body parsing)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'StayWise API Engine',
    stateless: true,
  });
});

// 4. Mount Payment Routes BEFORE express.json() so Stripe webhook can read express.raw()
app.use('/api/payments', require('./routes/paymentRoutes'));

// 5. Standard JSON Body Parser for all other API endpoints
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 6. Mount Core Modular Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// 7. Route Not Found & Centralized JSON Error Handler
app.use(notFound);
app.use(errorHandler);

// 8. Server Initialization & Concurrency Bootstrap
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await initRedis();

    const server = app.listen(PORT, () => {
      console.log(`[SERVER] StayWise Stateless Engine active in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Graceful shutdown handling for container termination
    process.on('SIGTERM', () => {
      console.log('[SERVER] SIGTERM received. Gracefully closing HTTP cluster...');
      server.close(() => {
        console.log('[SERVER] HTTP cluster terminated.');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error(`[SERVER] Initialization Failure: ${error.message}`);
  }
};

startServer();

module.exports = app;
