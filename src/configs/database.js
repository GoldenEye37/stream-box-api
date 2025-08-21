const { PrismaClient } = require('@prisma/client');

let prisma;

// Production-optimized Prisma Client configuration
const createPrismaClient = () => {
  return new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event', 
        level: 'error',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// Singleton pattern for database connection
const getDatabaseInstance = () => {
  if (!prisma) {
    prisma = createPrismaClient();

    prisma.$on('query', (e) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Query: ' + e.query);
        console.log('Duration: ' + e.duration + 'ms');
      }
    });

    prisma.$on('error', (e) => {
      console.error('Database error:', e);
    });

    prisma.$on('warn', (e) => {
      console.warn('Database warning:', e);
    });

    process.on('beforeExit', async () => {
      console.log('Disconnecting from database...');
      await prisma.$disconnect();
    });
  }

  return prisma;
};

const checkDatabaseConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

module.exports = {
  prisma: getDatabaseInstance(),
  checkDatabaseConnection,
};