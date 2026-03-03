// Run with: node scripts/debugAnalytics.js
// Set MONGODB_URI in your .env or environment

require('dotenv').config();
const mongoose = require('mongoose');
const DailyDepartmentReport = require('../models/DailyDepartmentReport');
const Showroom = require('../models/Showroom');
const Department = require('../models/Department');

async function debug() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  // 1. Check departments
  const depts = await Department.find({}).lean();
  console.log('=== DEPARTMENTS ===');
  depts.forEach(d => console.log(`  ${d.code} => ${d.name} (${d._id})`));

  // 2. Check showrooms
  const showrooms = await Showroom.find({}).lean();
  console.log(`\n=== SHOWROOMS (${showrooms.length}) ===`);
  showrooms.slice(0, 5).forEach(s => console.log(`  ${s.name} => code=${s.code}, dept=${s.department}, id=${s._id}`));
  if (showrooms.length > 5) console.log(`  ... and ${showrooms.length - 5} more`);

  // 3. Check recent reports
  const now = new Date();
  const curStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const totalReports = await DailyDepartmentReport.countDocuments({});
  const thisMonthReports = await DailyDepartmentReport.countDocuments({
    reportDate: { $gte: curStart }
  });
  console.log(`\n=== REPORTS ===`);
  console.log(`  Total reports in DB: ${totalReports}`);
  console.log(`  This month reports: ${thisMonthReports}`);

  // 4. Check tracking reports with showroomId
  const trackingReports = await DailyDepartmentReport.countDocuments({
    tracking: { $exists: true },
    reportDate: { $gte: curStart }
  });
  const trackingWithShowroom = await DailyDepartmentReport.countDocuments({
    tracking: { $exists: true },
    showroomId: { $ne: null },
    reportDate: { $gte: curStart }
  });
  console.log(`  Tracking reports this month: ${trackingReports}`);
  console.log(`  Tracking reports with showroomId: ${trackingWithShowroom}`);

  // 5. Check GOV reports
  const govDept = depts.find(d => d.code === 'GOV');
  if (govDept) {
    const govReports = await DailyDepartmentReport.countDocuments({
      departmentId: govDept._id,
      reportDate: { $gte: curStart }
    });
    console.log(`  GOV reports this month: ${govReports}`);

    // Check if speedGovernor.nebsam has data
    const nebsamData = await DailyDepartmentReport.findOne({
      departmentId: govDept._id,
      'speedGovernor.nebsam': { $exists: true },
      reportDate: { $gte: curStart }
    }).lean();

    if (nebsamData) {
      console.log(`  Sample Nebsam data:`, JSON.stringify(nebsamData.speedGovernor?.nebsam, null, 2));
    } else {
      console.log(`  ⚠️  NO Nebsam speed governor data found this month!`);
    }
  } else {
    console.log(`  ⚠️  GOV department not found!`);
  }

  // 6. Sample a tracking report
  const sampleTrack = await DailyDepartmentReport.findOne({
    tracking: { $exists: true },
    reportDate: { $gte: curStart }
  }).lean();

  if (sampleTrack) {
    console.log(`\n=== SAMPLE TRACKING REPORT ===`);
    console.log(`  showroomId: ${sampleTrack.showroomId} (type: ${typeof sampleTrack.showroomId})`);
    console.log(`  tracking:`, JSON.stringify(sampleTrack.tracking, null, 2));
  } else {
    console.log(`\n  ⚠️  NO tracking reports found this month!`);
  }

  await mongoose.disconnect();
  console.log('\nDone.');
}

debug().catch(err => {
  console.error(err);
  process.exit(1);
});