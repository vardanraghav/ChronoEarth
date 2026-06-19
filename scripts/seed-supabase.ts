import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { citiesRawData } from '../src/data/citiesData';

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

// 2. Resolve URL and Key (with cleanup support)
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
if (supabaseUrl.endsWith('/rest/v1/')) {
  supabaseUrl = supabaseUrl.slice(0, -9);
} else if (supabaseUrl.endsWith('/rest/v1')) {
  supabaseUrl = supabaseUrl.slice(0, -8);
}

// Use Service Role Key if available to bypass RLS, otherwise fallback to Anon Key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or Key missing in .env.local');
  process.exit(1);
}

console.log('Supabase Seeder initialising...');
console.log(`URL: ${supabaseUrl}`);
console.log(`Key Mode: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Service Role (RLS Bypassed)' : 'Anon Key (RLS Active)'}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  try {
    // 3. Fetch existing cities to skip duplicates
    console.log('Fetching existing cities from Supabase...');
    const { data: existing, error: fetchErr } = await supabase
      .from('cities')
      .select('name');

    if (fetchErr) {
      console.error('Error querying existing cities:', fetchErr.message);
      if (fetchErr.message.includes('RLS') || fetchErr.code === '42501') {
        console.error('\n[RLS ERROR]: Read permission denied. Ensure RLS read policy is enabled:');
        console.error('CREATE POLICY "Allow public read access" ON public.cities FOR SELECT USING (true);\n');
      }
      process.exit(1);
    }

    const existingNames = new Set((existing || []).map((c: any) => c.name.toLowerCase()));
    console.log(`Found ${existingNames.size} existing cities in the database.`);

    // 4. Filter citiesRawData to skip duplicates
    const newCities = citiesRawData
      .filter((city) => !existingNames.has(city.name.toLowerCase()))
      .map((city) => ({
        name: city.name,
        country: city.country,
        lat: city.lat,
        lon: city.lon,
        year: city.year,
        offsets: city.offsets, // Preserves JSON offsets field
        details: city.details  // Preserves JSON details field
      }));

    if (newCities.length === 0) {
      console.log('No new cities to insert. Database is already up to date!');
      return;
    }

    console.log(`Preparing to insert ${newCities.length} new cities...`);

    // 5. Batch insert new cities
    const { data, error: insertErr } = await supabase
      .from('cities')
      .insert(newCities)
      .select();

    if (insertErr) {
      console.error('Error inserting cities:', insertErr.message);
      if (insertErr.code === '42501' || insertErr.message.includes('security policy')) {
        console.error('\n[RLS ERROR]: Insert permission denied. To seed the database, apply this policy in Supabase SQL Editor:');
        console.error('CREATE POLICY "Allow public insert for seeder" ON public.cities FOR INSERT WITH CHECK (true);\n');
      } else if (insertErr.message.includes('column') || insertErr.message.includes('schema cache')) {
        console.error('\n[SCHEMA ERROR]: Missing columns in Supabase. Please run this SQL in your Supabase SQL Editor to add them:');
        console.error('ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS year integer;');
        console.error('ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS offsets jsonb;');
        console.error('ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS details jsonb;\n');
      }
      process.exit(1);
    }

    console.log(`Success! Inserted ${data ? data.length : newCities.length} rows into 'cities' table.`);
  } catch (err) {
    console.error('Seeder exception occurred:', err);
    process.exit(1);
  }
}

seed();
