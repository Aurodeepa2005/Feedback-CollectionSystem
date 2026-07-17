# 📝 Feedback Collection System

A full-stack Feedback Collection System built using the MERN stack that enables students to submit feedback, faculty to manage responses, and administrators to oversee the entire feedback process through a secure and user-friendly platform.

## 🌐 Live Demo

**Frontend:** https://feedback-collection-system-seven.vercel.app/

**Backend API:** https://feedback-collectionsystem.onrender.com

---

## 📂 GitHub Repository

https://github.com/Aurodeepa2005/Feedback-CollectionSystem

---

## ✨ Features

- 🔐 Secure user authentication using JWT
- 👥 Role-based access control (Student, Faculty, Admin)
- 📝 Student feedback submission
- 👨‍🏫 Faculty feedback management
- 🛠️ Admin dashboard for system management
- 🔄 RESTful API architecture
- ☁️ MongoDB Atlas cloud database integration
- 📱 Responsive user interface
- 🔒 Secure password hashing
- ⚡ Error handling and validation

---

## 💻 Tech Stack

### 🎨 Frontend
- React.js
- Vite
- React Router
- Axios
- CSS

### ⚙️ Backend
- Node.js
- Express.js
- JWT Authentication
- bcrypt.js
- Mongoose

### 🗄️ Database
- MongoDB Atlas

### 🚀 Deployment
- Vercel (Frontend)
- Render (Backend)

---

## 📁 Project Structure

```text
Feedback-CollectionSystem
│
├── frontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── vite.config.js
│
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── utils
│   │   └── server.js
│   │
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## 🚀 Installation

### 📥 Clone the Repository

```bash
git clone https://github.com/Aurodeepa2005/Feedback-CollectionSystem.git

cd Feedback-CollectionSystem
```

### ⚙️ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

Run the backend:

```bash
npm run dev
```

### 🎨 Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Run the frontend:

```bash
npm run dev
```

---

## 🔗 API Endpoints

### 🔑 Authentication

```
POST /api/auth/register
POST /api/auth/login
```

### 👤 Users

```
GET /api/users
```

### 🎓 Student

```
GET /api/student
POST /api/student
```

### 👨‍🏫 Faculty

```
GET /api/faculty
POST /api/faculty
```

### 🛡️ Admin

```
GET /api/admin
POST /api/admin
```

---

## ☁️ Deployment

- 🌐 **Frontend:** Vercel
- ⚙️ **Backend:** Render
- 🗄️ **Database:** MongoDB Atlas

---

## 🔮 Future Enhancements

- 📧 Email notifications
- 🔑 Forgot Password functionality
- 🔐 Google OAuth Login
- 📊 Dashboard Analytics
- 📄 Export feedback as PDF/Excel
- 🔍 Search & Filter
- 🌙 Dark Mode
- 🔔 Real-time notifications

---

## 👨‍💻 Team

This project was developed collaboratively by:

| Name | Role |
|------|------|
| **Aurodeepa Senapati** | Backend Developer |
| **Ankush Chaudhary** | Backend Developer |
| **Mohanapriya V** | Frontend Developer |
| **Viswakpranav M** | Frontend Developer |
| **Nishchitha K M** | Frontend Developer |

---

## 📄 License

This project is developed for educational purposes.
