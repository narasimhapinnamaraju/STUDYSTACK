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

async function testSubjectInsert() {
  const { error } = await supabase.from('subjects').insert({
    name: "dlco", // duplicate from before!
    category: "Syllabus",
    course: "CSE-AI",
    regulation: "R23",
    semester: "2-1",
    syllabus: "<p>Test Test</p>"
  });
  console.log('Result for duplicate subject insert:', error ? error.message : "Success (maybe duplicates allowed)");
}

testSubjectInsert();
