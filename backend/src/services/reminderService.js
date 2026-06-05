const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const sendAppointmentEmail = require('../utils/sendAppointmentEmail');
const sendSMS = require('../utils/sendSMS');

const prisma = new PrismaClient();

const startReminderService = () => {
  // Run every hour to check for upcoming appointments
  cron.schedule('0 * * * *', async () => {
    console.log('Running appointment reminder cron job...');
    
    const now = new Date();
    // Look for appointments exactly 24 hours from now (within the current hour)
    const tomorrowStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    tomorrowStart.setMinutes(0, 0, 0);
    const tomorrowEnd = new Date(tomorrowStart.getTime() + 60 * 60 * 1000);

    try {
      const upcomingAppointments = await prisma.appointment.findMany({
        where: {
          status: 'CONFIRMED',
          reminderSent: false,
        }
      });

      for (const apt of upcomingAppointments) {
        // Parse date and time
        const aptDate = new Date(apt.date);
        const [hours, minutes] = apt.time.split(':');
        aptDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // Check if appointment is between tomorrowStart and tomorrowEnd
        if (aptDate >= tomorrowStart && aptDate < tomorrowEnd) {
          console.log(`Sending reminder for appointment ID: ${apt.id}`);
          
          // Send SMS Reminder
          if (apt.phone) {
            const smsMessage = `MediRAG Reminder: Your appointment with ${apt.doctor} is tomorrow at ${apt.time}.`;
            await sendSMS(apt.phone, smsMessage);
          }

          // Send Email Reminder (using existing confirmation email, but ideally a specific reminder template)
          if (apt.email) {
            // We reuse the existing function or send a specialized one. 
            // Here we just use the existing one to confirm it's coming up.
            await sendAppointmentEmail(apt); 
          }

          // Mark as sent
          await prisma.appointment.update({
            where: { id: apt.id },
            data: { reminderSent: true }
          });
        }
      }
    } catch (error) {
      console.error('Error in reminder cron job:', error);
    }
  });

  console.log('Reminder service initialized.');
};

module.exports = startReminderService;
