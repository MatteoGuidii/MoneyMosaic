import path from 'path';
import fs from 'fs';

export default async (): Promise<void> => {
  // Clean up all test databases
  const fixturesDir = path.join(__dirname, 'fixtures');
  
  if (fs.existsSync(fixturesDir)) {
    const files = fs.readdirSync(fixturesDir);
    
    for (const file of files) {
      if (file.startsWith('test-') && file.endsWith('.db')) {
        const filePath = path.join(fixturesDir, file);
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          // Ignore errors when cleaning up test files
          console.warn(`Failed to clean up test database: ${filePath}`);
        }
      }
    }
  }

  // Force clear any remaining timers
  if (global.gc) {
    global.gc();
  }
  
  // Give time for cleanup
  await new Promise(resolve => setTimeout(resolve, 100));
};
