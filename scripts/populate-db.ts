import { kv } from '@vercel/kv';
import * as fs from 'fs';
import * as path from 'path';

async function populate() {
  const dataPath = path.join(process.cwd(), 'migration_data.json');
  if (!fs.existsSync(dataPath)) {
    console.error('migration_data.json not found. Run scripts/parse_excel.py first.');
    return;
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const entries = Object.entries(data);

  console.log(`Starting migration of ${entries.length} slots...`);

  const pipeline = kv.pipeline();
  for (const [id, value] of entries) {
    pipeline.set(`slot:${id}`, value);
  }

  await pipeline.exec();
  console.log('Migration completed successfully!');
}

populate().catch(console.error);
