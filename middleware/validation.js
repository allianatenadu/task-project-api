const Joi = require('joi');

// Task validation schema
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
  createdBy: Joi.string().min(2).max(50).required()
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

// Project validation schema
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
  createdBy: Joi.string().min(2).max(50).required()
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
  tags: Joi.array().items(Joi.string()).optional(),
  createdBy: Joi.string().min(2).max(50).optional()
});

// Validation middleware functions
const validateTask = (req, res, next) => {
  const { error } = taskSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
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
      error: 'Validation Error',
      message: error.details[0].message
    });
  }
  next();
};

const validateProject = (req, res, next) => {
  const { error } = projectSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
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
      error: 'Validation Error',
      message: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateTask,
  validateTaskUpdate,
  validateProject,
  validateProjectUpdate
};