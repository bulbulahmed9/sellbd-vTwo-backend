const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { registerController } = require("../controller/userController");
const { validateUser } = require("../middleware/userValidator");

// register user
// access : public
router.post("/api/user/register", validateUser, registerController);

module.exports = router;
