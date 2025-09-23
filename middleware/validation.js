const Joi = require('joi');

// User registration validation schema
const userSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().max(50).optional(),
  lastName: Joi.string().max(50).optional()
});

// User login validation schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

// Password change validation schema
const passwordChangeSchema = Joi.object({
  currentPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required()
});

// Task validation schema (updated to include authentication)
const taskSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(500).required(),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  status: Joi.string().valid('pending', 'in-progress', 'completed').default('pending'),
  assignedTo: Joi.string().min(2).max(50).optional(),
  dueDate: Joi.date().iso().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  estimatedHours: Joi.number().min(0).max(1000).optional(),
  project: Joi.string().optional(),
  createdBy: Joi.string().min(2).max(50).optional() // Now optional as it will be set from authenticated user
});

// Task update schema (all fields optional)
const taskUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  description: Joi.string().min(10).max(500).optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  status: Joi.string().valid('pending', 'in-progress', 'completed').optional(),
  assignedTo: Joi.string().min(2).max(50).optional(),
  dueDate: Joi.date().iso().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  estimatedHours: Joi.number().min(0).max(1000).optional(),
  project: Joi.string().optional()
});

// Project validation schema (updated to include authentication)
const projectSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).optional(),
  status: Joi.string().valid('planning', 'active', 'on-hold', 'completed', 'cancelled').default('planning'),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
  budget: Joi.number().min(0).optional(),
  progress: Joi.number().min(0).max(100).optional(),
  manager: Joi.string().min(2).max(50).required(),
  team: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  createdBy: Joi.string().min(2).max(50).optional() // Now optional as it will be set from authenticated user
});

// Project update schema (all fields optional)
const projectUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  description: Joi.string().min(10).max(1000).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  status: Joi.string().valid('planning', 'active', 'on-hold', 'completed', 'cancelled').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
  budget: Joi.number().min(0).optional(),
  progress: Joi.number().min(0).max(100).optional(),
  manager: Joi.string().min(2).max(50).optional(),
  team: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

// Validation middleware functions
const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: error.details[0].message
    });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: error.details[0].message
    });
  }
  next();
};

const validatePasswordChange = (req, res, next) => {
  const { error } = passwordChangeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: error.details[0].message
    });
  }
  next();
};

const validateTask = (req, res, next) => {
  // If user is authenticated, set createdBy from the user
  if (req.user && !req.body.createdBy) {
    req.body.createdBy = req.user.username || req.user.email;
  }

  const { error } = taskSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: error.details[0].message
    });
  }
  next();
};

const validateTaskUpdate = (req, res, next) => {
  const { error } = taskUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: error.details[0].message
    });
  }
  next();
};

const validateProject = (req, res, next) => {
  // If user is authenticated, set createdBy from the user
  if (req.user && !req.body.createdBy) {
    req.body.createdBy = req.user.username || req.user.email;
  }

  const { error } = projectSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: error.details[0].message
    });
  }
  next();
};

const validateProjectUpdate = (req, res, next) => {
  const { error } = projectUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateUser,
  validateLogin,
  validatePasswordChange,
  validateTask,
  validateTaskUpdate,
  validateProject,
  validateProjectUpdate
};