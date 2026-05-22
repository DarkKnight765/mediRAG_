const { PrismaClient } = require("@prisma/client");
// Initialize PrismaClient; allow overriding the datasource URL via env for runtime configuration.
const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
});

module.exports = prisma;
