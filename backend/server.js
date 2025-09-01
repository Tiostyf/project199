const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import database configuration
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

// Import middleware
const auth = require('./middleware/auth');
const rateLimiters = require('./middleware/rateLimit');

const app = express();
const PORT = process.env.PORT || 10000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../frontend')));

// Apply general rate limiting to all routes
app.use(rateLimiters.generalLimiter);

// API Routes with specific rate limiting
app.use('/api/auth', rateLimiters.authLimiter, rateLimiters.authSpeedLimiter, authRoutes);
app.use('/api/posts', rateLimiters.postLimiter, postRoutes);

// Serve frontend pages with authentication check
app.get(['/', '/home'], auth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/home.html'));
});

app.get('/service', auth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/service.html'));
});

app.get('/review', auth, rateLimiters.appointmentLimiter, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/review.html'));
});

// Auth pages (no authentication required)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

// Handle SPA routing - important for Render.com
app.get('*', (req, res) => {
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  
  // Check if the file exists
  const filePath = path.join(__dirname, `../frontend${req.url}`);
  
  // If it's a protected route, check authentication
  if (['/home', '/service', '/review'].includes(req.url)) {
    const token = req.cookies?.token;
    
    if (!token) {
      return res.redirect('/login');
    }
    
    // Try to verify the token
    try {
      const jwt = require('jsonwebtoken');
      jwt.verify(token, process.env.JWT_SECRET);
      return res.sendFile(filePath, (err) => {
        if (err) {
          res.status(404).send('Page not found');
        }
      });
    } catch (err) {
      return res.redirect('/login');
    }
  }
  
  // Serve public files
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('Page not found');
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.statusCode === 429) {
    return res.status(429).json({
      error: 'Too many requests, please try again later'
    });
  }
  
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server only if MongoDB connection is successful
const mongoose = require('mongoose');
mongoose.connection.on('connected', () => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

// Handle MongoDB connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});