# FeedbackHub API Backend

This is the backend server for **FeedbackHub**, a full-stack feedback collection system built for managing and analyzing student feedback efficiently.

The backend is built using **Node.js**, **Express.js**, and **MongoDB Atlas**, providing secure authentication, role-based authorization, feedback management, and analytics APIs.

---

## 🚀 Tech Stack

- **Node.js** - JavaScript runtime environment
- **Express.js** - Backend web framework
- **MongoDB Atlas** - Cloud-hosted NoSQL database
- **Mongoose** - MongoDB Object Data Modeling (ODM)
- **JSON Web Tokens (JWT)** - Authentication and authorization
- **Bcrypt.js** - Password hashing and security
- **Nodemailer** - Password reset email functionality
- **dotenv** - Environment variable management
- **CORS** - Cross-origin resource sharing
- **Nodemon** - Development server auto-reloading

---

## 📁 Project Structure

```text
backend/
│
├── src/
│   ├── config/           # Database connection and configurations
│   ├── controllers/      # Business logic for routes
│   ├── middleware/       # Authentication, authorization and error handling
│   ├── models/           # Mongoose schemas and models
│   ├── routes/           # API route definitions
│   ├── services/         # Reusable service logic
│   ├── utils/            # Helper utilities
│   └── server.js         # Application entry point
│
├── uploads/              # Static file uploads
├── .env                  # Environment variables
├── package.json
├── package-lock.json
└── README.md
```

---

## 🔐 Features

### Authentication & Authorization
- User Registration
- User Login
- JWT Authentication
- Role-Based Access Control
- Protected Routes
- Password Hashing using Bcrypt

### User Roles
- Student
- Faculty
- Admin

### Feedback Management
- Submit Feedback
- View Submitted Feedback
- Faculty Feedback Analytics
- Dashboard Statistics
- Role-specific Access Control

### Password Recovery
- Forgot Password
- Reset Password
- Email-based Password Reset using Nodemailer

---

## ⚙️ Environment Variables

Create a `.env` file inside the backend directory and add:

```env
PORT=5000

MONGODB_URI=your_mongodb_atlas_connection_string

JWT_SECRET=your_jwt_secret_key

# Optional SMTP configuration for password reset emails
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=
```

---

## 📦 Installation

Clone the repository:

```bash
git clone <repository-url>
```

Navigate to backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

---

## ▶️ Running the Server

### Development Mode

Runs the server with automatic reload using Nodemon.

```bash
npm run dev
```

---

### Production Mode

```bash
npm start
```

---

## 🌐 API Base URL

```text
http://localhost:5000/api
```

---

## 📌 Example API Endpoints

### Authentication

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout
```

### Student

```text
GET    /api/student/profile
GET    /api/student/my-feedbacks
POST   /api/student/submit-feedback
```

### Faculty

```text
GET    /api/faculty/profile
GET    /api/faculty/feedbacks
GET    /api/faculty/analytics
```

### Admin

```text
GET    /api/admin/dashboard
GET    /api/admin/users
DELETE /api/admin/users/:id
```

---

## ☁️ Deployment

Recommended deployment stack:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

---

## 👨‍💻 Contributors

- Frontend Development
- Backend Development
- MongoDB Atlas Integration
- Authentication & API Development

---

## 📄 License

This project is developed for educational and internship purposes.
