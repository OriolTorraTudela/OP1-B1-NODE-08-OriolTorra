require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const seedAll = require('./utils/seedAll');

async function start() {
  const port = process.env.PORT || 3000;
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('Missing MONGO_URI in .env');
    process.exit(1);
  }

  await connectDB(mongoUri);

  // Ensure system permissions + roles exist
  await seedAll();

  app.listen(port, () => console.log(`API listening on :${port}`));
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
