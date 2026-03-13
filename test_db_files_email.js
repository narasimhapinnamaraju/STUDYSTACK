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

async function testFilesInsert() {
  const { data: subject } = await supabase.from('subjects').select('id').limit(1).single();
  
  const { error: dbError } = await supabase.from('files').insert({
    subject_id: subject.id,
    category: 'Assignments',
    file_name: 'test_file_insert',
    file_url: 'http://example.com/test.pdf',
    student_name: 'Test Student',
    roll_no: '123456',
    unit_no: 'Unit 1',
    uploaded_at: new Date().toISOString()
  });

  if (dbError) {
    console.error('Insert without user_email failed:', dbError.message);
  } else {
    console.log('Insert without user_email SUCCESSFUL!');
    await supabase.from('files').delete().eq('file_name', 'test_file_insert');
  }

  const { error: dbErrorEmail } = await supabase.from('files').insert({
    subject_id: subject.id,
    category: 'Assignments',
    file_name: 'test_file_insert',
    file_url: 'http://example.com/test.pdf',
    student_name: 'Test Student',
    roll_no: '123456',
    user_email: 'test@example.com',
    unit_no: 'Unit 1',
    uploaded_at: new Date().toISOString()
  });

  if (dbErrorEmail) {
    console.error('Insert WITH user_email failed:', dbErrorEmail.message);
  } else {
    console.log('Insert WITH user_email SUCCESSFUL!');
    await supabase.from('files').delete().eq('file_name', 'test_file_insert');
  }
}

testFilesInsert();
