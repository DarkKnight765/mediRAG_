const express = require("express");
const doctorDiscoveryController = require("../controllers/doctorDiscoveryController");

const router = express.Router();

router.get("/search", doctorDiscoveryController.searchDoctors);
router.get("/:placeId/details", doctorDiscoveryController.getDoctorDetails);

module.exports = router;
