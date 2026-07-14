# FeedbackHub API Backend

This is the Express-based REST API server for FeedbackHub, utilizing Mongoose to connect to MongoDB Atlas.

## Tech Stack
- **Node.js**
- **Express.js** (Server Framework)
- **MongoDB Atlas** & **Mongoose** (Database & ODM)
- **JSON Web Tokens (JWT)** (Secure token authentication)
- **Bcrypt.js** (Password encryption hashing)
- **Nodemailer** (Mail reset credentials)

## Folder Structure
```text
backend/
├── src/
│   ├── config/       ← DB connection
│   ├── controllers/  ← Controllers for handling route operations
│   ├── middleware/   ← Auth validators, error handlers
│   ├── models/       ← Mongoose Schemas (User, Course, Form, Submission, Response)
│   ├── routes/       ← Routing logic (auth, user, student, faculty, admin)
│   └── server.js     ← Entry point
├── uploads/          ← Static storage folder
├── .env              ← Secrets & database configurations
└── package.json      ← Service dependencies
```

## Setup & Run

1. Navigate to this directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update the `.env` file with your MongoDB connection string:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_signing_secret
   ```
4. Start development mode (with hot reloading via Nodemon):
   ```bash
   npm run dev
   ```
5. Run production build:
   ```bash
   npm start
   ```
