const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// All student routes require logging in and being a student
router.use(authMiddleware, roleMiddleware("student"));

router.get("/forms", studentController.getForms);
router.post("/forms/:formId/submit", studentController.submitFeedback);
router.get("/my-feedback", studentController.getMyFeedback);

module.exports = router;
