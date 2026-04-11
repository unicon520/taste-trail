const mongoose = require('mongoose');
const Restaurant = require('./data/models/Restaurant');

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/test_db', { serverSelectionTimeoutMS: 2000 }).catch(e => {
     // ignore connection
  });
  
  const r = new Restaurant({ name: 'Test', location: 'Test', cuisine: 'Test' });
  try {
     console.log('trying to save...');
     await r.validate();
     // if validate triggers pre hooks, we'll see
     console.log('validated');
  } catch(e) {
     console.log('error:', e.message);
  }
}
test();
