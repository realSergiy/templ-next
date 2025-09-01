#!/usr/bin/env node

import { readFileSync, existsSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';

type CleanOptions = {
  readonly dryRun?: boolean;
};

type CleanResult = {
  readonly cleanedCount: number;
  readonly errorCount: number;
};

const DEFAULT_PATTERNS = [
  'node_modules',
  '.next',
  'out',
  'dist',
  'build',
  'coverage',
  '.eslintcache',
  '.DS_Store',
] as const;

const parseGitignore = (content: string) =>
  content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(pattern => {
      if (pattern.startsWith('/')) {
        return pattern.slice(1);
      }
      if (pattern.endsWith('/')) {
        return pattern + '**';
      }
      return pattern;
    });

const loadGitignorePatterns = (projectRoot: string) => {
  const gitignorePath = path.join(projectRoot, '.gitignore');

  if (!existsSync(gitignorePath)) {
    console.log('⚠️  No .gitignore file found. Using default patterns.');
    return DEFAULT_PATTERNS;
  }

  try {
    const content = readFileSync(gitignorePath, 'utf8');
    const patterns = parseGitignore(content);
    console.log(`📋 Loaded ${patterns.length} patterns from .gitignore`);
    return patterns;
  } catch {
    console.error('❌ Failed to read .gitignore');
    process.exit(1);
  }
};

const findMatchingFiles = async (projectRoot: string, patterns: readonly string[]) => {
  const matchingFiles: string[] = [];

  for (const pattern of patterns) {
    try {
      const matches = await glob(pattern, {
        cwd: projectRoot,
        absolute: true,
        ignore: ['.git/**'],
        dot: true,
        follow: false,
      });

      matchingFiles.push(...matches);
    } catch (e) {
      console.warn(`⚠️  Warning: Failed to process pattern "${pattern}":`, e);
    }
  }

  return [...new Set(matchingFiles)].sort();
};

const removeFile = (filePath: string) => {
  try {
    if (!existsSync(filePath)) {
      return false;
    }

    const stats = statSync(filePath);
    if (stats.isDirectory()) {
      rmSync(filePath, { recursive: true, force: true });
    } else {
      rmSync(filePath, { force: true });
    }
    return true;
  } catch {
    return false;
  }
};

const cleanFiles = (
  files: readonly string[],
  projectRoot: string,
  options: CleanOptions = {},
): CleanResult => {
  const { dryRun = false } = options;

  if (files.length === 0) {
    console.log('✨ No files to clean!');
    return { cleanedCount: 0, errorCount: 0 };
  }

  console.log(
    `\n${dryRun ? '🔍' : '🧹'} ${dryRun ? 'Would clean' : 'Cleaning'} ${files.length} files/directories...\n`,
  );

  let cleanedCount = 0;
  let errorCount = 0;

  // Categorize files for better display
  const directories: string[] = [];
  const filesList: string[] = [];

  for (const filePath of files) {
    try {
      const stats = statSync(filePath);
      if (stats.isDirectory()) {
        directories.push(filePath);
      } else {
        filesList.push(filePath);
      }
    } catch {
      // If we can't stat, assume it's a file
      filesList.push(filePath);
    }
  }

  // Show directories first
  if (directories.length > 0) {
    console.log(`📁 ${dryRun ? 'Would remove' : 'Removing'} ${directories.length} directories:`);
    for (const dirPath of directories) {
      const relativePath = path.relative(projectRoot, dirPath);
      console.log(`   ${dryRun ? '🔍' : '🗑️'}  ${relativePath}/`);
    }
    console.log('');
  }

  // Show files
  if (filesList.length > 0) {
    console.log(`📄 ${dryRun ? 'Would remove' : 'Removing'} ${filesList.length} files:`);
    for (const filePath of filesList) {
      const relativePath = path.relative(projectRoot, filePath);
      console.log(`   ${dryRun ? '🔍' : '🗑️'}  ${relativePath}`);
    }
    console.log('');
  }

  // Perform actual cleanup
  for (const filePath of files) {
    if (dryRun) {
      cleanedCount++;
      continue;
    }

    if (removeFile(filePath)) {
      cleanedCount++;
    } else {
      errorCount++;
      const relativePath = path.relative(projectRoot, filePath);
      console.error(`❌ Failed to clean ${relativePath}`);
    }
  }

  console.log(`\n${dryRun ? '🔍' : '✅'} Summary:`);
  console.log(`   ${dryRun ? 'Would clean' : 'Cleaned'}: ${cleanedCount} files/directories`);
  if (errorCount > 0) {
    console.log(`   ❌ Errors: ${errorCount}`);
  }

  return { cleanedCount, errorCount };
};

const showHelp = (): never => {
  console.log(`
🧹 Project Cleaner

Usage: pnpm clean [options]

Options:
  --dry-run, -n     Show what would be cleaned without actually cleaning
  --help, -h        Show this help message

The script reads patterns from .gitignore and removes all matching files and directories.
Files and directories are always listed before removal for transparency.
`);
  process.exit(0);
};

const parseArgs = (): CleanOptions => {
  const args = new Set(process.argv.slice(2));

  if (args.has('--help') || args.has('-h')) {
    showHelp();
  }

  return {
    dryRun: args.has('--dry-run') || args.has('-n'),
  };
};

const handleShutdown = (signal: string) => {
  console.log(`\n👋 Cleanup ${signal === 'SIGINT' ? 'interrupted' : 'terminated'}`);
  process.exit(0);
};

const setupGracefulShutdown = (): void => {
  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
};

const main = async () => {
  const projectRoot = path.resolve(process.cwd());
  const options = parseArgs();

  console.log('🚀 Starting project cleanup...');
  console.log(`📁 Project root: ${projectRoot}\n`);

  const patterns = loadGitignorePatterns(projectRoot);
  const matchingFiles = await findMatchingFiles(projectRoot, patterns);

  if (matchingFiles.length === 0) {
    console.log('✨ No files match the .gitignore patterns!');
    return;
  }

  cleanFiles(matchingFiles, projectRoot, options);
  console.log('\n🎉 Cleanup completed!');
};

setupGracefulShutdown();

try {
  await main();
} catch (e: unknown) {
  console.error('❌ Cleanup failed:', e);
  process.exit(1);
}
