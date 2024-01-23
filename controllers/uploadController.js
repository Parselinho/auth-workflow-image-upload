const uploader = require("../utils/uploader");

const uploadProfilePicture = async (req, res) => {
  await uploader(req, res, "profilePicture");
};

const uploadCoverPicture = async (req, res) => {
  await uploader(req, res, "coverPicture");
};

module.exports = {
  uploadProfilePicture,
  uploadCoverPicture,
};
