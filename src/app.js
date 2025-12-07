const express = require('express');
const cors = require('cors');
const path = require('path');
const { cookieParser } = require('./middlewares/auth.middleware');

const app = express();

// ========== MIDDLEWARES ==========

// Body parser - increased limit for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cookie parser
app.use(cookieParser);

// CORS configuration - allow all localhost origins for development
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    // Allow all localhost origins
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }

    // Allow file:// protocol for local HTML files
    if (origin === 'null' || origin.startsWith('file://')) {
      return callback(null, true);
    }

    // For production, check environment variable
    if (process.env.CORS_ORIGIN && origin === process.env.CORS_ORIGIN) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// ========== ROUTES ==========

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Travel Bliss API is running!',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      docs: '/api/docs',
      admin: '/api/admin/*'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Import routes
const demoRoutes = require('./routes/demo.routes');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const tourRoutes = require('./routes/tour.routes');
const uploadRoutes = require('./routes/upload.routes');
const geocodingRoutes = require('./routes/geocoding.routes');
const blogRoutes = require('./routes/blog.routes');
const destinationRoutes = require('./routes/destination.routes');
const categoryRoutes = require('./routes/category.routes');
const aiRoutes = require('./routes/ai.routes');
const bookingRoutes = require('./routes/booking.routes');
const sitemapRoutes = require('./routes/sitemap.routes');
const settingsRoutes = require('./routes/settings.routes');
const homeSettingsRoutes = require('./routes/homeSettings.routes');
const languageRoutes = require('./routes/language.routes');
const aboutSettingsRoutes = require('./routes/aboutSettings.routes');

// Use routes
app.use('/api/demo', demoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/geocoding', geocodingRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/home-settings', homeSettingsRoutes);
app.use('/api/languages', languageRoutes);
app.use('/api/about-settings', aboutSettingsRoutes);

// SEO routes (sitemap.xml and robots.txt)
app.use('/', sitemapRoutes);

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Admin panel static files (JS, CSS)
app.use('/admin', express.static(path.join(__dirname, '../public/admin')));

// Admin panel route - serve index.html
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin/index.html'));
});

// Static files (public - HTML pages) - OXIRIDA
app.use(express.static(path.join(__dirname, '../public')));

// ========== ERROR HANDLING ==========

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
