const router = require("express").Router();
const { registerController, verifyController , loginController} = require("../controller/userController");

// register user
// access : public
router.post("/api/user/register", registerController);


// verify user after register
// access : public
router.post("/api/user/verify", verifyController)


// Login user
// access : public
router.post("/api/user/login", loginController)

module.exports = router;
