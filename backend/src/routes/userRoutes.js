const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// All user routes are authenticated
router.use(authMiddleware);

router.get("/me", userController.getMe);
router.put("/me", userController.updateMe);

module.exports = router;
