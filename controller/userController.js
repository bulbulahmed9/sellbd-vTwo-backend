const asyncHandler = require("express-async-handler");
const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils");

const registerController = asyncHandler(async (req, res) => {
  // destructure fields
  const { name, email, password, phone } = req.body;

  // get user
  let user = await User.findOne({ email });

  // check user exists, we have to also check if it is verified user.
  if (user && user.isVerified) {
    return res.status(200).json({
      message: "User already exists",
    });
  }

  // generate code
  const code = Math.floor(100000 + Math.random() * 900000);

  // make hashcode
  const salt = await bcrypt.genSalt(10);
  let hashCode = await bcrypt.hash(code.toString(), salt);

  // check if user has already been registered, and not verified, then  send the code to user email address.
  if (user && !user.isVerified) {
    // send code to user email address
    await sendEmail(code, email);

    // save hashcode to db
    user.verificationCode = hashCode;
    await user.save();

   return res.status(201).json({
      email: user.email,
      message:
        "You are already registered, check your email for new verification code",
    });
  }

  // make new user instance
  user = new User({
    name,
    email,
    password,
    phone,
    verificationCode: code,
  });

  // send code to user email address
  await sendEmail(code, email);

  // make hash password
  user.password = await bcrypt.hash(password, salt);
  user.verificationCode = hashCode;

  // save user to db
  await user.save();

  res.status(201).json({
    email,
    message: "Please check your email and verify your account",
  });
});

module.exports = { registerController };
