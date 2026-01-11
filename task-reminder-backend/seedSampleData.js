require('dotenv').config();
const mongoose = require('mongoose');

const DailyDepartmentReport = require('./models/DailyDepartmentReport');
const Department = require('./models/Department');
const Showroom = require('./models/Showroom');
const User = require('./models/User');

function utcDate(d) { const dt = new Date(d); dt.setUTCHours(0,0,0,0); return dt; }
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected for seeding');

  const user = await User.findOne();
  if (!user) throw new Error('No users found; create a user first.');
  const depts = await Department.find({ code: { $in: ['TRACK','GOV','RADIO','FUEL','VTEL','ONLINE'] } });
  const deptByCode = Object.fromEntries(depts.map(d => [d.code, d]));
  const showrooms = await Showroom.find({});

  const days = 90; // ~3 months
  const today = utcDate(new Date());
  let count = 0;

  for (let i = 1; i <= days; i++) {
    const day = new Date(today); day.setUTCDate(day.getUTCDate() - i);
    const reportDate = utcDate(day);

    const trackDept = deptByCode['TRACK'];
    if (trackDept) {
      const targets = showrooms.length ? showrooms : [null];
      for (const s of targets) {
        const payload = {
          reportDate,
          departmentId: trackDept._id,
          showroomId: s?._id || null,
          submittedBy: user._id,
          notes: 'SAMPLE_DATA',
          tracking: {
            offlineVehicles: rand(0, 3),
            tracker1Install: rand(0, 4),
            tracker1Renewal: rand(0, 3),
            tracker2Install: rand(0, 3),
            tracker2Renewal: rand(0, 2),
            magneticInstall: rand(0, 2),
            magneticRenewal: rand(0, 2),
          }
        };
        await DailyDepartmentReport.updateOne(
          { reportDate, departmentId: trackDept._id, showroomId: s?._id || null },
          { $set: payload },
          { upsert: true }
        );
        count++;
      }
    }

    const gov = deptByCode['GOV'];
    if (gov) {
      const payload = {
        reportDate,
        departmentId: gov._id,
        showroomId: null,
        submittedBy: user._id,
        notes: 'SAMPLE_DATA',
        speedGovernor: {
          nebsam: {
            officeInstall: rand(0, 3),
            agentInstall: rand(0, 2),
            officeRenewal: rand(0, 3),
            agentRenewal: rand(0, 2),
            offline: rand(0, 2),
            checkups: rand(0, 2)
          },
          mockMombasa: {
            officeRenewal: rand(0, 3),
            agentRenewal: rand(0, 2),
            offline: rand(0, 2),
            checkups: rand(0, 2)
          },
          sinotrack: {
            officeInstall: rand(0, 2),
            agentInstall: rand(0, 1),
            officeRenewal: rand(0, 2),
            agentRenewal: rand(0, 1),
            offline: rand(0, 1),
            checkups: rand(0, 1)
          }
        }
      };
      await DailyDepartmentReport.updateOne(
        { reportDate, departmentId: gov._id, showroomId: null },
        { $set: payload },
        { upsert: true }
      );
      count++;
    }

    const radio = deptByCode['RADIO'];
    if (radio) {
      const payload = {
        reportDate,
        departmentId: radio._id,
        showroomId: null,
        submittedBy: user._id,
        notes: 'SAMPLE_DATA',
        radio: {
          officeSale: rand(0, 4),
          agentSale: rand(0, 3),
          officeRenewal: rand(0, 3)
        }
      };
      await DailyDepartmentReport.updateOne(
        { reportDate, departmentId: radio._id, showroomId: null },
        { $set: payload },
        { upsert: true }
      );
      count++;
    }

    const fuel = deptByCode['FUEL'];
    if (fuel) {
      const payload = {
        reportDate,
        departmentId: fuel._id,
        showroomId: null,
        submittedBy: user._id,
        notes: 'SAMPLE_DATA',
        fuel: {
          officeInstall: rand(0, 3),
          agentInstall: rand(0, 2),
          officeRenewal: rand(0, 3),
          offline: rand(0, 2),
          checkups: rand(0, 2)
        }
      };
      await DailyDepartmentReport.updateOne(
        { reportDate, departmentId: fuel._id, showroomId: null },
        { $set: payload },
        { upsert: true }
      );
      count++;
    }

    const vtel = deptByCode['VTEL'];
    if (vtel) {
      const payload = {
        reportDate,
        departmentId: vtel._id,
        showroomId: null,
        submittedBy: user._id,
        notes: 'SAMPLE_DATA',
        vehicleTelematics: {
          officeInstall: rand(0, 3),
          agentInstall: rand(0, 2),
          officeRenewal: rand(0, 3),
          offline: rand(0, 2),
          checkups: rand(0, 2)
        }
      };
      await DailyDepartmentReport.updateOne(
        { reportDate, departmentId: vtel._id, showroomId: null },
        { $set: payload },
        { upsert: true }
      );
      count++;
    }

    const online = deptByCode['ONLINE'];
    if (online) {
      const payload = {
        reportDate,
        departmentId: online._id,
        showroomId: null,
        submittedBy: user._id,
        notes: 'SAMPLE_DATA',
        online: {
          installs: {
            bluetooth: rand(0, 2),
            hybrid: rand(0, 2),
            comprehensive: rand(0, 2),
            hybridAlarm: rand(0, 1),
          },
          renewals: {
            bluetooth: rand(0, 2),
            hybrid: rand(0, 2),
            comprehensive: rand(0, 2),
            hybridAlarm: rand(0, 1),
          }
        }
      };
      await DailyDepartmentReport.updateOne(
        { reportDate, departmentId: online._id, showroomId: null },
        { $set: payload },
        { upsert: true }
      );
      count++;
    }
  }

  console.log(`Seeded/updated ${count} sample reports over ${days} days.`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });