const userModel = require("../models/userSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
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
    console.log(error);
  }
};

const loginUser = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req?.body?.email });

    if (!user) {
      return res.send({
        success: false,
        message: "User does not exist. Please register",
      });
    }

    // compare both password and it returns a boolean if both are same or different
    const validatePassword = await bcrypt.compare(req?.body?.password, user?.password);
    if (!validatePassword) {
      return res.send({
        success: false,
        message: "Please enter valid password",
      });
    }

    // as soon as validated password, send a token
    const token = jwt.sign({userId: user._id}, process.env.SECRET_KEY, {
      expiresIn: "1d"
    });

    res.send({
      success: true,
      message: "You've Successfully Logged In",
      data: token
    });
  } catch (error) {
    console.log(error);
  }
};

const currentUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId).select('-password');
    res.send({
      success: true,
      message: "User Details Fetched Successfully",
      data: user,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  registerUser,
  loginUser,
  currentUser
};
