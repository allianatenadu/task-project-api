const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !this.startDate || value >= this.startDate;
      },
      message: 'End date must be after or equal to start date'
    }
  },
  budget: {
    type: Number,
    min: [0, 'Budget cannot be negative']
  },
  progress: {
    type: Number,
    min: [0, 'Progress cannot be less than 0'],
    max: [100, 'Progress cannot exceed 100'],
    default: 0
  },
  manager: {
    type: String,
    required: [true, 'Project manager is required'],
    trim: true
  },
  team: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: String,
    required: [true, 'Created by is required'],
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
projectSchema.index({ status: 1 });
projectSchema.index({ priority: 1 });
projectSchema.index({ manager: 1 });
projectSchema.index({ startDate: 1 });

// Virtual for project duration in days
projectSchema.virtual('duration').get(function() {
  if (!this.endDate || !this.startDate) return null;
  const diffTime = this.endDate - this.startDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days remaining
projectSchema.virtual('daysRemaining').get(function() {
  if (!this.endDate || this.status === 'completed' || this.status === 'cancelled') return null;
  const today = new Date();
  const diffTime = this.endDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Virtual for overdue status
projectSchema.virtual('isOverdue').get(function() {
  if (!this.endDate || this.status === 'completed' || this.status === 'cancelled') return false;
  return this.endDate < new Date();
});

// Virtual for task count (populated from tasks)
projectSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
  count: true
});

// Virtual for completed task count
projectSchema.virtual('completedTaskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
  match: { status: 'completed' },
  count: true
});

// Pre-save middleware to calculate progress based on tasks
projectSchema.pre('save', async function(next) {
  if (this.isModified('progress')) {
    // If progress is manually set, don't override
    return next();
  }

  try {
    const Task = mongoose.model('Task');
    const totalTasks = await Task.countDocuments({ project: this._id });
    const completedTasks = await Task.countDocuments({
      project: this._id,
      status: 'completed'
    });

    if (totalTasks > 0) {
      this.progress = Math.round((completedTasks / totalTasks) * 100);
    }
  } catch (error) {
    console.error('Error calculating project progress:', error);
  }

  next();
});

// Static method to find active projects
projectSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

// Static method to find projects by manager
projectSchema.statics.findByManager = function(manager) {
  return this.find({ manager });
};

// Static method to find overdue projects
projectSchema.statics.findOverdue = function() {
  return this.find({
    endDate: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] }
  });
};

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;