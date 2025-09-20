const Project = require('../models/projectModel');
const Task = require('../models/taskModel');

// Get all projects with pagination and filtering
const getAllProjects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      manager,
      search
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (manager) filter.manager = { $regex: manager, $options: 'i' };
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count and projects with pagination
    const [total, projects] = await Promise.all([
      Project.countDocuments(filter),
      Project.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean()
    ]);
    
    res.status(200).json({
      success: true,
      count: projects.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: projects
    });
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to retrieve projects'
    });
  }
};

// Get single project by ID with tasks
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
        message: `No project found with ID: ${id}`
      });
    }

    // Get associated tasks
    const tasks = await Task.find({ project: id })
      .sort({ createdAt: -1 })
      .lean();

    // Convert to object and add tasks
    const projectData = project.toObject();
    projectData.tasks = tasks;
    
    res.status(200).json({
      success: true,
      data: projectData
    });
  } catch (error) {
    console.error('Error getting project:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: 'Please provide a valid project ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to retrieve project'
    });
  }
};

// Create new project
const createProject = async (req, res) => {
  try {
    // Create new project
    const newProject = new Project({
      ...req.body,
      status: req.body.status || 'planning',
      priority: req.body.priority || 'medium',
      progress: req.body.progress || 0
    });
    
    const savedProject = await newProject.save();
    
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: savedProject
    });
  } catch (error) {
    console.error('Error creating project:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to create project'
    });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if project exists
    const existingProject = await Project.findById(id);
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
        message: `No project found with ID: ${id}`
      });
    }
    
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return res.status(400).json({
        success: false,
        error: 'Update failed',
        message: 'Failed to update the project'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });
  } catch (error) {
    console.error('Error updating project:', error);
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
        message: 'Please provide a valid project ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to update project'
    });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if project exists
    const existingProject = await Project.findById(id);
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
        message: `No project found with ID: ${id}`
      });
    }
    
    // Check if project has associated tasks
    const tasksCount = await Task.countDocuments({ project: id });
    if (tasksCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete project',
        message: `This project has ${tasksCount} associated tasks. Please delete or reassign tasks first.`
      });
    }
    
    const deletedProject = await Project.findByIdAndDelete(id);
    
    if (!deletedProject) {
      return res.status(400).json({
        success: false,
        error: 'Deletion failed',
        message: 'Failed to delete the project'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: 'Please provide a valid project ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to delete project'
    });
  }
};

// Get projects by status
const getProjectsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const projects = await Project.find({ status })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Error getting projects by status:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to retrieve projects by status'
    });
  }
};

// Get projects by manager
const getProjectsByManager = async (req, res) => {
  try {
    const { manager } = req.params;

    const projects = await Project.find({ 
      manager: { $regex: manager, $options: 'i' } 
    })
    .sort({ createdAt: -1 })
    .lean();

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Error getting projects by manager:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to retrieve projects by manager'
    });
  }
};

// Get overdue projects
const getOverdueProjects = async (req, res) => {
  try {
    const currentDate = new Date();

    const projects = await Project.find({
      endDate: { $lt: currentDate },
      status: { $nin: ['completed', 'cancelled'] }
    })
    .sort({ endDate: 1 })
    .lean();

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Error getting overdue projects:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to retrieve overdue projects'
    });
  }
};

// Update project progress
const updateProjectProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;

    // Check if project exists
    const existingProject = await Project.findById(id);
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
        message: `No project found with ID: ${id}`
      });
    }

    // Validate progress value
    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid progress value',
        message: 'Progress must be between 0 and 100'
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { 
        progress: parseInt(progress),
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return res.status(400).json({
        success: false,
        error: 'Update failed',
        message: 'Failed to update project progress'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project progress updated successfully',
      data: updatedProject
    });
  } catch (error) {
    console.error('Error updating project progress:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: 'Please provide a valid project ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to update project progress'
    });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectsByStatus,
  getProjectsByManager,
  getOverdueProjects,
  updateProjectProgress
};