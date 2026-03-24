const express = require("express");
const controller = require("../controllers/verticalsController");
const { requireApiKey } = require("../middlewares/auth");

const router = express.Router();

router.get("/", controller.listVerticals);
router.get("/:id", controller.getVertical);
router.get("/:id/home", controller.getVerticalHome);
router.get("/:id/industry", controller.getVerticalIndustry);
router.get("/:id/consumer", controller.getVerticalConsumer);
router.patch("/:id/home", requireApiKey, controller.patchVerticalHome);

module.exports = router;
