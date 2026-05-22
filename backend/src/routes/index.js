const express = require("express");
const router = express.Router();

const testRoutes = require("./testRoutes");
const chatRoutes = require("./chatRoutes");
const appointmentRoutes = require("./appointmentRoutes");
const healthPlanRoutes = require("./healthPlanRoutes");
const imageAnalysisRoutes = require("./imageAnalysisRoutes");

router.use("/", testRoutes);
router.use("/", chatRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/", healthPlanRoutes);
router.use("/", imageAnalysisRoutes);

module.exports = router;
