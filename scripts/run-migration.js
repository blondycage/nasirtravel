#!/usr/bin/env node

/**
 * Wrapper script to load environment variables before running TypeScript
 * Run with: node scripts/run-migration.js
 */

// Load environment variables FIRST
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// Verify it loaded
console.log('✓ Environment loaded');
console.log('✓ MongoDB URI exists:', !!process.env.MONGODB_URI);

// Now run the TypeScript script with tsx
const { spawn } = require('child_process');

const child = spawn('npx', ['tsx', 'scripts/add-slugs.ts'], {
  stdio: 'inherit',
  env: process.env,
  shell: true
});

child.on('exit', (code) => {
  process.exit(code);
});
