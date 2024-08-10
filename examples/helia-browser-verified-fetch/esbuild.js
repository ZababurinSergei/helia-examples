import { build } from 'esbuild'

build({
  entryPoints: ['./src/index.mjs'],
  outfile: './dist/index.mjs',
  sourcemap: 'linked',
  minify: true,
  bundle: true,
  define: {
    'process.env.NODE_DEBUG': 'false',
    global: 'globalThis'
  }
})
  .catch(() => process.exit(1))
