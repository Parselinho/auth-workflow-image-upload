const express = require("express");
const router = express.Router();

const { authenticateUser } = require("../middleware/auth");

const {
  register,
  login,
  verifyEmail,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/authControllers");

router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/logout", authenticateUser, logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
