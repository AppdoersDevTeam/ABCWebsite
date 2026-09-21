/**
 * One-off: move team_members.img data URLs into the team-images bucket.
 * Prints id -> public URL mappings. Does not log image bytes.
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadEnv() {
  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function extFromMime(mime) {
  if (mime === 'image/png') return 'png';
  if (mime === 'application/pdf') return 'pdf';
  return 'jpg';
}

loadEnv();
const url = process.env.VITE_SUPABASE_URL;
const anon = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !anon) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });

const { data, error } = await supabase
  .from('team_members')
  .select('id, img')
  .or('is_archived.eq.false,is_archived.is.null');

if (error) {
  console.error('Select failed:', error.message);
  process.exit(1);
}

const mappings = [];
for (const row of data || []) {
  const img = row.img || '';
  if (!img.startsWith('data:')) continue;
  const match = img.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    console.error('Skip unreadable data URL for', row.id);
    continue;
  }
  const mime = match[1];
  const bytes = Buffer.from(match[2], 'base64');
  const filePath = `team-images/${row.id}.${extFromMime(mime)}`;
  const { error: uploadError } = await supabase.storage.from('team-images').upload(filePath, bytes, {
    contentType: mime,
    upsert: true,
  });
  if (uploadError) {
    console.error('Upload failed', row.id, uploadError.message);
    process.exit(1);
  }
  const { data: publicData } = supabase.storage.from('team-images').getPublicUrl(filePath);
  mappings.push({ id: row.id, bytes: bytes.length, url: publicData.publicUrl });
  console.log(`uploaded ${row.id} (${bytes.length} bytes)`);
}

console.log(JSON.stringify({ count: mappings.length, mappings }, null, 2));
