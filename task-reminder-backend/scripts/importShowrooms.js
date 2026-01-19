/**
 * One-off script to bulk-insert showrooms from a local JSON file.
 *
 * Usage:
 * 1. Create a JSON file, e.g. showrooms.json, in the same folder:
 *    [
 *      { "name": "Mombasa Road" },
 *      { "name": "Industrial Area" },
 *      { "name": "Westlands" }
 *    ]
 *
 * 2. Ensure you have a TRACK department in your DB:
 *    { name: "Tracking", code: "TRACK", ... }
 *
 * 3. Set MONGODB_URI and (optionally) JSON_PATH env vars, e.g.:
 *    MONGODB_URI="mongodb+srv://user:pass@cluster/dbname"
 *    JSON_PATH="./showrooms.json"
 *
 * 4. Run:
 *    node scripts/importShowrooms.js
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Showroom = require('../models/Showroom');
const Department = require('../models/Department');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nebsam-task-reminder';
const JSON_PATH = process.env.JSON_PATH || path.join(__dirname, 'showrooms.json');

// Generate a showroom code from a name, e.g. "Mombasa Road" -> "MOMBASA_ROAD"
function generateCodeFromName(name) {
  return name
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/g, '');
}

async function main() {
  console.log('--- NEBSAM Showroom Import ---');
  console.log('Mongo URI:', MONGODB_URI);
  console.log('JSON file:', JSON_PATH);

  if (!fs.existsSync(JSON_PATH)) {
    console.error('JSON file not found at', JSON_PATH);
    process.exit(1);
  }

  const raw = fs.readFileSync(JSON_PATH, 'utf8');
  let entries;
  try {
    entries = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse JSON file:', err.message);
    process.exit(1);
  }

  if (!Array.isArray(entries) || entries.length === 0) {
    console.error('JSON file must contain a non-empty array of objects with at least a "name" field.');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Ensure TRACK department exists
  const trackingDept = await Department.findOne({ code: 'TRACK' }).select('_id name code');
  if (!trackingDept) {
    console.error('ERROR: Department with code "TRACK" not found. Please create it first.');
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log('Using Tracking department:', trackingDept.name, trackingDept._id.toString());

  let created = 0;
  let skipped = 0;

  for (const entry of entries) {
    if (!entry || !entry.name || typeof entry.name !== 'string') {
      console.warn('Skipping invalid entry (missing name):', entry);
      skipped += 1;
      continue;
    }

    const name = entry.name.trim();
    if (!name) {
      console.warn('Skipping entry with empty name:', entry);
      skipped += 1;
      continue;
    }

    const code = entry.code
      ? entry.code.trim()
      : generateCodeFromName(name);

    if (!code) {
      console.warn('Skipping entry with empty generated code:', entry);
      skipped += 1;
      continue;
    }

    // Check if code already exists
    const existing = await Showroom.findOne({ code });
    if (existing) {
      console.log(`Skipping existing showroom: name="${name}", code="${code}"`);
      skipped += 1;
      continue;
    }

    try {
      const showroom = await Showroom.create({
        name,
        code,
        department: trackingDept._id,
        isActive: true,
      });
      console.log(`Created showroom: "${showroom.name}" (code=${showroom.code})`);
      created += 1;
    } catch (err) {
      console.error(`Failed to create showroom for name="${name}", code="${code}":`, err.message);
      skipped += 1;
    }
  }

  console.log('--- Import complete ---');
  console.log('Created:', created);
  console.log('Skipped:', skipped);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Fatal error in import script:', err);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});