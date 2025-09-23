require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./docs/swagger');
const { connectDB } = require('./config/database');

// Import routes
const taskRoutes = require('./routes/tasks');
const projectRoutes = require('./routes/projects');
const authRoutes = require('./routes/auth');

// Import authentication middleware
const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Task & Project Management API',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true
  }
}));

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Task & Project Management API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      authentication: '/api/auth',
      tasks: '/api/tasks',
      projects: '/api/projects'
    },
    status: 'Active',
    features: [
      'JWT Authentication',
      'Google OAuth Integration',
      'Task Management',
      'Project Management', 
      'Role-based Access Control',
      'Input Validation',
      'Error Handling',
      'API Documentation'
    ]
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Public routes (no authentication required)
app.use('/api/auth', authRoutes);

// Protected routes (authentication required)
app.use('/api/tasks', authenticate, taskRoutes);
app.use('/api/projects', authenticate, projectRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist`,
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /api-docs',
      // Authentication routes
      'POST /api/auth/register',
      'POST /api/auth/login', 
      'POST /api/auth/google',
      'GET /api/auth/profile',
      'PUT /api/auth/profile',
      'PUT /api/auth/change-password',
      'POST /api/auth/logout',
      // Task routes (authenticated)
      'GET /api/tasks',
      'POST /api/tasks',
      'GET /api/tasks/:id',
      'PUT /api/tasks/:id',
      'DELETE /api/tasks/:id',
      'GET /api/tasks/status/:status',
      'GET /api/tasks/overdue',
      // Project routes (authenticated)
      'GET /api/projects',
      'POST /api/projects',
      'GET /api/projects/:id',
      'PUT /api/projects/:id',
      'DELETE /api/projects/:id',
      'PUT /api/projects/:id/progress',
      'GET /api/projects/status/:status',
      'GET /api/projects/manager/:manager',
      'GET /api/projects/overdue'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global Error Handler:', {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: error.message
    });
  }
  
  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      error: 'Duplicate Entry',
      message: `A resource with this ${field} already exists`
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid Token',
      message: 'The provided token is invalid'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token Expired',
      message: 'Your session has expired. Please log in again'
    });
  }

  // Mongoose CastError
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID',
      message: 'Please provide a valid ID'
    });
  }
  
  // Default error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.name || 'Internal Server Error',
    message: error.message || 'Something went wrong on the server',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    // Validate required environment variables
    const requiredEnvVars = [
      'MONGODB_URI',
      'JWT_SECRET'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('Missing required environment variables:', missingVars.join(', '));
      console.error('Please check your .env file');
      process.exit(1);
    }

    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📚 API Documentation available at: http://localhost:${PORT}/api-docs`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
      console.log('🔐 Authentication features enabled');
      console.log('📋 Available endpoints:');
      console.log('   - Authentication: /api/auth');
      console.log('   - Tasks: /api/tasks (protected)');
      console.log('   - Projects: /api/projects (protected)');
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  console.log('Shutting down server due to unhandled promise rejection');
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  console.log('Shutting down server due to uncaught exception');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();