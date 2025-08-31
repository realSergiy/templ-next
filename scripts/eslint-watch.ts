#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import path from 'node:path';

let isRunning = false;
let debounceTimer: NodeJS.Timeout | undefined;

const runESLint = () => {
  if (isRunning) {
    console.log('⏳ ESLint is already running, skipping...');
    return;
  }

  isRunning = true;
  console.log('\n🔍 Running ESLint...');

  const eslint = spawn('pnpm', ['eslint', '--cache'], {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  eslint.on('close', code => {
    isRunning = false;
    if (code === 0) {
      console.log('✅ ESLint completed successfully');
    } else {
      console.log(`❌ ESLint exited with code ${code}`);
    }
    console.log('👀 Watching for changes...\n');
  });

  eslint.on('error', error => {
    isRunning = false;
    console.error('Failed to start ESLint:', error);
  });
};

const debouncedRun = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(runESLint, 200);
};

const watchOptions = { recursive: true };

const watchPaths = ['src', 'test', 'scripts'];
const watchFiles = ['eslint.config.ts', 'tsconfig.json'];

console.log('🚀 Starting ESLint watch mode...');
console.log(`📁 Watching directories: ${watchPaths.join(', ')}`);
console.log(`📄 Watching files: ${watchFiles.join(', ')}\n`);

runESLint();

for (const watchPath of watchPaths) {
  try {
    const watcher = watch(path.resolve(watchPath), watchOptions, (eventType, filename) => {
      if (filename) {
        console.log(`📝 ${eventType}: ${watchPath}/${filename}`);
        debouncedRun();
      }
    });

    watcher.on('error', e => {
      console.error(`Error watching ${watchPath}:`, e);
    });
  } catch (e) {
    console.error(`Failed to watch ${watchPath}:`, e);
  }
}

for (const file of watchFiles) {
  try {
    const watcher = watch(path.resolve(file), (eventType: string) => {
      console.log(`📝 ${eventType}: ${file}`);
      debouncedRun();
    });

    watcher.on('error', e => {
      console.error(`Error watching ${file}:`, e);
    });
  } catch (e) {
    console.error(`Failed to watch ${file}:`, e);
  }
}

process.on('SIGINT', () => {
  console.log('\n👋 Stopping ESLint watch mode...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Stopping ESLint watch mode...');
  process.exit(0);
});
