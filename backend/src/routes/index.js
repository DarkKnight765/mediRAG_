const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const authRoutes = require("./authRoutes");
const testRoutes = require("./testRoutes");
const chatRoutes = require("./chatRoutes");
const appointmentRoutes = require("./appointmentRoutes");
const healthPlanRoutes = require("./healthPlanRoutes");
const imageAnalysisRoutes = require("./imageAnalysisRoutes");
const modelRoutes = require("./modelRoutes");
const userRoutes = require("./userRoutes");
const doctorDiscoveryRoutes = require("./doctorDiscoveryRoutes");
const slotRoutes = require("./slotRoutes");

// Public routes
router.use("/auth", authRoutes);
router.use("/", testRoutes);
router.use("/model", modelRoutes);
router.use("/doctors", doctorDiscoveryRoutes);

// Protected routes
router.use("/user", authMiddleware, userRoutes);
router.use("/", authMiddleware, chatRoutes);
router.use("/", authMiddleware, healthPlanRoutes);
router.use("/", authMiddleware, imageAnalysisRoutes);
router.use("/appointments", authMiddleware, appointmentRoutes);
router.use("/slots", authMiddleware, slotRoutes);

// Symptom analysis (protected — uses AI service)
router.post("/symptoms/analyze", authMiddleware, require("../controllers/symptomAnalysisController").analyzeSymptoms);

module.exports = router;
