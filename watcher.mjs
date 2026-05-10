/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */

import { watch as nativeWatch, rmSync } from 'fs';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { getBuildConfig, createBuildContexts } from './build.mjs';

const execAsync = promisify(exec);

async function startWatcher() {
  console.log('🧹 Running initial clean...');
  // Environment-agnostic clean (works flawlessly on Windows, macOS, and Linux)
  try {
    rmSync('dist', { recursive: true, force: true });
  } catch (err) {
    console.warn('Could not clean dist directory:', err.message);
  }

  console.log('⌨️  Starting background TypeScript compiler (tsc)...');
  const tscProcess = spawn(
    'npx',
    ['tsc', '-p', 'tsconfig.build.json', '--emitDeclarationOnly', '--outDir', 'dist/types', '--watch', '--preserveWatchOutput'],
    {
      shell: true,
      stdio: 'inherit', // This pipes tsc output/errors directly to your terminal
    },
  );

  // Clean up the background tsc process when this watcher process exits
  process.on('SIGINT', () => {
    tscProcess.kill();
    process.exit();
  });
  process.on('SIGTERM', () => {
    tscProcess.kill();
    process.exit();
  });

  console.log('📦 Initializing esbuild contexts from build.mjs...');
  const sharedConfig = await getBuildConfig();
  const { esmCtx, cjsCtx } = await createBuildContexts(sharedConfig);

  console.log('👀 Watching src/ folder for any file changes...');

  let debounceTimer;
  let building = false;

  const debouncedRebuild = (eventType, filename) => {
    if (building) return;

    if (filename) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        console.log(`🔄 [${eventType}] File change detected: src/${filename}`);
        building = true;
        const start = performance.now();

        try {
          // Run prebuild script to generate new exports file
          console.log('🏃 Running prebuild...');
          const { stdout: prebuildOut } = await execAsync('npm run prebuild');
          if (prebuildOut) console.log(prebuildOut.trim());

          // Trigger incremental builds
          console.log('🏃 Rebuilding via esbuild...');
          await Promise.all([esmCtx.rebuild(), cjsCtx.rebuild()]);

          // Fix CJS module type
          console.log('🏃 Fixing CJS package type...');
          const { stdout: fixOut } = await execAsync('npm run fix:cjs');
          if (fixOut) console.log(fixOut.trim());

          console.log(`⚡ Build watcher finished in ${((performance.now() - start) / 1000).toFixed(2)}s`);
        } catch (error) {
          console.error(`❌ Build failed:`);
          console.error(error.stdout || error.message);
        }

        building = false;
      }, 100);
    }
  };

  nativeWatch(
    'src',
    { recursive: true },
    (eventType, filename) => {
      debouncedRebuild(eventType, filename);
    },
  );
}

startWatcher().catch(console.error);
