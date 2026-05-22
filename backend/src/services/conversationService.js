const prisma = require("../config/db");

async function createConversation(title) {
  return prisma.conversation.create({ data: { title } });
}

async function addMessage(conversationId, role, content) {
  return prisma.message.create({
    data: { conversationId, role, content },
  });
}

async function attachModelOutput(messageId, engine, raw) {
  return prisma.modelOutput.create({
    data: { messageId, engine, raw },
  });
}

module.exports = { createConversation, addMessage, attachModelOutput };
