const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const errorMiddleware = require("./middleware/errorMiddleware");

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const studentRoutes = require("./routes/studentRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Load Environment Variables
dotenv.config();

// Create Express App
const app = express();

// Apply Middlewares
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "http://localhost:3000",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Uploads Directory
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Healthcheck Route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is healthy and running" });
});

// Map Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/admin", adminRoutes);

// Root redirect or default route
app.get("/", (req, res) => {
  res.send("FeedbackHub API is running. Point your client to /api/auth/login or /api/health");
});

// Error handling middleware
app.use(errorMiddleware);

// Seeding logic
const seedDatabase = async () => {
  try {
    const User = require("./models/User");
    const Course = require("./models/Course");
    const Form = require("./models/Form");
    const Response = require("./models/Response");
    const Submission = require("./models/Submission");

    const usersCount = await User.countDocuments();
    if (usersCount === 0) {
      console.log("Database is empty. Seeding initial development data...");

      // 1. Create Admins
      const admin = await User.create({
        name: "Dr. Susan Blake (Admin)",
        email: "admin@uni.edu",
        password: "password123",
        role: "admin",
        department: "Computer Science",
        status: "active"
      });

      // 2. Create Faculty
      const faculty = await User.create({
        name: "Dr. Sarah Mitchell",
        email: "faculty@uni.edu",
        password: "password123",
        role: "faculty",
        department: "Computer Science",
        status: "active"
      });

      const faculty2 = await User.create({
        name: "Prof. James Nguyen",
        email: "faculty2@uni.edu",
        password: "password123",
        role: "faculty",
        department: "Mathematics",
        status: "active"
      });

      // 3. Create Student
      const student = await User.create({
        name: "Aisha Patel",
        email: "student@uni.edu",
        password: "password123",
        role: "student",
        studentId: "S10024",
        department: "Computer Science",
        status: "active"
      });

      const student2 = await User.create({
        name: "Carlos Romero",
        email: "student2@uni.edu",
        password: "password123",
        role: "student",
        studentId: "S10025",
        department: "Computer Science",
        status: "active"
      });

      // 4. Create Courses
      const c1 = await Course.create({
        code: "CS301",
        name: "Data Structures & Algorithms",
        department: "Computer Science",
        facultyId: faculty._id,
        semester: "Fall 2026",
        status: "active"
      });

      const c2 = await Course.create({
        code: "CS401",
        name: "Operating Systems",
        department: "Computer Science",
        facultyId: faculty._id,
        semester: "Fall 2026",
        status: "active"
      });

      const c3 = await Course.create({
        code: "MA201",
        name: "Calculus II",
        department: "Mathematics",
        facultyId: faculty2._id,
        semester: "Fall 2026",
        status: "active"
      });

      // 5. Create Forms
      const f1 = await Form.create({
        title: "End-of-Semester Feedback",
        courseId: c1._id,
        deadline: new Date(Date.now() + 86400000 * 7), // 7 days from now
        status: "active"
      });

      const f2 = await Form.create({
        title: "Course Experience Survey",
        courseId: c2._id,
        deadline: new Date(Date.now() - 86400000 * 2), // Expired 2 days ago
        status: "active"
      });

      const f3 = await Form.create({
        title: "Mid-Term Evaluation",
        courseId: c3._id,
        deadline: new Date(Date.now() + 86400000 * 14), // 14 days from now
        status: "active"
      });

      // 6. Seed Responses for Course 1 (CS301)
      await Response.create([
        {
          formId: f1._id,
          overallRating: 5,
          teachingRating: 5,
          contentRating: 5,
          recommendation: "Yes",
          comment: "Dr. Sarah Mitchell is an amazing instructor. The DSA visual animations helped a lot!",
          submittedAt: new Date(Date.now() - 86400000 * 3)
        },
        {
          formId: f1._id,
          overallRating: 4,
          teachingRating: 4,
          contentRating: 5,
          recommendation: "Yes",
          comment: "Course content is very comprehensive, but homework assignments were a bit hard.",
          submittedAt: new Date(Date.now() - 86400000 * 2)
        },
        {
          formId: f1._id,
          overallRating: 5,
          teachingRating: 5,
          contentRating: 4,
          recommendation: "Yes",
          comment: "Great experience. Loved the labs.",
          submittedAt: new Date(Date.now() - 86400000)
        }
      ]);

      // 7. Seed responses for Course 2 (CS401 - OS) - Expired/Completed
      const responseList2 = await Response.create([
        {
          formId: f2._id,
          overallRating: 4,
          teachingRating: 3,
          contentRating: 4,
          recommendation: "Yes",
          comment: "Pacing was a bit too fast in CPU scheduling, but overall a decent course.",
          submittedAt: new Date(Date.now() - 86400000 * 5)
        },
        {
          formId: f2._id,
          overallRating: 3,
          teachingRating: 3,
          contentRating: 3,
          recommendation: "No",
          comment: "Hard to follow the lectures. Need more concrete coding examples rather than theory.",
          submittedAt: new Date(Date.now() - 86400000 * 4)
        }
      ]);

      // Seed Student 2 submission to Form 2 (so they have history)
      await Submission.create({
        studentId: student2._id,
        formId: f2._id,
        rating: 4,
        submittedAt: new Date(Date.now() - 86400000 * 5)
      });

      console.log("Database seeded successfully with default test data!");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Start Server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  seedDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
});
