#!/usr/bin/env node

import { loadBeautifulMermaid } from './lib/load.mjs';

async function main() {
  const { THEMES } = await loadBeautifulMermaid();
  const names = Object.keys(THEMES);

  console.log('Available Beautiful-Mermaid Themes:\n');
  names.forEach((name, i) => {
    const t = THEMES[name];
    const type = t.bg === '#FFFFFF' || t.bg === '#ffffff' || t.bg?.toLowerCase() === '#fdf6e3' || t.bg?.toLowerCase() === '#eff1f5' || t.bg?.toLowerCase() === '#eceff4' || t.bg?.toLowerCase() === '#d5d6db' ? 'Light' : 'Dark';
    console.log(` ${String(i + 1).padStart(2)}. ${name.padEnd(20)} ${type.padStart(5)}  bg=${t.bg || 'default'}`);
  });
  console.log(`\nTotal: ${names.length} themes`);
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
