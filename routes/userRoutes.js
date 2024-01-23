const express = require("express");
const router = express.Router();
const rateLimiter = require("express-rate-limit");

// limit upload :
const uploadLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

const { updateUser, updatePassword } = require("../controllers/userController");
const {
  uploadProfilePicture,
  uploadCoverPicture,
} = require("../controllers/uploadController");

router.route("/update-user").patch(updateUser);
router.route("/update-password").patch(updatePassword);
router
  .route("/upload-profile-picture")
  .post(uploadLimiter, uploadProfilePicture);
router.route("/upload-cover-picture").post(uploadLimiter, uploadCoverPicture);

module.exports = router;
