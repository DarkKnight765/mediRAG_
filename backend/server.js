const app = require('./src/app');
const env = require('./src/config/env');
const startReminderService = require('./src/services/reminderService');

// Start cron job for appointment reminders
startReminderService();

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});
