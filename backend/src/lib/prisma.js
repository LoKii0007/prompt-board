import 'dotenv/config';
import { PrismaClient } from '../../generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from '../config/index.js';

// Create Prisma adapter with connection string
const adapter = new PrismaPg({
  connectionString: config.database.url,
});

// Initialize Prisma Client with adapter
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
