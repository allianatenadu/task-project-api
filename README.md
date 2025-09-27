# Task Project API

A comprehensive REST API for managing tasks and projects built with Node.js, Express, and MongoDB. This API provides full CRUD operations for both tasks and projects with advanced features like filtering, pagination, validation, and comprehensive documentation.

## Features

- **User Authentication**: JWT-based authentication with secure token management
- **User Registration**: Complete user registration system with validation
- **Google OAuth**: Social authentication with Google accounts
- **Password Security**: bcrypt password hashing with salt rounds
- **Profile Management**: User profile viewing and updating capabilities
- **Password Management**: Secure password change functionality
- **Task Management**: Create, read, update, and delete tasks
- **Project Management**: Manage projects with team assignments and progress tracking
- **Advanced Filtering**: Filter tasks and projects by status, priority, manager, etc.
- **Pagination**: Efficient data retrieval with pagination support
- **Input Validation**: Comprehensive validation using Joi
- **API Documentation**: Interactive Swagger documentation
- **MongoDB Integration**: Robust database operations with Mongoose ODM
- **Error Handling**: Comprehensive error handling and validation
- **CORS Support**: Cross-origin resource sharing enabled
- **Rate Limiting**: Protection against brute force attacks

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken), bcryptjs for password hashing
- **OAuth**: Google Auth Library for Google OAuth integration
- **Validation**: Joi for input validation
- **Documentation**: Swagger/OpenAPI
- **Other**: CORS, dotenv, express-rate-limit for security

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
    PORT=3005
    MONGODB_URI=mongodb+srv://your-connection-string
    NODE_ENV=development

    # JWT Configuration
    JWT_SECRET=your-super-secret-jwt-key
    JWT_EXPIRE=7d

    # Google OAuth Configuration (optional)
    GOOGLE_CLIENT_ID=your-google-client-id
    GOOGLE_CLIENT_SECRET=your-google-client-secret

    # API Configuration
    API_VERSION=v1

    # Rate Limiting (optional)
    RATE_LIMIT_WINDOW_MS=900000
    RATE_LIMIT_MAX_REQUESTS=100
    ```

4. **Start the server**
   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Base URLs
```
Local Development: http://localhost:3005
Production: https://task-project-api-yfnu.onrender.com
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

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user account |
| POST | `/api/auth/login` | Login with email and password |
| POST | `/api/auth/google` | Authenticate with Google OAuth |
| GET | `/api/auth/profile` | Get current user profile (protected) |
| PUT | `/api/auth/profile` | Update user profile (protected) |
| PUT | `/api/auth/change-password` | Change user password (protected) |
| POST | `/api/auth/logout` | Logout user (protected) |

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

### User Registration
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### User Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

### Google OAuth Authentication
```bash
POST /api/auth/google
Content-Type: application/json

{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2Nz..."
}
```

### Get User Profile (Protected Route)
```bash
GET /api/auth/profile
Authorization: Bearer <your-jwt-token>
```

### Update User Profile (Protected Route)
```bash
PUT /api/auth/profile
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Updated",
  "username": "johnupdated"
}
```

### Change Password (Protected Route)
```bash
PUT /api/auth/change-password
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

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

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Once a user registers and logs in, they receive a token that must be included in the Authorization header for protected routes.

### Authentication Flow

1. **Register**: Create a new user account with `POST /api/auth/register`
2. **Login**: Authenticate with `POST /api/auth/login` to receive a JWT token
3. **Access Protected Routes**: Include the token in the Authorization header as `Bearer <token>`
4. **Google OAuth**: Alternatively, authenticate using Google OAuth with `POST /api/auth/google`

### Protected Routes

The following routes require authentication:
- All `/api/tasks/*` endpoints
- All `/api/projects/*` endpoints
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `PUT /api/auth/change-password`
- `POST /api/auth/logout`

### Token Management

- Tokens expire after 7 days (configurable via `JWT_EXPIRE` environment variable)
- Include tokens in requests using: `Authorization: Bearer <your-jwt-token>`
- Store tokens securely on the client-side
- Tokens are automatically invalidated on logout

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
│   ├── database.js       # Database configuration
│   └── passport.js       # Google OAuth configuration
├── models/
│   ├── userModel.js      # User data model
│   ├── taskModel.js      # Task data model
│   └── projectModel.js   # Project data model
├── controllers/
│   ├── authController.js     # Authentication business logic
│   ├── taskController.js     # Task business logic
│   └── projectController.js  # Project business logic
├── middleware/
│   ├── auth.js           # Authentication middleware
│   └── validation.js     # Input validation middleware
├── routes/
│   ├── auth.js           # Authentication API routes
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