const router = require("express").Router();
const adsController = require("./../controllers/adsControllers");

router.route("./startad").post(adsController.startNewAd);
router.route("./ads/:id").patch(adsController.updateAd);
router.route("./ads/:id/pause").patch(adsController.pauseAd);
router.route("./ads/:id").delete(adsController.deleteAd);

module.exports = router;