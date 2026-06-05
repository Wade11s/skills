#!/usr/bin/env node

import { readdirSync, mkdirSync, existsSync } from 'fs';
import { loadBeautifulMermaid } from './lib/load.mjs';

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    inputDir: null,
    outputDir: null,
    format: 'svg',
    theme: null,

    transparent: false,
    useAscii: false,
  };

  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    const val = args[i + 1];
    switch (key) {
      case '--input-dir': opts.inputDir = val; i++; break;
      case '--output-dir': opts.outputDir = val; i++; break;
      case '--format': opts.format = val; i++; break;
      case '--theme': opts.theme = val; i++; break;
      case '--transparent': opts.transparent = true; break;
      case '--use-ascii': opts.useAscii = true; break;
      case '--help': case '-h':
        console.log(`Usage: node batch.mjs --input-dir <dir> --output-dir <dir> [options]

Options:
  --input-dir <dir>    Directory containing .mmd files [required]
  --output-dir <dir>   Output directory [required]
  --format <fmt>       svg | ascii (default: svg)
  --theme <name>       Theme name for SVG output
  --transparent        Transparent SVG background
  --use-ascii          ASCII mode for ASCII output`);
        process.exit(0);
    }
  }

  if (!opts.inputDir || !opts.outputDir) {
    console.error('Error: --input-dir and --output-dir are required.');
    process.exit(1);
  }

  return opts;
}

async function main() {
  const opts = parseArgs();
  const { renderMermaidSVG, renderMermaidASCII, THEMES } = await loadBeautifulMermaid();


  if (!existsSync(opts.outputDir)) mkdirSync(opts.outputDir, { recursive: true });

  const files = readdirSync(opts.inputDir)
    .filter(f => f.endsWith('.mmd'))
    .map(f => join(opts.inputDir, f));

  if (files.length === 0) {
    console.log('No .mmd files found.');
    process.exit(0);
  }

  console.log(`Found ${files.length} diagram(s) to render...\n`);

  const { readFileSync, writeFileSync } = await import('fs');
  const theme = opts.theme ? THEMES[opts.theme] : undefined;
  let success = 0;

  for (const file of files) {
    const input = readFileSync(file, 'utf8');
    const basename = file.split('/').pop().replace('.mmd', '');
    const ext = opts.format === 'ascii' ? 'txt' : 'svg';
    const outPath = join(opts.outputDir, `${basename}.${ext}`);

    try {
      if (opts.format === 'ascii') {
        const ascii = renderMermaidASCII(input, { useAscii: opts.useAscii });
        writeFileSync(outPath, ascii);
      } else {
        const svg = renderMermaidSVG(input, { ...theme, transparent: opts.transparent });
        writeFileSync(outPath, svg);
      }
      console.log(`\u2713 ${basename}.mmd`);
      success++;
    } catch (e) {
      console.error(`\u2717 ${basename}.mmd — ${e.message}`);
    }
  }

  console.log(`\n${success}/${files.length} diagrams rendered successfully`);
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
