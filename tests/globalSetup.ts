import path from 'path';
import fs from 'fs';

export default async (): Promise<void> => {
  // Ensure test fixtures directory exists
  const fixturesDir = path.join(__dirname, 'fixtures');
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }
};
