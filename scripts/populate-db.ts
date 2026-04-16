import Redis from 'ioredis';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually for the script if needed
// (tsx often doesn't load .env.local by default unless configured)
import 'dotenv/config'; 

const redis = new Redis(process.env.REDIS_URL || '');

async function populate() {
  const dataPath = path.join(process.cwd(), 'migration_data.json');
  if (!fs.existsSync(dataPath)) {
    console.error('migration_data.json not found. Run scripts/parse_excel.py first.');
    return;
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const entries = Object.entries(data);

  console.log(`Starting migration of ${entries.length} slots to Redis...`);

  const pipeline = redis.pipeline();
  for (const [id, value] of entries) {
    pipeline.set(`slot:${id}`, JSON.stringify(value));
  }

  await pipeline.exec();
  console.log('Migration completed successfully!');
  await redis.quit();
}

populate().catch(async (err) => {
  console.error(err);
  await redis.quit();
});
