import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

// 1. Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const cleanedLine = line.trim();
    if (!cleanedLine || cleanedLine.startsWith('#')) return;
    const eqIdx = cleanedLine.indexOf('=');
    if (eqIdx > 0) {
      const key = cleanedLine.slice(0, eqIdx).trim();
      const val = cleanedLine.slice(eqIdx + 1).trim().replace(/(^["']|["']$)/g, '');
      process.env[key] = val;
    }
  });
}

// 2. Resolve Database URL
const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || '';

if (!dbUrl) {
  console.warn('\n[WARNING]: DATABASE_URL missing in .env.local.');
  console.warn('The migration script requires direct PostgreSQL database access.');
  console.warn('Please copy the PostgreSQL connection string from Supabase (Settings -> Database -> Connection string -> URI)');
  console.warn('And execute the migration script like so:');
  console.warn('  $env:DATABASE_URL="postgresql://postgres:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"; npx tsx scripts/migrate.ts\n');
  console.warn('Alternatively, you can copy the contents of "migrations/007_auth_schema.sql" and run them in the Supabase SQL Editor on the web.\n');
  process.exit(1);
}

console.log('🔌 Connecting to PostgreSQL Database...');
const client = new Client({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false // Required for Supabase direct connections
  }
});

async function main() {
  try {
    await client.connect();
    console.log('✓ Successfully connected to database!');

    const migrationsDir = path.resolve(process.cwd(), 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.error('❌ Migrations directory does not exist.');
      process.exit(1);
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`📂 Found ${files.length} SQL migrations. Applying sequentially...`);

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      console.log(`📖 Reading migration: ${file}...`);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`⚡ Running migration queries for ${file} on Supabase database...`);
      await client.query(sql);
      console.log(`✓ Applied ${file}`);
    }

    console.log('🎉 Successfully applied database migrations!');
  } catch (err: any) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
