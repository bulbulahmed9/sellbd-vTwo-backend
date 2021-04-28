const User = require("../model/userModel");
9;
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");
const { registerSchema, verifySchema, loginSchema } = require("../validator");

const registerController = async (req, res) => {
  // destructure fields
  const { name, email, password, phone } = req.body;

  // validation
  await registerSchema.validateAsync(req.body);

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
};

const verifyController = async (req, res) => {
  // validation
  await verifySchema.validateAsync(req.body);

  // destructure fields
  const { email, code } = req.body;

  // get user
  let user = await User.findOne({ email: email });

  // check if not user
  if (!user) return res.status(404).json({ message: "User not found" });

  // destructure name and phone number from user
  const { name, phone } = user;

  // if already verified user
  if (user.isVerified) {
    return res.status(200).json({ message: "You are already verified" });
  }

  // check if match code
  const isMatch = await bcrypt.compare(code.toString(), user.verificationCode);

  if (!isMatch) {
    return res.status(406).json({
      message: "Invalid Code",
    });
  }

  // if everything pass , then make this user verified
  user.isVerified = true;
  await user.save();

  const payload = {
    user: {
      id: user.id,
    },
  };

  const token = jwt.sign(
    {
      payload,
    },
    process.env.jwtSecret,
    { expiresIn: "7d" }
  );

  res.status(200).json({ email, name, phone, token });
};

const loginController = async (req, res) => {
  // validation
  await loginSchema.validateAsync(req.body);

  // destructure fields
  let { email, password } = req.body;

  // get user and check if user exists
  let user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      message: "Invalid credentials",
    });
  }
  // check if user verified or not
  if (!user.isVerified) {
    return res.status(406).json({
      message: "You are not verified user",
    });
  }

  // check if match password
  const isMatchPasswod = await bcrypt.compare(password, user.password);

  if (!isMatchPasswod) {
    return res.json({
      msg: "Invalid credentials",
    });
  }

  // generate token
  const payload = {
    user: {
      id: user.id,
    },
  };
  const token = jwt.sign(
    {
      payload,
    },
    process.env.jwtSecret,
    { expiresIn: "7d" }
  );

  res.status(200).json({
    email,
    name: user.name,
    phone,
    token,
  });

};

module.exports = { registerController, verifyController, loginController };
