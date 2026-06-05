const axios = require("axios");
const env = require("../config/env");

/**
 * Send appointment confirmation SMS via Fast2SMS (India).
 * Fails silently — never blocks the booking.
 */
async function sendAppointmentSMS(phone, appointment) {
  if (!env.fast2smsApiKey) {
    console.warn("Fast2SMS API key not configured. Skipping SMS.");
    return;
  }

  try {
    // Clean phone number — remove country code prefix if present
    const cleanPhone = phone.replace(/^\+91/, "").replace(/\D/g, "");

    const formattedDate = new Date(appointment.date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const message = `MediRAG: Your appointment with ${appointment.doctor} is confirmed. ${formattedDate} at ${appointment.time}. ID: MED-${new Date().getFullYear()}-${appointment.id}`;

    await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "q",
        message,
        language: "english",
        flash: 0,
        numbers: cleanPhone,
      },
      {
        headers: {
          authorization: env.fast2smsApiKey,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("SMS sent successfully to:", cleanPhone);
  } catch (error) {
    console.error("Failed to send SMS:", error.message || error);
  }
}

module.exports = sendAppointmentSMS;
