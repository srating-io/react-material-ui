import * as esbuild from 'esbuild';
import { readFile } from 'fs/promises';


export async function getBuildConfig() {
  const pkg = JSON.parse(await readFile(new URL('./package.json', import.meta.url)));

  const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
    'react/jsx-runtime',
  ];

  return {
    entryPoints: ['src/index.ts'],
    bundle: true,
    minify: !process.argv.includes('--watch'),
    sourcemap: true,
    external,
    target: 'es2020',
    jsx: 'automatic',
  };
}

export async function createBuildContexts(sharedConfig) {
  const esmCtx = await esbuild.context({
    ...sharedConfig,
    format: 'esm',
    outfile: 'dist/esm/index.js',
    banner: {
      js: '"use client";',
    },
  });

  const cjsCtx = await esbuild.context({
    ...sharedConfig,
    format: 'cjs',
    outfile: 'dist/cjs/index.js',
    banner: {
      js: '"use client";',
    },
  });

  return { esmCtx, cjsCtx };
}


async function runStandaloneBuild() {
  const start = performance.now();
  const config = await getBuildConfig();
  const { esmCtx, cjsCtx } = await createBuildContexts(config);

  try {
    await Promise.all([
      esmCtx.rebuild(),
      cjsCtx.rebuild(),
    ]);
  } finally {
    await Promise.all([
      esmCtx.dispose(),
      cjsCtx.dispose(),
    ]);
  }

  console.log(`⚡ Build complete - ${((performance.now() - start) / 1000).toFixed(2)}s`);
}


runStandaloneBuild().catch((e) => {
  console.error('Build error:', e);
  process.exit(1);
});
