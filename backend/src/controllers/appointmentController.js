const db = require("../config/db");
const sendAppointmentEmail = require("../utils/sendAppointmentEmail");
const sendAppointmentSMS = require("../utils/sendSMS");
const sendAppointmentWhatsApp = require("../utils/sendWhatsApp");

// Valid status values (enforced at the application layer since SQLite has no enums)
const VALID_STATUSES = ["SCHEDULED", "CONFIRMED", "PENDING", "CANCELLED", "IN_PROGRESS", "COMPLETED"];

exports.listAppointments = async (req, res) => {
  try {
    const appointments = await db.appointment.findMany({
      where: { userId: req.user.id },
      orderBy: { date: "desc" },
    });
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ success: false, message: "Failed to fetch appointments" });
  }
};

exports.getAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await db.appointment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Ownership check
    if (appointment.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    res.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ success: false, message: "Failed to fetch appointment" });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const {
      patientName,
      email,
      phone,
      doctor,
      specialty,
      appointmentType,
      date,
      time,
      reasonForVisit,
      symptoms,
      medicalHistory,
      location,
      address,
      latitude,
      longitude,
      consultationFee,
      consultationMode,
    } = req.body;

    // Validate required fields
    if (
      !patientName ||
      !email ||
      !phone ||
      !doctor ||
      !specialty ||
      !appointmentType ||
      !date ||
      !time ||
      !reasonForVisit
    ) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newAppointment = await db.appointment.create({
      data: {
        userId: req.user.id,
        patientName,
        email,
        phone,
        doctor,
        specialty,
        appointmentType,
        date: new Date(date),
        time,
        reasonForVisit,
        symptoms: symptoms || null,
        medicalHistory: medicalHistory || null,
        location: location || null,
        address: address || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        consultationFee: consultationFee || null,
        consultationMode: consultationMode || "IN_PERSON",
        status: "SCHEDULED",
      },
    });

    // Send confirmations asynchronously (fire-and-forget)
    sendAppointmentEmail(newAppointment).catch(console.error);
    sendAppointmentSMS(phone, newAppointment).catch(console.error);
    sendAppointmentWhatsApp(phone, newAppointment).catch(console.error);

    res.status(201).json(newAppointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ success: false, message: "Failed to schedule appointment" });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existing = await db.appointment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Only allow safe fields to be updated
    const allowedFields = [
      "patientName",
      "email",
      "phone",
      "doctor",
      "specialty",
      "appointmentType",
      "date",
      "time",
      "reasonForVisit",
      "symptoms",
      "medicalHistory",
      "status",
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === "date") {
          updateData[field] = new Date(req.body[field]);
        } else if (field === "status") {
          if (!VALID_STATUSES.includes(req.body[field])) {
            return res.status(400).json({
              success: false,
              message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
            });
          }
          updateData[field] = req.body[field];
        } else {
          updateData[field] = req.body[field];
        }
      }
    }

    const updated = await db.appointment.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ success: false, message: "Failed to update appointment" });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existing = await db.appointment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (existing.status === "CANCELLED") {
      return res.status(400).json({ success: false, message: "Appointment is already cancelled" });
    }

    const cancelled = await db.appointment.update({
      where: { id: parseInt(id) },
      data: { status: "CANCELLED" },
    });

    res.json(cancelled);
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ success: false, message: "Failed to cancel appointment" });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existing = await db.appointment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    await db.appointment.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ success: false, message: "Failed to delete appointment" });
  }
};

/**
 * GET /api/appointments/:id/ics
 * Generate and return an ICS calendar file for an appointment.
 */
exports.getAppointmentICS = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await db.appointment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!appointment || appointment.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    const startDate = new Date(appointment.date);
    const [hours, minutes] = appointment.time.split(":");
    startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000); // 30 min duration

    const formatICSDate = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//MediRAG//Appointment//EN",
      "BEGIN:VEVENT",
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:Appointment with ${appointment.doctor}`,
      `DESCRIPTION:${appointment.appointmentType} - ${appointment.reasonForVisit}`,
      appointment.address ? `LOCATION:${appointment.address}` : `LOCATION:${appointment.location || "Clinic"}`,
      `UID:medirag-${appointment.id}@medirag.com`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=appointment-${appointment.id}.ics`);
    res.send(ics);
  } catch (error) {
    console.error("Error generating ICS:", error);
    res.status(500).json({ success: false, message: "Failed to generate calendar file" });
  }
};

