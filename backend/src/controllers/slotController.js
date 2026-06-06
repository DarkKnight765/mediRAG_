const db = require("../config/db");

/**
 * Generate available time slots for a given doctor and date.
 * Excludes slots that are already booked.
 */
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctor, date } = req.query;

    if (!doctor || !date) {
      return res.status(400).json({ success: false, message: "Doctor and date are required" });
    }

    // Generate all possible 30-minute slots from 9:00 AM to 5:00 PM
    const allSlots = [];
    for (let hour = 9; hour < 17; hour++) {
      allSlots.push(`${String(hour).padStart(2, "0")}:00`);
      allSlots.push(`${String(hour).padStart(2, "0")}:30`);
    }

    // Find already booked slots for this doctor on this date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await db.appointment.findMany({
      where: {
        doctor: { contains: doctor },
        date: { gte: startOfDay, lte: endOfDay },
        status: { not: "CANCELLED" },
      },
      select: { time: true },
    });

    const bookedTimes = new Set(bookedAppointments.map(a => a.time));

    const slots = allSlots.map(time => ({
      time,
      displayTime: formatTime(time),
      available: !bookedTimes.has(time),
    }));

    res.json(slots);
  } catch (error) {
    console.error("Error fetching slots:", error);
    res.status(500).json({ success: false, message: "Failed to fetch available slots" });
  }
};

function formatTime(time24) {
  const [h, m] = time24.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${m} ${ampm}`;
}
