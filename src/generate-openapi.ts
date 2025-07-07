#!/usr/bin/env ts-node
import { swaggerSpec } from './swagger';
import fs from 'fs';
import path from 'path';

// Ensure docs directory exists
const docsDir = path.join(__dirname, '../docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// Generate OpenAPI JSON file
const outputPath = path.join(docsDir, 'openapi.json');
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));

console.log('✅ OpenAPI specification generated successfully at:', outputPath);
console.log('📖 API documentation available at: http://localhost:8080/api-docs');
