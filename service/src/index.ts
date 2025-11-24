import dotenv from 'dotenv';
import app from './app';
import { runMigrations } from './db/migrate';

dotenv.config();

// Initialize database
try {
  runMigrations();
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 MMA Service running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});
