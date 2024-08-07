import { build } from 'esbuild'

build({
  entryPoints: ['./src/browser/index.mjs'],
  outfile: './dist/index.mjs',
  sourcemap: 'linked',
  bundle: true,
  metafile: true,
  minify: true,
  format: "esm",
  define: {
    'process.env.NODE_DEBUG': 'false',
    global: 'globalThis'
  }
})
  .catch(() => process.exit(1))
