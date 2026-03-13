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

async function testConnection() {
  console.log('Testing Supabase Connection...');
  
  // 1. Fetch subjects
  console.log('Fetching subjects...');
  const { data: subjects, error: subjErr } = await supabase.from('subjects').select('*').limit(1);
  if (subjErr) console.error('Subject fetch error:', subjErr);
  else console.log('Subjects config looks good:', subjects);

  // 2. Fetch regulations
  console.log('Fetching regulations...');
  const { data: regs, error: regsErr } = await supabase.from('regulations').select('*');
  if (regsErr) console.error('Regulations fetch error:', regsErr);
  else console.log('Regulations found:', regs);

  // 3. Trying an upload of a small file to test storage
  console.log('Testing storage upload...');
  const testFileName = `test_${Date.now()}.txt`;
  const { data: uploadData, error: uploadErr } = await supabase.storage.from('academic-files').upload(testFileName, "Hello World", {
    contentType: 'text/plain'
  });
  if (uploadErr) console.error('Storage Upload Error:', uploadErr.message);
  else {
    console.log('Storage upload successful:', uploadData);
    await supabase.storage.from('academic-files').remove([testFileName]);
  }
}

testConnection();
