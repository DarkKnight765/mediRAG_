const { randomUUID } = require("crypto");

let appointments = [];

exports.listAppointments = (req, res) => {
  res.json(appointments);
};

exports.createAppointment = (req, res) => {
  const newAppointment = {
    id: randomUUID(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };

  appointments.push(newAppointment);
  res.status(201).json(newAppointment);
};

exports.updateAppointment = (req, res) => {
  const { id } = req.params;
  const appointmentIndex = appointments.findIndex(
    (appointment) => appointment.id === id,
  );

  if (appointmentIndex === -1) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  appointments[appointmentIndex] = {
    ...appointments[appointmentIndex],
    ...req.body,
  };

  return res.json(appointments[appointmentIndex]);
};

exports.deleteAppointment = (req, res) => {
  const { id } = req.params;
  const initialLength = appointments.length;
  appointments = appointments.filter((appointment) => appointment.id !== id);

  if (appointments.length === initialLength) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  return res.json({ message: "Appointment deleted successfully" });
};
