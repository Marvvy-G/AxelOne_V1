const router = require("express").Router();
const adsController = require("./../controllers/adsControllers");
const userController = require("./../controllers/userController");

router.route("/startad").post(userController.protect , adsController.startNewAd);
router.route("/ads").get(adsController.getAdsByLocation);
router.route("/:adId/click").get(adsController.click);
router.route("/ad-stats/:adId").get(userController.protect, adsController.stats)
router.route("/admin/dashboard").get(userController.protect, adsController.admin)
router.route("/ads/:id").patch(userController.protect, adsController.updateAd);
router.route("/ads/:id/pause").patch(userController.protect, adsController.pauseAd);
router.route("/ads/:id").delete(userController.protect, adsController.deleteAd);

module.exports = router;