require('dotenv').config(); // Load .env variables
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://taskreminderuser:hoaNpN0iqSmc2lYk@clustersnaap.060sgnk.mongodb.net/taskreminder?retryWrites=true&w=majority&appName=Clustersnaap';

async function makeAdmin(email) {
  await mongoose.connect(MONGO_URI); // Use the variable, not the string
  const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
  if (user) {
    console.log(`User ${user.email} is now an admin!`);
  } else {
    console.log('User not found!');
  }
  await mongoose.disconnect();
}

// Usage: node scripts/makeAdmin.js user@email.com
if (require.main === module) {
  const email = process.argv[2];
  if (!email) {
    console.error('Provide an email as argument');
    process.exit(1);
  }
  makeAdmin(email);
}