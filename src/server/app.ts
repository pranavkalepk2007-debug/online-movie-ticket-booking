import fs from 'fs';
import path from 'path';
import { startApp } from 'modelence/server';
import exampleModule from '@/server/example';
import moviesModule from '@/server/movies';
import { createDemoUser } from '@/server/migrations/createDemoUser';
import { seedMovies } from '@/server/migrations/seedMovies';

// Automatically provide a persistent local MongoDB instance if MONGODB_URI is not set
if (!process.env.MONGODB_URI) {
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const dbPath = path.resolve(process.cwd(), '.mongodb-data');
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }
    const mongod = await MongoMemoryServer.create({
      instance: {
        dbPath,
        storageEngine: 'wiredTiger',
      },
    });
    process.env.MONGODB_URI = mongod.getUri() + 'movietickets';
    console.log('Persistent MongoDB initialized at:', process.env.MONGODB_URI, '(dbPath:', dbPath, ')');
  } catch (err) {
    console.warn('Could not initialize persistent MongoDB, falling back:', err);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      process.env.MONGODB_URI = mongod.getUri() + 'movietickets';
    } catch (e) {
      console.error('Fatal MongoDB error:', e);
    }
  }
}

startApp({
  modules: [exampleModule, moviesModule],

  security: {
    frameAncestors: ['https://modelence.com', 'https://*.modelence.com', 'http://localhost:*'],
  },

  migrations: [
    {
      version: 1,
      description: 'Create demo user',
      handler: createDemoUser,
    },
    {
      version: 2,
      description: 'Seed movies and showtimes',
      handler: seedMovies,
    },
    {
      version: 3,
      description: 'Seed extended movie recommendations',
      handler: seedMovies,
    },
    {
      version: 4,
      description: 'Add Mirzapur and The Love Hypothesis',
      handler: seedMovies,
    },
    {
      version: 5,
      description: 'Update posters and add latest blockbusters',
      handler: seedMovies,
    },
    {
      version: 6,
      description: 'Sync local poster assets for all movies',
      handler: seedMovies,
    },
  ],
});

// Automatically open browser once application is up and running
const appUrl = 'http://localhost:3000';
console.log(`\n🚀 Opening application at ${appUrl}...\n`);
try {
  const { exec } = await import('child_process');
  const openCmd = process.platform === 'win32'
    ? `start "" "${appUrl}"`
    : process.platform === 'darwin'
    ? `open "${appUrl}"`
    : `xdg-open "${appUrl}"`;
  exec(openCmd);
} catch (e) {
  // Silent fallback
}

