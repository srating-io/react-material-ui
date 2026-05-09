import * as esbuild from 'esbuild';
import { readFile } from 'fs/promises';

const watch = process.argv.includes('--watch');

// 1. Read package.json to identify external dependencies
const pkg = JSON.parse(await readFile(new URL('./package.json', import.meta.url)));

// Mark all dependencies and peerDependencies as external
// so they aren't bundled into your library
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
  'react/jsx-runtime',
];

const sharedConfig = {
  entryPoints: ['src/index.ts'], // Adjust this to your entry point
  bundle: true,
  minify: !watch,
  sourcemap: true,
  external,
  target: 'es2020', // or your browserslist equivalent
  jsx: 'automatic',
};

// Custom plugin to log rebuilds during watch mode
const watchLoggerPlugin = (format) => ({
  name: 'watch-logger',
  setup(build) {
    let count = 0;
    build.onEnd((result) => {
      if (result.errors.length > 0) {
        console.error(`❌ [${format}] Rebuild failed with ${result.errors.length} errors.`);
      } else {
        // Avoid spamming the initial build log if you want, 
        // or log every single successful build/rebuild:
        if (count > 0) {
          console.log(`🔄 [${format}] File change detected. Rebuilt successfully.`);
        } else {
          console.log(`✨ [${format}] Initial build complete.`);
        }
        count++;
      }
    });
  },
});

async function build() {
  // esbuild v0.17+ watch API requires using "contexts"
  const esmCtx = await esbuild.context({
    ...sharedConfig,
    format: 'esm',
    outfile: 'dist/esm/index.js',
    plugins: watch ? [watchLoggerPlugin('ESM')] : [],
  });

  const cjsCtx = await esbuild.context({
    ...sharedConfig,
    format: 'cjs',
    outfile: 'dist/cjs/index.js',
    plugins: watch ? [watchLoggerPlugin('CJS')] : [],
  });

  if (watch) {
    // Start watching both contexts
    await Promise.all([
      esmCtx.watch(),
      cjsCtx.watch(),
    ]);
    console.log('Watching for changes in src/ ...');
  } else {
    const start = performance.now();

    // In esbuild v0.17+, you trigger a one-off build from a context using .rebuild()
    // and then you must dispose of the context to free up resources.
    await Promise.all([
      esmCtx.rebuild(),
      cjsCtx.rebuild(),
    ]);

    await Promise.all([
      esmCtx.dispose(),
      cjsCtx.dispose(),
    ]);

    console.log(`⚡ Build complete - ${((performance.now() - start) / 1000).toFixed(2)}s`);
  }
}

build().catch((e) => {
  console.log('Build error');
  console.log(e);
  process.exit(1);
});
