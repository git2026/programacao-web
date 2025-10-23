# Developer Portfolio - Full-Stack Application

Modern developer portfolio with React frontend and Node.js backend featuring JWT authentication and role-based authorization.

## 🚀 Quick Start

**Frontend:**
```bash
npm install
npm start          # Visit http://localhost:5173
```

**Backend:**
```bash
cd backend
npm install
npm run dev        # API runs on http://localhost:5000
```

## 📁 Structure

```
├── backend/          # Express API (Exercise 2)
│   ├── controllers/  # Auth & Projects handlers
│   ├── middleware/   # JWT auth & role verification
│   ├── models/       # User & Project models
│   ├── routes/       # API routes
│   ├── server.js     # Entry point
│   └── README.md     # Detailed API docs
├── src/              # React frontend (Exercise 1)
│   ├── components/   # Header, Footer, ThemeToggle
│   ├── sections/     # About, Projects, Skills
│   ├── data/         # Typed data (profile, projects)
│   └── styles/       # CSS Modules
└── public/           # Static assets
```

## Frontend (Exercise 1)

**Tech:** React 18 + TypeScript + Vite + React Router + CSS Modules

**Features:**
- Responsive layout with dark/light theme toggle
- Three main sections: About, Projects, Skills
- React Router with active navigation states
- Typed data models and CSS Modules for styling

**Scripts:**
- `npm start` - Dev server
- `npm run build` - Production build
- `npm run preview` - Preview build

## Backend (Exercise 2)

**Tech:** Express + JWT + bcrypt + CORS

**Features:**
- User registration/login with JWT (24h expiration)
- Role-based access: `admin` and `guest`
- Password hashing with bcrypt
- Projects API with public GET and admin-only POST
- Protected dashboard route

**Setup:**
```bash
cd backend
npm install
copy .env.example .env    # Configure PORT and JWT_SECRET
npm run dev
```

## API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login (get JWT) |
| GET | `/api/auth/dashboard` | Protected | User dashboard |
| GET | `/api/projects` | Public | List projects |
| GET | `/api/projects/:id` | Public | Get project |
| POST | `/api/projects` | Admin | Create project |

**Example - Register:**
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "secure123",
  "name": "Admin User",
  "role": "admin"
}
```

**Example - Create Project (Admin):**
```bash
POST http://localhost:5000/api/projects
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "title": "My Project",
  "description": "Project description",
  "technologies": ["React", "Node.js"]
}
```

See `backend/README.md` for complete API documentation.

## Testing

Use Postman, VS Code REST Client, curl, or browser fetch/axios to test endpoints.

## Personalization

**Frontend:** Update `src/data/profile.ts` and `src/data/projects.ts`, replace images in `public/assets/`

**Backend:** Change `JWT_SECRET` in `.env` to a strong random value

## Security Notes

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens expire after 24h
- User data in memory (use DB in production)
- Projects in JSON file (use DB in production)

## Deployment

**Frontend:** `npm run build` → Deploy `dist/` to Vercel/Netlify

**Backend:** Deploy to Heroku/Railway/Render (set env variables)

## License

MIT
