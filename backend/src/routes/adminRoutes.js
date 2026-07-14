const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// All admin routes require logging in and being an administrator
router.use(authMiddleware, roleMiddleware("admin"));

// Dashboard Stats
router.get("/dashboard", adminController.getDashboard);

// User Management CRUD
router.get("/users", adminController.getUsers);
router.post("/users", adminController.createUser);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);
router.patch("/users/:id/status", adminController.toggleUserStatus);

// Faculty Management
router.get("/faculty", adminController.getFaculty);
router.post("/faculty", adminController.createUser); // reuse createUser logic
router.put("/faculty/:id", adminController.updateUser); // reuse updateUser logic
router.delete("/faculty/:id", adminController.deleteUser); // reuse deleteUser logic

// Course Management CRUD
router.get("/courses", adminController.getCourses);
router.post("/courses", adminController.createCourse);
router.put("/courses/:id", adminController.updateCourse);
router.delete("/courses/:id", adminController.deleteCourse);

// Feedback Form Management CRUD
router.get("/forms", adminController.getForms);
router.post("/forms", adminController.createForm);
router.put("/forms/:id", adminController.updateForm);
router.delete("/forms/:id", adminController.deleteForm);
router.patch("/forms/:id/publish", adminController.publishForm);

// View Responses
router.get("/responses", adminController.getResponses);

// System Analytics
router.get("/analytics", adminController.getAnalytics);

module.exports = router;
