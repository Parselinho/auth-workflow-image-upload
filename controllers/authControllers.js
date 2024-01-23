const { User, userValidation, loginValidation } = require("../models/User");
const Token = require("../models/Token");
const CustomErr = require("../errors");
const {
  attachCookiesToResponse,
  createTokenUser,
  createHash,
} = require("../utils");
const EmailService = require("../services/EmailService");
const crypto = require("crypto");

const register = async (req, res) => {
  const { email, firstName, lastName, password } = req.body;
  const { error } = userValidation.validate(req.body);
  if (error) throw new CustomErr.BadRequestError(error.details[0].message);

  const isEmailExists = await User.findOne({ email });
  if (isEmailExists) {
    throw new CustomErr.BadRequestError("email already exist");
  }

  const verificationToken = crypto.randomBytes(40).toString("hex");

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    verificationToken,
  });
  // const origin = "http://localhost:3000"; // change to req.get('origin') or req.get('host')

  await EmailService.sendVerificationEmail({
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    verificationToken: user.verificationToken,
  });

  res
    .status(201)
    .json({ msg: `Success! Please check your email to verify account` });
};

const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomErr.UnauthenticatedError("Verification Failed");
  }
  if (user.verificationToken !== verificationToken) {
    throw new CustomErr.UnauthenticatedError("Verification Failed");
  }
  (user.isVerified = true), (user.verified = Date.now());
  user.verificationToken = "";

  await user.save();

  res.status(200).json({ msg: `Email Verified for ${email}` });
};

const login = async (req, res) => {
  const { error } = loginValidation.validate(req.body);
  if (error) {
    throw new CustomErr.BadRequestError(error.details[0].message);
  }
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomErr.UnauthenticatedError("Invalid Credentials");
  }
  const isPassCorrect = await user.comparePassword(password);
  if (!isPassCorrect) {
    throw new CustomErr.UnauthenticatedError("Invalid Credentials");
  }
  if (!user.isVerified) {
    throw new CustomErr.UnauthenticatedError("Please verify your email");
  }
  const tokenUser = createTokenUser(user);
  let refreshToken = "";
  const existingToken = await Token.findOne({ user: user._id });
  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new CustomErr.UnauthenticatedError("Invalid Credentials");
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    res.status(200).json({ user: tokenUser });
    return;
  }

  refreshToken = crypto.randomBytes(40).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: user._id };
  await Token.create(userToken);
  attachCookiesToResponse({ res, user: tokenUser, refreshToken });
  res.status(200).json({ user: tokenUser });
};

const logout = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.userId });

  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  console.log("logout");
  res.status(200).json({ msg: "User logged out!" });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomErr.BadRequestError("Please provide valid email");
  }
  const user = await User.findOne({ email });
  if (user) {
    const passwordToken = crypto.randomBytes(70).toString("hex");

    await EmailService.sendResetPasswordEmail(
      { name: `${user.firstName} ${user.lastName}`, email: user.email },
      passwordToken
    );
    const expiration = 1000 * 60 * 15;
    const passwordTokenExpirationDate = new Date(Date.now() + expiration);

    user.passwordToken = createHash(passwordToken);
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    await user.save();
  }
  console.log(user.passwordToken);
  res
    .status(200)
    .json({ msg: `Please check your email for reset your password` });
};

const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;
  if (!token || !email || !password) {
    throw new CustomError.BadRequestError("Please provide all values");
  }
  const user = await User.findOne({ email });
  if (user) {
    const currentDate = new Date();

    if (
      user.passwordToken === createHash(token) &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
      console.log("Password updated in database");
    }
  }

  res.send("reset password");
};

module.exports = {
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
};
