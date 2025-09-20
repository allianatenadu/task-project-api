const Task = require('../models/taskModel');
const Project = require('../models/projectModel');

// Get all tasks with pagination and filtering
const getAllTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      project,
      assignedTo,
      search
    } = req.query;

    // Build filter object
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (project) filter.project = project;
    if (assignedTo) filter.assignedTo = { $regex: assignedTo, $options: 'i' };

    // Add search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count and tasks with pagination
    const [total, tasks] = await Promise.all([
      Task.countDocuments(filter),
      Task.find(filter)
        .populate('project', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean()
    ]);

    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: tasks
    });
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to retrieve tasks'
    });
  }
};

// Get single task by ID
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id).populate('project', 'name');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        message: `No task found with ID: ${id}`
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error getting task:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: 'Please provide a valid task ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to retrieve task'
    });
  }
};

// Create new task
const createTask = async (req, res) => {
  try {
    // Validate project exists if provided
    if (req.body.project) {
      const project = await Project.findById(req.body.project);
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found',
          message: 'The specified project does not exist'
        });
      }
    }

    // Create new task
    const newTask = new Task({
      ...req.body,
      status: req.body.status || 'pending'
    });

    const savedTask = await newTask.save();

    // Populate project details
    await savedTask.populate('project', 'name');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: savedTask
    });
  } catch (error) {
    console.error('Error creating task:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: error.message
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid Project ID',
        message: 'Please provide a valid project ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to create task'
    });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if task exists
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        message: `No task found with ID: ${id}`
      });
    }

    // Validate project exists if being updated
    if (req.body.project) {
      const project = await Project.findById(req.body.project);
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found',
          message: 'The specified project does not exist'
        });
      }
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('project', 'name');

    if (!updatedTask) {
      return res.status(400).json({
        success: false,
        error: 'Update failed',
        message: 'Failed to update the task'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Error updating task:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: error.message
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: 'Please provide a valid task ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to update task'
    });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if task exists
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        message: `No task found with ID: ${id}`
      });
    }

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(400).json({
        success: false,
        error: 'Deletion failed',
        message: 'Failed to delete the task'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: 'Please provide a valid task ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to delete task'
    });
  }
};

// Get tasks by status
const getTasksByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const tasks = await Task.find({ status })
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Error getting tasks by status:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to retrieve tasks by status'
    });
  }
};

// Get overdue tasks
const getOverdueTasks = async (req, res) => {
  try {
    const currentDate = new Date();

    const tasks = await Task.find({
      dueDate: { $lt: currentDate },
      status: { $ne: 'completed' }
    })
    .populate('project', 'name')
    .sort({ dueDate: 1 })
    .lean();

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Error getting overdue tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to retrieve overdue tasks'
    });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTasksByStatus,
  getOverdueTasks
};