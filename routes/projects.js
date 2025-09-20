const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectsByStatus,
  getProjectsByManager,
  getOverdueProjects,
  updateProjectProgress
} = require('../controllers/projectController');

const {
  validateProject
} = require('../middleware/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - name
 *         - manager
 *         - createdBy
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the project
 *         name:
 *           type: string
 *           description: The project name
 *           maxLength: 100
 *         description:
 *           type: string
 *           description: The project description
 *           maxLength: 1000
 *         status:
 *           type: string
 *           enum: [planning, active, on-hold, completed, cancelled]
 *           default: planning
 *           description: The project status
 *         priority:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           default: medium
 *           description: The project priority
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Project start date
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Project end date
 *         budget:
 *           type: number
 *           minimum: 0
 *           description: Project budget
 *         progress:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           default: 0
 *           description: Project progress percentage
 *         manager:
 *           type: string
 *           description: Project manager
 *         team:
 *           type: array
 *           items:
 *             type: string
 *           description: Project team members
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Project tags
 *         createdBy:
 *           type: string
 *           description: User who created the project
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the project was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the project was last updated
 *       example:
 *         name: "E-commerce Platform"
 *         description: "Build a full-featured e-commerce platform"
 *         status: "active"
 *         priority: "high"
 *         startDate: "2024-01-01T00:00:00.000Z"
 *         endDate: "2024-06-30T23:59:59.000Z"
 *         budget: 50000
 *         manager: "Alice Johnson"
 *         team: ["Bob Wilson", "Carol Davis"]
 *         tags: ["web", "ecommerce"]
 *         createdBy: "David Brown"
 */

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management API
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Returns the list of all projects with filtering and pagination
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planning, active, on-hold, completed, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filter by priority
 *       - in: query
 *         name: manager
 *         schema:
 *           type: string
 *         description: Filter by manager name
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name and description
 *     responses:
 *       200:
 *         description: The list of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 10
 *                 total:
 *                   type: number
 *                   example: 25
 *                 totalPages:
 *                   type: number
 *                   example: 3
 *                 currentPage:
 *                   type: number
 *                   example: 1
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *       400:
 *         description: Query validation error
 *       500:
 *         description: Server error
 */
router.get('/', getAllProjects);

/**
 * @swagger
 * /api/projects/status/{status}:
 *   get:
 *     summary: Get projects by status
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planning, active, on-hold, completed, cancelled]
 *         required: true
 *         description: The project status
 *     responses:
 *       200:
 *         description: The list of projects with specified status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *       500:
 *         description: Server error
 */
router.get('/status/:status', getProjectsByStatus);

/**
 * @swagger
 * /api/projects/manager/{manager}:
 *   get:
 *     summary: Get projects by manager
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: manager
 *         schema:
 *           type: string
 *         required: true
 *         description: The project manager name
 *     responses:
 *       200:
 *         description: The list of projects managed by specified person
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *       500:
 *         description: Server error
 */
router.get('/manager/:manager', getProjectsByManager);

/**
 * @swagger
 * /api/projects/overdue:
 *   get:
 *     summary: Get overdue projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: The list of overdue projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *       500:
 *         description: Server error
 */
router.get('/overdue', getOverdueProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get a project by ID with associated tasks
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The project ID
 *     responses:
 *       200:
 *         description: The project data with tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Project'
 *                     - type: object
 *                       properties:
 *                         tasks:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Task'
 *       404:
 *         description: Project not found
 *       400:
 *         description: Invalid ID format
 *       500:
 *         description: Server error
 */
router.get('/:id', getProjectById);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', validateProject, createProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.put('/:id', validateProject, updateProject);

/**
 * @swagger
 * /api/projects/{id}/progress:
 *   put:
 *     summary: Update project progress
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectProgressUpdate'
 *     responses:
 *       200:
 *         description: Project progress updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *                 message:
 *                   type: string
 *                   example: "Project progress updated successfully"
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.put('/:id/progress', updateProjectProgress);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete a project (only if no tasks exist)
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   example: {}
 *                 message:
 *                   type: string
 *                   example: "Project deleted successfully"
 *       400:
 *         description: Cannot delete project with existing tasks
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteProject);

module.exports = router;