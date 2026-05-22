const { PrismaClient } = require('@prisma/client');
const env = require('./env');

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL
});

module.exports = prisma;
