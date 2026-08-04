import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Read from the environment — never commit the connection string (ADR 0001).
    url: process.env.DATABASE_URL!,
  },
});
