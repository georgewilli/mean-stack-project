const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const dotenv = require('dotenv');
dotenv.config();

async function seed() {
    try {
      await mongoose.connect(process.env.CONNECTION_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
  
      const users = [
        {
          username: 'user1',
          password: await bcrypt.hash('user1', 10),
          role: 'admin'
        },
        {
          username: 'user2',
          password: await bcrypt.hash('user2', 10),
          role: 'user'
        }
      ];
  
      for (const user of users) {
        const exists = await User.findOne({ username: user.username });
        if (!exists) {
          await User.create(user);
          console.log(`✅ Created user: ${user.username}`);
        } else {
          console.log(`⚠️ User already exists: ${user.username}`);
        }
      }
  
      mongoose.disconnect();
    } catch (err) {
      console.error('❌ Seeding error:', err);
      process.exit(1);
    }
  }
  seed();