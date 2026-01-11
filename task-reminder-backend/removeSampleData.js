require('dotenv').config();
const mongoose = require('mongoose');
const DailyDepartmentReport = require('./models/DailyDepartmentReport');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected');
  const res = await DailyDepartmentReport.deleteMany({ notes: /SAMPLE_DATA/ });
  console.log(`Deleted ${res.deletedCount} sample reports`);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });