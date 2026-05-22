let conversationHistory = [
  { role: "system", content: "You are a helpful mental health assistant. Provide empathetic and supportive responses to users seeking mental health support." }
];

module.exports = {
  getHistory: () => conversationHistory,
  addMessage: (message) => {
    conversationHistory.push(message);
  },
  trimHistory: (limit) => {
    if (conversationHistory.length > limit) {
      conversationHistory = [
        conversationHistory[0],
        ...conversationHistory.slice(-(limit - 1))
      ];
    }
  }
};
