const router = require("express").Router();
const userController = require("./../controllers/userController");

//Login$Signup Post route
router.route("/signup").post(userController.signup);
router.route("/login").post(userController.login);

//Login$Signup Get route
router.route("/signupPage").get(userController.signupPage);
router.route("/loginPage").get(userController.loginPage);

//get user timeline
router.route("/timeline/:id").get(userController.protect, userController.timeline)

//update user profile
router.route("/timeline/editProfile/:id").get(userController.protect, userController.timelineEditPage)

router.route("/timeline/editProfile/:userId").patch(userController.protect, userController.timelineEdit);

router.route("/forgotPassword").post(userController.forgotPassword);
// router.route("/resetPassword/:token").patch(userController.resetPassword);


module.exports = router;