const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

// Import middleware
const auth = require('./middleware/auth');
const {
  generalLimiter,
  authLimiter,
  authSpeedLimiter,
  appointmentLimiter,
  postLimiter
} = require('./middleware/rateLimit');

const app = express();
const PORT = process.env.PORT || 10000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aiims_portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

// Apply general rate limiting to all routes
app.use(generalLimiter);

// API Routes with specific rate limiting
app.use('/api/auth', authLimiter, authSpeedLimiter, authRoutes);
app.use('/api/posts', postLimiter, postRoutes);

// Serve frontend pages with authentication check
app.get(['/', '/home'], auth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/home.html'));
});

app.get('/service', auth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/service.html'));
});

app.get('/review', auth, appointmentLimiter, (req, res) => {
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
    // API routes return 404 for not found
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  
  // For all other routes, check if user is authenticated
  const token = req.header('x-auth-token') || req.cookies?.token;
  
  if (!token) {
    // If no token, redirect to login for protected pages
    if (['/home', '/service', '/review'].includes(req.url)) {
      return res.redirect('/login');
    }
    // Serve public files directly
    return res.sendFile(path.join(__dirname, `../frontend${req.url}`), (err) => {
      if (err) {
        res.status(404).send('Page not found');
      }
    });
  }
  
  // If token exists, try to verify it
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    
    // Serve the requested file
    res.sendFile(path.join(__dirname, `../frontend${req.url}`), (err) => {
      if (err) {
        res.status(404).send('Page not found');
      }
    });
  } catch (err) {
    // Invalid token, redirect to login
    res.redirect('/login');
  }
});

// Error handling middleware for rate limiting
app.use((err, req, res, next) => {
  if (err.statusCode === 429) {
    return res.status(429).json({
      error: 'Too many requests, please try again later'
    });
  }
  next(err);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});