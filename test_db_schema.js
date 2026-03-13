import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '.env');
const envStr = fs.readFileSync(envPath, 'utf8');

let url = '', key = '';
envStr.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});

const supabase = createClient(url, key);

async function testSchema() {
  console.log('Testing Files Schema...');
  
  // Try to insert an invalid record to see the error, or select to see column names
  const { data, error } = await supabase.from('files').select('*').limit(1);
  if (error) {
     console.error("Select error:", error);
  } else {
     console.log("Columns:", data.length > 0 ? Object.keys(data[0]) : "No data");
  }
}

testSchema();
