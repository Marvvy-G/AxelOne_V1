const router = require("express").Router();
const userController = require("./../controllers/userController");

//Login$Signup Post route
router.route("/signup").post(userController.signup);
router.route("/login").post(userController.login);

//Login$Signup Get route
router.route("/signupPage").get(userController.signupPage);
router.route("/loginPage").get(userController.loginPage);

module.exports = router;