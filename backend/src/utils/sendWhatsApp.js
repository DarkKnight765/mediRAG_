const env = require("../config/env");

/**
 * Send appointment confirmation via WhatsApp using Twilio.
 * Fails silently — never blocks the booking.
 */
async function sendAppointmentWhatsApp(phone, appointment) {
  if (!env.twilioAccountSid || !env.twilioAuthToken || !env.twilioWhatsAppFrom) {
    console.warn("Twilio WhatsApp not configured. Skipping WhatsApp notification.");
    return;
  }

  try {
    // Dynamically require twilio only when needed
    let twilio;
    try {
      twilio = require("twilio");
    } catch (e) {
      console.warn("Twilio package not installed. Run: npm install twilio");
      return;
    }

    const client = twilio(env.twilioAccountSid, env.twilioAuthToken);

    const cleanPhone = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;

    const formattedDate = new Date(appointment.date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const message = [
      "✅ *Appointment Confirmed*",
      "",
      `*Doctor:* ${appointment.doctor}`,
      `*Date:* ${formattedDate}`,
      `*Time:* ${appointment.time}`,
      appointment.location ? `*Location:* ${appointment.location}` : null,
      "",
      `*ID:* MED-${new Date().getFullYear()}-${appointment.id}`,
      "",
      "_— MediRAG_",
    ].filter(Boolean).join("\n");

    await client.messages.create({
      from: `whatsapp:${env.twilioWhatsAppFrom}`,
      to: `whatsapp:${cleanPhone}`,
      body: message,
    });

    console.log("WhatsApp message sent to:", cleanPhone);
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error.message || error);
  }
}

module.exports = sendAppointmentWhatsApp;
