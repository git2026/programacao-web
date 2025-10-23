# Portfolio Backend API

Backend API server for the Developer Portfolio with JWT-based authentication and authorization.

## 🚀 Features

- **User Authentication**: Register and login with JWT tokens
- **Role-Based Authorization**: Admin and Guest roles
- **Projects API**: Public GET, Admin-only POST
- **Protected Routes**: Dashboard accessible only to authenticated users

## 📋 Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

## 🔧 Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

## 🏃 Running the Server

Development mode (with auto-restart on file changes):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

#### Register a new user
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "role": "guest"  // or "admin"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "guest"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "guest"
  }
}
```

#### Get Dashboard (Protected)
```http
GET /api/auth/dashboard
Authorization: Bearer <your_jwt_token>
```

**Response:**
```json
{
  "message": "Welcome to your dashboard, user@example.com!",
  "user": {
    "id": "1234567890",
    "email": "user@example.com",
    "role": "guest"
  }
}
```

### Projects Routes (`/api/projects`)

#### Get all projects (Public)
```http
GET /api/projects
```

**Response:**
```json
[
  {
    "id": "1234567890",
    "title": "My Project",
    "description": "Project description",
    "technologies": ["React", "Node.js"],
    "image": "url_to_image",
    "link": "https://project.com",
    "github": "https://github.com/user/repo",
    "createdBy": "admin@example.com",
    "createdAt": "2025-10-23T10:00:00.000Z"
  }
]
```

#### Get single project (Public)
```http
GET /api/projects/:id
```

#### Create a project (Admin only)
```http
POST /api/projects
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "title": "New Project",
  "description": "A great project",
  "technologies": ["React", "TypeScript"],
  "image": "https://example.com/image.png",
  "link": "https://project.com",
  "github": "https://github.com/user/repo"
}
```

**Response:**
```json
{
  "message": "Project created successfully",
  "project": {
    "id": "1234567890",
    "title": "New Project",
    "description": "A great project",
    "technologies": ["React", "TypeScript"],
    "image": "https://example.com/image.png",
    "link": "https://project.com",
    "github": "https://github.com/user/repo",
    "createdBy": "admin@example.com",
    "createdAt": "2025-10-23T10:00:00.000Z"
  }
}
```

## 🔐 User Roles

- **guest**: Can only read data (GET requests)
- **admin**: Can read and create projects (GET and POST requests)

## 🧪 Testing the API

You can test the API using:

1. **Postman** - Import the endpoints and test
2. **VS Code REST Client** - Create `.http` files
3. **curl** - Command line testing
4. **Browser fetch/axios** - Frontend integration

### Example curl commands:

Register a user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User","role":"admin"}'
```

Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Get projects:
```bash
curl http://localhost:5000/api/projects
```

Create project (replace YOUR_TOKEN):
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test Project","description":"A test","technologies":["React"]}'
```

## 📁 Project Structure

```
backend/
├── controllers/        # Request handlers
│   ├── authController.js
│   └── projectController.js
├── middleware/         # Custom middleware
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── models/            # Data models
│   ├── userModel.js
│   └── projectModel.js
├── routes/            # Route definitions
│   ├── authRoutes.js
│   └── projectRoutes.js
├── utils/             # Utility functions
│   └── tokenUtils.js
├── config/            # Configuration
│   └── serverConfig.js
├── data/              # Data storage (JSON files)
│   └── projects.json
├── .env.example       # Environment variables example
├── .gitignore
├── package.json
├── server.js          # Entry point
└── README.md
```

## 🔒 Security Notes

- Passwords are hashed using bcryptjs (10 salt rounds)
- JWT tokens expire after 24 hours
- Change `JWT_SECRET` in production to a strong, random string
- User data is stored in memory (use a database in production)
- Projects are stored in JSON file (use a database in production)

## 🎯 Future Improvements

- Database integration (MongoDB/PostgreSQL)
- Input validation with express-validator
- Rate limiting
- Refresh tokens
- Email verification
- Password reset functionality
- File upload for project images
- Pagination for projects list
- Search and filter functionality

## 📝 License

MIT

