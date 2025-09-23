const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task & Project Management API",
      version: "1.0.0",
      description:
        "A comprehensive API for managing tasks and projects with full CRUD operations, filtering, pagination support, and secure authentication using JWT tokens and Google OAuth.",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: process.env.DEPLOYED_URL || "http://localhost:3005",
        description: process.env.DEPLOYED_URL ? "Production server" : "Development server",
      },
    ],
    components: {
      schemas: {
        Task: {
          type: "object",
          required: ["title", "project", "createdBy"],
          properties: {
            _id: {
              type: "string",
              description: "The auto-generated ID of the task",
            },
            title: {
              type: "string",
              description: "The task title",
              maxLength: 100,
            },
            description: {
              type: "string",
              description: "The task description",
              maxLength: 500,
            },
            status: {
              type: "string",
              enum: ["pending", "in-progress", "completed"],
              default: "pending",
              description: "The task status",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high"],
              default: "medium",
              description: "The task priority",
            },
            dueDate: {
              type: "string",
              format: "date-time",
              description: "Due date for the task",
            },
            project: {
              type: "string",
              description: "Project ID this task belongs to",
            },
            assignedTo: {
              type: "string",
              description: "Person assigned to the task",
            },
            tags: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Tags for categorizing tasks",
            },
            createdBy: {
              type: "string",
              description: "User who created the task",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "When the task was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "When the task was last updated",
            },
          },
          example: {
            title: "Implement user authentication",
            description:
              "Set up JWT authentication system with login and registration",
            status: "in-progress",
            priority: "high",
            project: "60d5ecb74b24c72b8c8b4567",
            assignedTo: "John Doe",
            tags: ["backend", "security"],
            createdBy: "Jane Smith",
          },
        },
        Project: {
          type: "object",
          required: ["name", "manager", "createdBy"],
          properties: {
            _id: {
              type: "string",
              description: "The auto-generated ID of the project",
            },
            name: {
              type: "string",
              description: "The project name",
              maxLength: 100,
            },
            description: {
              type: "string",
              description: "The project description",
              maxLength: 1000,
            },
            status: {
              type: "string",
              enum: ["planning", "active", "on-hold", "completed", "cancelled"],
              default: "planning",
              description: "The project status",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high", "critical"],
              default: "medium",
              description: "The project priority",
            },
            startDate: {
              type: "string",
              format: "date-time",
              description: "Project start date",
            },
            endDate: {
              type: "string",
              format: "date-time",
              description: "Project end date",
            },
            budget: {
              type: "number",
              minimum: 0,
              description: "Project budget",
            },
            progress: {
              type: "number",
              minimum: 0,
              maximum: 100,
              default: 0,
              description: "Project progress percentage",
            },
            manager: {
              type: "string",
              description: "Project manager",
            },
            team: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Project team members",
            },
            tags: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Project tags",
            },
            createdBy: {
              type: "string",
              description: "User who created the project",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "When the project was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "When the project was last updated",
            },
          },
          example: {
            name: "E-commerce Platform",
            description: "Build a full-featured e-commerce platform",
            status: "active",
            priority: "high",
            startDate: "2024-01-01T00:00:00.000Z",
            endDate: "2024-06-30T23:59:59.000Z",
            budget: 50000,
            manager: "Alice Johnson",
            team: ["Bob Wilson", "Carol Davis"],
            tags: ["web", "ecommerce"],
            createdBy: "David Brown",
          },
        },
        ProjectProgressUpdate: {
          type: "object",
          required: ["progress"],
          properties: {
            progress: {
              type: "number",
              minimum: 0,
              maximum: 100,
              description: "Project progress percentage (0-100)",
              example: 75
            },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            data: {
              type: "object",
              description: "Response data",
            },
            message: {
              type: "string",
              description: "Response message",
            },
            count: {
              type: "number",
              description: "Number of items in current response",
            },
            total: {
              type: "number",
              description: "Total number of items",
            },
            totalPages: {
              type: "number",
              description: "Total number of pages",
            },
            currentPage: {
              type: "number",
              description: "Current page number",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "string",
              description: "Error type",
            },
            message: {
              type: "string",
              description: "Error message",
            },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    path.join(__dirname, "../routes/tasks.js"),
    path.join(__dirname, "../routes/projects.js"),
    path.join(__dirname, "../routes/auth.js"),
  ],
};

// Debug logging
console.log("Swagger config directory:", __dirname);
console.log("Looking for route files at:", [
  path.join(__dirname, "../routes/tasks.js"),
  path.join(__dirname, "../routes/projects.js"),
]);

const specs = swaggerJSDoc(options);
console.log("Swagger specs generated successfully:", !!specs);

module.exports = specs;