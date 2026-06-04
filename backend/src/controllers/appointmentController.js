const db = require("../config/db");

exports.listAppointments = async (req, res) => {
  try {
    const appointments = await db.appointment.findMany({
      where: { userId: req.user.id },
      orderBy: { date: "desc" },
    });
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const { date, time, doctor, appointmentType, reason, symptoms, medicalHistory } = req.body;

    const newAppointment = await db.appointment.create({
      data: {
        userId: req.user.id,
        clinician: doctor,
        visitType: appointmentType,
        date: new Date(date),
        time: time,
        reason: reason || null,
        symptoms: symptoms || null,
        history: medicalHistory || null,
        status: "scheduled",
      },
    });

    res.status(201).json(newAppointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ error: "Failed to schedule appointment" });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.appointment.update({
      where: { id: parseInt(id) },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ error: "Failed to update appointment" });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    await db.appointment.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ error: "Failed to delete appointment" });
  }
};
