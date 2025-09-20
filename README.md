# Task Project API

A comprehensive REST API for managing tasks and projects built with Node.js, Express, and MongoDB. This API provides full CRUD operations for both tasks and projects with advanced features like filtering, pagination, validation, and comprehensive documentation.

## Features

- **Task Management**: Create, read, update, and delete tasks
- **Project Management**: Manage projects with team assignments and progress tracking
- **Advanced Filtering**: Filter tasks and projects by status, priority, manager, etc.
- **Pagination**: Efficient data retrieval with pagination support
- **Input Validation**: Comprehensive validation using Joi
- **API Documentation**: Interactive Swagger documentation
- **MongoDB Integration**: Robust database operations with Mongoose ODM
- **Error Handling**: Comprehensive error handling and validation
- **CORS Support**: Cross-origin resource sharing enabled

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Joi
- **Documentation**: Swagger/OpenAPI
- **Other**: CORS, dotenv

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-project-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/taskprojectdb
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Base URL
```
http://localhost:3000
```

### Tasks Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks with filtering and pagination |
| GET | `/api/tasks/:id` | Get single task by ID |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/tasks/status/:status` | Get tasks by status |
| GET | `/api/tasks/overdue` | Get overdue tasks |

### Projects Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all projects with filtering and pagination |
| GET | `/api/projects/:id` | Get single project with tasks |
| POST | `/api/projects` | Create new project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| GET | `/api/projects/status/:status` | Get projects by status |
| GET | `/api/projects/manager/:manager` | Get projects by manager |
| GET | `/api/projects/overdue` | Get overdue projects |
| PUT | `/api/projects/:id/progress` | Update project progress |

### Other Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information and available endpoints |
| GET | `/health` | Health check endpoint |
| GET | `/api-docs` | Interactive API documentation |

## Query Parameters

### Tasks Query Parameters
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 10, max: 100)
- `status` (string): Filter by status (pending, in-progress, completed)
- `priority` (string): Filter by priority (low, medium, high)
- `project` (string): Filter by project ID
- `assignedTo` (string): Filter by assigned person
- `sort` (string): Sort field (default: -createdAt)
- `search` (string): Search in title and description

### Projects Query Parameters
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 10, max: 100)
- `status` (string): Filter by status (planning, active, on-hold, completed, cancelled)
- `priority` (string): Filter by priority (low, medium, high, critical)
- `manager` (string): Filter by manager name
- `sort` (string): Sort field (default: -createdAt)
- `search` (string): Search in name and description

## Request/Response Examples

### Create a Task
```bash
POST /api/tasks
Content-Type: application/json

{
  "title": "Implement user authentication",
  "description": "Add JWT authentication to the API",
  "status": "in-progress",
  "priority": "high",
  "project": "60d5ecb74b24c72b8c8b4567",
  "assignedTo": "John Doe",
  "tags": ["backend", "security"],
  "createdBy": "Jane Smith"
}
```

### Get Tasks with Filtering
```bash
GET /api/tasks?status=in-progress&priority=high&page=1&limit=5
```

### Create a Project
```bash
POST /api/projects
Content-Type: application/json

{
  "name": "E-commerce Platform",
  "description": "Build a full-featured e-commerce platform",
  "status": "active",
  "priority": "high",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-06-30T23:59:59.000Z",
  "budget": 50000,
  "manager": "Alice Johnson",
  "team": ["Bob Wilson", "Carol Davis"],
  "tags": ["web", "ecommerce"],
  "createdBy": "David Brown"
}
```

## Data Models

### Task Schema
```javascript
{
  title: String (required, max 100 chars),
  description: String (max 500 chars),
  status: String (enum: pending, in-progress, completed),
  priority: String (enum: low, medium, high),
  dueDate: Date,
  project: ObjectId (required, ref: Project),
  assignedTo: String,
  tags: [String],
  createdBy: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

### Project Schema
```javascript
{
  name: String (required, max 100 chars),
  description: String (max 1000 chars),
  status: String (enum: planning, active, on-hold, completed, cancelled),
  priority: String (enum: low, medium, high, critical),
  startDate: Date,
  endDate: Date,
  budget: Number (min: 0),
  progress: Number (0-100, auto-calculated),
  manager: String (required),
  team: [String],
  tags: [String],
  createdBy: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

## API Documentation

Interactive API documentation is available at `/api-docs` when the server is running. This provides a user-friendly interface to test all endpoints with request/response examples.

## Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Human readable error message",
  "details": [
    {
      "field": "field.name",
      "message": "Validation error message"
    }
  ]
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `500`: Internal Server Error

## Development

### Available Scripts
- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon

### Project Structure
```
task-project-api/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
├── .gitignore            # Git ignore rules
├── config/
│   └── database.js       # Database configuration
├── models/
│   ├── taskModel.js      # Task data model
│   └── projectModel.js   # Project data model
├── controllers/
│   ├── taskController.js     # Task business logic
│   └── projectController.js  # Project business logic
├── middleware/
│   └── validation.js     # Input validation middleware
├── routes/
│   ├── tasks.js          # Task API routes
│   └── projects.js       # Project API routes
├── docs/
│   └── swagger.js        # API documentation
└── README.md             # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support, please contact the development team or create an issue in the repository.

---

**Note**: Make sure to update the MongoDB connection string in the `.env` file with your actual database credentials before running the application.