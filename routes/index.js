const express = require("express");
const router = express.Router();

const { authenticateUser } = require("../middleware/auth");

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");

router.use("/auth", authRoutes);
router.use("/user", authenticateUser, userRoutes);

module.exports = router;
