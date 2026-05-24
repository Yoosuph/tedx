// scripts/migrate-gallery-to-cloudinary.js
//
// One-time migration: uploads existing local gallery images to Cloudinary
// and outputs SQL statements to update Supabase database records.
//
// Usage:
//   node scripts/migrate-gallery-to-cloudinary.js
//
// Zero external dependencies — uses Node 18+ native fetch + FormData.
//
// The script is idempotent: it saves results to a JSON file, so re-running
// won't re-upload already-migrated images.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');

function loadEnv(path) {
  const content = readFileSync(path, 'utf-8');
  const vars = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const eqIdx = trimmed.indexOf('=');
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    vars[key] = val;
  }
  return vars;
}

const env = loadEnv(envPath);

const CLOUD_NAME    = env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = env.VITE_CLOUDINARY_UPLOAD_PRESET;
const FOLDER        = 'tedxdutse/gallery';

if (!CLOUD_NAME)    throw new Error('Missing VITE_CLOUDINARY_CLOUD_NAME in .env.local');
if (!UPLOAD_PRESET) throw new Error('Missing VITE_CLOUDINARY_UPLOAD_PRESET in .env.local');

const RESULT_FILE = resolve(__dirname, '..', 'scripts', 'migration-results.json');
const SQL_FILE    = resolve(__dirname, '..', 'scripts', 'migration-updates.sql');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Upload a local file to Cloudinary via unsigned upload.
 */
async function uploadToCloudinary(filePath, fileName) {
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const buffer = readFileSync(filePath);
  const blob = new Blob([buffer], { type: 'image/jpeg' });

  const form = new FormData();
  form.append('file', blob, fileName);
  form.append('upload_preset', UPLOAD_PRESET);
  form.append('folder', FOLDER);

  const response = await fetch(endpoint, { method: 'POST', body: form });

  if (!response.ok) {
    let detail = '';
    try { const err = await response.json(); detail = err.error?.message || JSON.stringify(err); }
    catch { /* ignore */ }
    throw new Error(`Cloudinary upload failed (HTTP ${response.status}): ${detail}`);
  }

  return await response.json();
}

// ---------------------------------------------------------------------------
// Gallery image definitions (from siteData.js)
// ---------------------------------------------------------------------------

const GALLERY_IMAGES = [
  { id: 1,  file: 'TEDxD-1.jpg',  alt: 'TEDxDutse event',    orientation: 'landscape' },
  { id: 2,  file: 'TEDxD-2.jpg',  alt: 'TEDxDutse speaker',  orientation: 'portrait' },
  { id: 3,  file: 'TEDxD-3.jpg',  alt: 'TEDxDutse speaker',  orientation: 'portrait' },
  { id: 4,  file: 'TEDxD-4.jpg',  alt: 'TEDxDutse speaker',  orientation: 'portrait' },
  { id: 5,  file: 'TEDxD-5.jpg',  alt: 'TEDxDutse event',    orientation: 'landscape' },
  { id: 6,  file: 'TEDxD-6.jpg',  alt: 'TEDxDutse event',    orientation: 'landscape' },
  { id: 7,  file: 'TEDxD-7.jpg',  alt: 'TEDxDutse speaker',  orientation: 'portrait' },
  { id: 8,  file: 'TEDxD-8.jpg',  alt: 'TEDxDutse speaker',  orientation: 'portrait' },
  { id: 9,  file: 'TEDxD-9.jpg',  alt: 'TEDxDutse event',    orientation: 'landscape' },
  { id: 10, file: 'TEDxD-10.jpg', alt: 'TEDxDutse event',    orientation: 'landscape' },
  { id: 11, file: 'TEDxD-11.jpg', alt: 'TEDxDutse event',    orientation: 'landscape' },
  { id: 12, file: 'TEDxD-12.jpg', alt: 'TEDxDutse event',    orientation: 'landscape' },
  { id: 13, file: 'TEDxD-13.jpg', alt: 'TEDxDutse speaker',  orientation: 'portrait' },
  { id: 14, file: 'TEDxD-14.jpg', alt: 'TEDxDutse speaker',  orientation: 'portrait' },
  { id: 15, file: 'TEDxD-15.jpg', alt: 'TEDxDutse event',    orientation: 'landscape' },
  { id: 16, file: 'TEDxD-16.jpg', alt: 'TEDxDutse event',    orientation: 'landscape' },
];

const GALLERY_DIR = resolve(__dirname, '..', 'public', 'images', 'gallery');

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║  Gallery Migration → Cloudinary          ║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');

  // Load previous results if they exist (for idempotency)
  let previousResults = [];
  if (existsSync(RESULT_FILE)) {
    try {
      previousResults = JSON.parse(readFileSync(RESULT_FILE, 'utf-8'));
      console.log(`  📋 Found ${previousResults.length} previous upload results. Skipping those.\n`);
    } catch { /* ignore */ }
  }

  const alreadyUploaded = new Set(previousResults.map(r => r.id));

  const results = [...previousResults];
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of GALLERY_IMAGES) {
    if (alreadyUploaded.has(item.id)) {
      console.log(`  ⏩ [${item.id}] ${item.file} — already uploaded, skipping`);
      skipped++;
      continue;
    }

    const filePath = resolve(GALLERY_DIR, item.file);

    if (!existsSync(filePath)) {
      console.warn(`  ⚠️  [${item.id}] File not found: ${filePath} — skipping`);
      skipped++;
      continue;
    }

    try {
      console.log(`  📤 [${item.id}] Uploading ${item.file}...`);

      const result = await uploadToCloudinary(filePath, item.file);

      const entry = {
        id: item.id,
        file: item.file,
        alt: item.alt,
        orientation: item.orientation,
        secure_url: result.secure_url,
        public_id: result.public_id,
        resource_type: 'image',
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      };

      results.push(entry);
      console.log(`  ✅ [${item.id}] Uploaded: ${result.public_id} (${result.width}x${result.height}, ${(result.bytes / 1024).toFixed(0)} KB)`);
      uploaded++;
    } catch (err) {
      console.error(`  ❌ [${item.id}] Failed: ${err.message}`);
      failed++;
    }

    // Save results after each upload (in case the script is interrupted)
    writeFileSync(RESULT_FILE, JSON.stringify(results, null, 2));
    await sleep(600);
  }

  // Generate SQL
  const sqlLines = [
    '-- ============================================================',
    '-- Gallery Migration to Cloudinary - UPDATE statements',
    '-- Generated by scripts/migrate-gallery-to-cloudinary.js',
    '-- Run this in Supabase Dashboard > SQL Editor',
    '-- ============================================================',
    '',
  ];

  for (const r of results) {
    sqlLines.push(`UPDATE gallery_images`);
    sqlLines.push(`SET`);
    sqlLines.push(`  src          = '${r.secure_url}',`);
    sqlLines.push(`  public_id    = '${r.public_id}',`);
    sqlLines.push(`  resource_type = '${r.resource_type}',`);
    sqlLines.push(`  format       = '${r.format}',`);
    sqlLines.push(`  width        = ${r.width},`);
    sqlLines.push(`  height       = ${r.height},`);
    sqlLines.push(`  bytes        = ${r.bytes}`);
    sqlLines.push(`WHERE id = ${r.id};`);
    sqlLines.push('');
  }

  // Add verification query
  sqlLines.push('-- Verify the migration');
  sqlLines.push('SELECT id, src, public_id, format, width, height, bytes');
  sqlLines.push('FROM gallery_images');
  sqlLines.push('WHERE public_id IS NOT NULL');
  sqlLines.push('ORDER BY id;');

  writeFileSync(SQL_FILE, sqlLines.join('\n'));

  // Summary
  console.log('');
  console.log('  ────────────────────────────────────────────');
  console.log(`  📊 Results:  ${uploaded} uploaded  |  ${skipped} skipped  |  ${failed} failed`);
  console.log('  ────────────────────────────────────────────');
  console.log('');
  console.log(`  💾 Results saved to: scripts/migration-results.json`);
  console.log(`  📝 SQL saved to:     scripts/migration-updates.sql`);
  console.log('');

  if (failed === 0) {
    console.log('  🎉 All images uploaded!');
    console.log('  → Run the SQL in Supabase Dashboard to update the database.\n');
  } else {
    console.log('  ⚠️  Some uploads failed. Re-run the script to retry.');
    console.log('     (Already-uploaded images are tracked in migration-results.json)\n');
  }
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
