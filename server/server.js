require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const iconRoutes = require('./routes/iconRoutes');
const packRoutes = require('./routes/packRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const googleDriveRoutes = require('./routes/googleDriveRoutes');

const app = express();

// Connect to MongoDB Atlas
connectDB();

// Pre-register all Mongoose Models
require('./models/User');
require('./models/Category');
require('./models/Pack');
require('./models/Icon');
require('./models/Collection');
require('./models/Download');
require('./models/Subscription');
require('./models/DriveSyncLog');

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://iconsuniverse.com',
  'https://www.iconsuniverse.com',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in dev/staging
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Apply rate limiter to general API calls
app.use('/api', apiLimiter);

// Mount REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/icons', iconRoutes);
app.use('/api/packs', packRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/drive', googleDriveRoutes);

// Health check endpoint for Northflank monitoring
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'IconsUniverse Backend API',
    uptime: process.uptime(),
  });
});

app.get('/', (req, res) => {
  res.send('🌌 IconsUniverse API is running smoothly.');
});

// Centralized Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`[IconsUniverse API] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection] ${err.message}`);
});
