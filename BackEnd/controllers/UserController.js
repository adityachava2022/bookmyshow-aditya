const userModel = require("../models/userSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const EmailHelper = require("../utils/emailHelper");

const registerUser = async (req, res, next) => {
  try {
    const userExists = await userModel.findOne({ email: req?.body?.email });

    if (userExists) {
      return res.send({
        success: false,
        message: "User Already Exists",
      });
    }

    // generate salt - a pseudo string
    const salt = await bcrypt.genSalt(10); // 2^10 possibilities
    // generate hash for password + salt
    const generatedHash = await bcrypt.hash(req?.body?.password, salt);
    // save password
    req.body.password = generatedHash;
    const newUser = new userModel(req?.body);
    await newUser.save();

    res.send({
      success: true,
      message: "Registration Successfull, Please Login",
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const user = await userModel.findOne({ email: req?.body?.email });

    if (!user) {
      return res.send({
        success: false,
        message: "User does not exist. Please register",
      });
    }

    // compare both password and it returns a boolean if both are same or different
    const validatePassword = await bcrypt.compare(
      req?.body?.password,
      user?.password
    );
    if (!validatePassword) {
      return res.send({
        success: false,
        message: "Please enter valid password",
      });
    }

    // as soon as validated password, send a token
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: process.env.JWT_TOKEN_EXPIRY || "1d",
    });

    res.cookie("tokenForBMS", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.send({
      success: true,
      message: "You've Successfully Logged In",
      data: token,
    });
  } catch (error) {
    next(error);
  }
};

const currentUser = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.body.userId).select("-password");
    res.send({
      success: true,
      message: "User Details Fetched Successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (email == undefined) {
      return res.status(401).json({
        status: "failure",
        message: "Please enter the email for forget Password",
      });
    }
    let user = await userModel.findOne({ email: email });
    if (user == null) {
      return res.status(404).json({
        status: false,
        message: "user not found",
      });
    } else if (user?.otp != undefined && user.otp < Date.now()) {
      return res.json({
        success: false,
        message: "Please use otp sent on mail",
      });
    }
    const otp = Math.floor(Math.random() * 10000 + 90000);
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();
    await EmailHelper("otp.html", user.email, {
      name: user.name,
      otp: otp,
    });
    res.status(200).json({
      success: true,
      message: "otp has been sent",
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { password, otp } = req.body;
    if (password == undefined || otp == undefined) {
      return res.status(401).json({
        success: false,
        message: "invalid request",
      });
    }
    const user = await userModel.findOne({ otp: otp });
    if (user == null) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }
    if (Date.now() > user.otpExpiry) {
      return res.status(401).json({
        success: false,
        message: "otp expired",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req?.body?.password, salt);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    res.status(200).json({
      success: true,
      message: "password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

const logoutUser = (req, res) => {
  try {
    res.cookie("tokenForBMS", "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  currentUser,
  forgetPassword,
  resetPassword,
  logoutUser,
};
