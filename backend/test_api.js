const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:3001/api/appointments', {
      patientName: "Test User",
      email: "test@test.com",
      phone: "1234567890",
      doctor: "Dr. Test",
      specialty: "General",
      appointmentType: "Consultation",
      date: "2026-10-10",
      time: "10:00",
      reasonForVisit: "Checkup"
    }, {
      headers: {
        // Need a valid token. Since I wiped the DB, I need to create a user, log in, and get a token.
      }
    });
    console.log(res.data);
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
test();
