const { User } = require("../models/User");
const CustomErr = require("../errors");
const { createTokenUser, attachCookiesToResponse } = require("../utils");

const updateUser = async (req, res) => {
  const { email, firstName, lastName } = req.body;
  if (!email || !firstName || !lastName) {
    throw new CustomErr.BadRequestError("please provide all values");
  }
  const user = await User.findOne({ _id: req.user.userId });
  user.email = email;
  user.firstName = firstName;
  user.lastName = lastName;

  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(200).json({ user: tokenUser });
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomErr.BadRequestError("Please provide both values");
  }
  const user = await User.findOne({ _id: req.user.userId });
  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomErr.UnauthenticatedError("Invalid Credentials");
  }
  user.password = newPassword;

  await user.save();
  res.status(200).json({ msg: "Password Updated successfully" });
};

module.exports = {
  updateUser,
  updatePassword,
};
