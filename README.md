# 🔐 SecureReport - Incident Reporting System

A highly secure cybersecurity Incident Reporting System built with the MERN stack, featuring advanced dashboards, real-time notifications, role-based access control (RBAC), and comprehensive audit logging.

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-Based Access Control (User, Admin, Super Admin)
- Secure password hashing with bcrypt

### User Dashboard
- View own incidents in table format
- Expandable rows to view full description and evidence files
- Search, sort (by date/priority), and filter incidents
- Real-time notifications for incident updates
- Report incidents with evidence upload
- Download evidence files

### Admin Dashboard
- Analytics widgets (Total, Open, Resolved incidents)
- Pie chart (Open vs Resolved)
- Bar chart (Categories)
- Average resolution time
- Expandable incident rows with full details
- View descriptions and download evidence files
- Advanced filtering (status, category, priority)
- Bulk actions (mark as resolved)
- Assign incidents to specific admins
- Export incidents to CSV
- Real-time incident updates

### Super Admin Dashboard
- User management (add, edit, delete, block users)
- Role assignment
- Audit logs with filtering
- Complete system oversight

### Security Features
- Password hashing, JWT tokens, Rate limiting
- Helmet.js security headers, File upload validation
- Audit trail for all actions with IP tracking

### Real-time Features
- Socket.io integration for live notifications
- Real-time dashboard updates

## 📁 Project Structure

```
SharkStriker/
├── backend/
│   ├── config/db.js
│   ├── controllers/ (auth, incident, user, audit)
│   ├── middleware/ (auth, auditLogger)
│   ├── models/ (User, Incident, AuditLog)
│   ├── routes/ (auth, incident, user, audit)
│   ├── utils/ (fileUpload, generateToken, seedData)
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/ (Navbar, Dashboards, Forms, Tables)
    │   ├── context/ (AuthContext)
    │   ├── pages/ (Login, Register, Dashboard, UserManagement, AuditLogs)
    │   ├── services/ (api, socket)
    │   └── App.jsx
    └── vite.config.js
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### Quick Start

**1. Backend Setup**
```bash
cd backend
npm install
# Create .env file (see .env.example)
npm run dev
```

**2. Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

**3. Create Test Users**
```bash
cd backend
node utils/seedData.js
```

### Environment Variables (.env)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/incident_reporting_system
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### MongoDB Atlas Setup (Optional)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster (M0)
3. Create database user
4. Whitelist IP (0.0.0.0/0 for development)
5. Get connection string and update MONGODB_URI

## 🎯 Usage

### Test Credentials (after seed script)
| Role | Email | Password |
|------|-------|----------|
| User | user@test.com | user123 |
| Admin | admin@test.com | admin123 |
| Super Admin | superadmin@test.com | super123 |

### User Roles & Permissions

**User**: Report incidents, view own incidents, search/filter, receive notifications

**Admin**: All user permissions + view all incidents, update status, bulk actions, analytics dashboard, audit logs

**Super Admin**: All admin permissions + manage users, assign roles, block users, delete incidents

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Incidents
- `POST /api/incidents` - Create (with file upload)
- `GET /api/incidents` - Get all (role-based)
- `GET /api/incidents/:id` - Get one
- `PUT /api/incidents/:id` - Update (Admin+)
- `DELETE /api/incidents/:id` - Delete (Super Admin)
- `POST /api/incidents/bulk-update` - Bulk update (Admin+)
- `GET /api/incidents/analytics` - Analytics (Admin+)

### Users (Super Admin)
- `GET /api/users` - Get all
- `PUT /api/users/:id` - Update
- `DELETE /api/users/:id` - Delete

### Audit Logs (Admin+)
- `GET /api/audit` - Get logs

## 📊 Technologies

**Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt, Socket.io, Multer, Helmet, Express Rate Limit

**Frontend**: React 18, Vite, React Router, Axios, Socket.io Client, Tailwind CSS, Recharts, React Hot Toast, Lucide React

## 🔒 Security

- JWT authentication with refresh tokens
- Password hashing (bcrypt, 12 rounds)
- Rate limiting (1000 req/15min)
- CORS configuration
- Helmet.js security headers
- Input validation
- File upload restrictions (5MB, specific types)
- Audit logging with IP tracking

## 🚀 Deployment

**Backend**: Render/Railway/Heroku
**Frontend**: Vercel/Netlify
**Database**: MongoDB Atlas

## 📝 License

MIT License

---

**Created for cybersecurity incident management and reporting.**
