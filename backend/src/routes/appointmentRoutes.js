const express = require("express");
const appointmentController = require("../controllers/appointmentController");

const router = express.Router();

router.get("/", appointmentController.listAppointments);
router.get("/:id", appointmentController.getAppointment);
router.post("/", appointmentController.createAppointment);
router.patch("/:id", appointmentController.updateAppointment);
router.patch("/:id/cancel", appointmentController.cancelAppointment);
router.delete("/:id", appointmentController.deleteAppointment);

module.exports = router;
