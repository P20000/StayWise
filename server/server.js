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

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://staywise.ai',
  'https://staywise-52dr.onrender.com'
];

if (process.env.ALLOWED_ORIGINS) {
  const envOrigins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
  allowedOrigins.push(...envOrigins);
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or postman)
      if (!origin) return callback(null, true);
      
      const isLocalhostOrLan = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin);
      
      if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.onrender.com') || isLocalhostOrLan) {
        return callback(null, true);
      }
      
      return callback(new Error('CORS policy violation'), false);
    },
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

// 4. Standard JSON Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 5. Mount Core Modular Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/itinerary', require('./routes/itineraryRoutes'));
app.use('/api/chat', require('./routes/itineraryRoutes'));

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
