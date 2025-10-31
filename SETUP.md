# ⚡ Quick Setup Guide

## 1. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/incident_reporting_system
JWT_SECRET=your_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Start backend:
```bash
npm run dev
```

## 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 3. Create Test Users
```bash
cd backend
node utils/seedData.js
```

## Test Credentials
- **User**: user@test.com / user123
- **Admin**: admin@test.com / admin123
- **Super Admin**: superadmin@test.com / super123

## URLs
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## MongoDB Atlas (Optional)
1. Create account: https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Whitelist IP: 0.0.0.0/0
5. Get connection string
6. Update MONGODB_URI in .env

---

**That's it! You're ready to go! 🚀**
