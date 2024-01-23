const CustomErr = require("../errors");
const { User } = require("../models/User");
const {
  uploadFileToVirusTotal,
  getVirusTotalReport,
  reportContainsViruses,
} = require("./virusCheck");
const cloudinary = require("cloudinary").v2;

async function uploader(req, res, fieldToUpdate) {
  try {
    if (!req.files) {
      throw new CustomErr.BadRequestError("No file uploaded");
    }

    const file = req.files.image; // input name field should be image
    if (!file.mimetype.startsWith("image")) {
      throw new CustomErr.BadRequestError("please upload image");
    }
    const maxSize = 1024 * 1024 * 5;
    if (file.size > maxSize) {
      throw new CustomErr.BadRequestError("please upload image smaller 1MB");
    }

    const fileId = await uploadFileToVirusTotal(file.tempFilePath);
    const report = await getVirusTotalReport(fileId);
    if (reportContainsViruses(report)) {
      throw new CustomErr.BadRequestError("File is infected!");
    }
    const result = await cloudinary.uploader.upload(file.tempFilePath);
    const update = {};
    update[fieldToUpdate] = result.secure_url;

    const user = await User.findByIdAndUpdate(req.user.userId, update, {
      new: true,
    });
    res.status(200).json({ [fieldToUpdate]: user[fieldToUpdate] });
  } catch (error) {
    res.status(500).json({ msg: "Error during file upload" });
  }
}

module.exports = uploader;
