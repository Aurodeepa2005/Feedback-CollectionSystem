const express = require("express");
const router = express.Router();
const facultyController = require("../controllers/facultyController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// All faculty routes require logging in and being a faculty member
router.use(authMiddleware, roleMiddleware("faculty"));

router.get("/dashboard", facultyController.getDashboard);
router.get("/feedback", facultyController.getFeedback);
router.get("/analytics", facultyController.getAnalytics);

module.exports = router;
