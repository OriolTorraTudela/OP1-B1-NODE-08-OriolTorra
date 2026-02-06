const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const ErrorResponse = require('./utils/errorResponse');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(morgan('dev'));

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);

// 404
app.use((req, res, next) => next(new ErrorResponse('Not found', 404)));

// Error handler
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const payload = {
    success: false,
    error: err.message || 'Server error'
  };
  if (err.details) payload.details = err.details;
  res.status(status).json(payload);
});

module.exports = app;
