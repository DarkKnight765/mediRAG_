const nodemailer = require("nodemailer");
const env = require("../config/env");

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpPort === 465, // true for 465, false for other ports
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass,
  },
});

async function sendAppointmentEmail(appointment) {
  try {
    if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
      console.warn("SMTP configuration is missing. Skipping email confirmation.");
      return;
    }

    const formattedDate = new Date(appointment.date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const appointmentIdStr = `MED-${new Date().getFullYear()}-${appointment.id}`;

    // Generate ICS content
    const startDate = new Date(appointment.date);
    const [hours, minutes] = appointment.time.split(":");
    startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
    
    const formatICSDate = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    
    const icsContent = [
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

    const mailOptions = {
      from: env.smtpFrom || '"MediRAG" <noreply@medirag.com>',
      to: appointment.email,
      subject: `Appointment Confirmed: ${appointment.doctor} — MediRAG`,
      html: `
        <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; color: #e2e8f0; background-color: #0d1723; padding: 40px 20px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
          <h1 style="color: #14b8a6; margin-bottom: 24px; font-size: 24px;">MediRAG Appointment Confirmed</h1>
          <div style="background-color: #1e293b; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
            <p style="margin-top: 0; color: #cbd5e1; font-size: 16px;">Hello ${appointment.patientName},</p>
            <p style="color: #94a3b8; font-size: 15px;">Your appointment has been successfully scheduled.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 24px;">
              <tr>
                <td style="padding: 10px 0; color: #94a3b8; width: 40%; border-bottom: 1px solid #334155;">Appointment ID:</td>
                <td style="padding: 10px 0; color: #f8fafc; font-weight: 600; border-bottom: 1px solid #334155;">${appointmentIdStr}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Doctor:</td>
                <td style="padding: 10px 0; color: #f8fafc; font-weight: 600; border-bottom: 1px solid #334155;">${appointment.doctor}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Specialty:</td>
                <td style="padding: 10px 0; color: #f8fafc; font-weight: 600; border-bottom: 1px solid #334155;">${appointment.specialty}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Date:</td>
                <td style="padding: 10px 0; color: #14b8a6; font-weight: 600; border-bottom: 1px solid #334155;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Time:</td>
                <td style="padding: 10px 0; color: #14b8a6; font-weight: 600; border-bottom: 1px solid #334155;">${appointment.time}</td>
              </tr>
              ${appointment.location ? `
              <tr>
                <td style="padding: 10px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Location:</td>
                <td style="padding: 10px 0; color: #f8fafc; font-weight: 600; border-bottom: 1px solid #334155;">${appointment.location}</td>
              </tr>
              ` : ''}
              ${appointment.consultationMode === "VIDEO" ? `
              <tr>
                <td style="padding: 10px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Mode:</td>
                <td style="padding: 10px 0; color: #fbbf24; font-weight: 600; border-bottom: 1px solid #334155;">Video Consultation</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 10px 0; color: #94a3b8;">Status:</td>
                <td style="padding: 10px 0; color: #10b981; font-weight: 600;">Confirmed</td>
              </tr>
            </table>
          </div>
          <p style="color: #94a3b8; font-size: 14px; text-align: center;">
            If you need to cancel or reschedule, please log in to your MediRAG dashboard.
          </p>
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #1e293b; text-align: center; color: #64748b; font-size: 13px;">
            © ${new Date().getFullYear()} MediRAG. All rights reserved.
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `appointment-${appointment.id}.ics`,
          content: icsContent,
          contentType: 'text/calendar'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Appointment confirmation email sent:", info.messageId);
  } catch (error) {
    console.error("Failed to send appointment confirmation email:", error);
  }
}

module.exports = sendAppointmentEmail;
