---
name: beautiful-mermaid
description: Renders Mermaid diagrams as beautiful SVG or terminal-friendly ASCII art using the beautiful-mermaid library. Use when the user asks to render Mermaid diagrams, create flowcharts/sequence/state/class/ER/XY charts, apply themes, generate ASCII diagrams, batch-process .mmd files, or integrate Mermaid rendering into React, Node, or Bun projects.
---

# Beautiful Mermaid

Render stunning Mermaid diagrams with `beautiful-mermaid` — ultra-fast, fully themeable, pure TypeScript.

## Quick Start

### Install

```bash
npm install beautiful-mermaid
# or: bun add beautiful-mermaid
```

### Render SVG (synchronous)

```typescript
import { renderMermaidSVG, THEMES } from 'beautiful-mermaid'

const svg = renderMermaidSVG(`graph TD\n  A --> B`, THEMES['tokyo-night'])
```

### Render ASCII (terminal)

```typescript
import { renderMermaidASCII } from 'beautiful-mermaid'

const ascii = renderMermaidASCII(`graph LR; A --> B`)
```

### CLI: Render from file

```bash
node scripts/render.mjs --input examples/flowchart.mmd --output out.svg --theme tokyo-night
node scripts/render.mjs --input examples/sequence.mmd --format ascii --output out.txt
```

## Workflows

### Choose output format

- **SVG** → web, docs (`--format svg`)
- **ASCII** → terminal, README (`--format ascii`)

### Choose theme

```bash
node scripts/themes.mjs
```

Dark: `tokyo-night`, `github-dark`, `dracula`, `nord`  
Light: `github-light`, `zinc-light`, `catppuccin-latte`

## Supported Diagrams

Flowchart, Sequence, State, Class, ER, XY Chart (`xychart-beta`).  
See [references/DIAGRAMS.md](references/DIAGRAMS.md) for syntax and templates.

## Advanced Features

- **Mono mode**: `bg` + `fg` only, rest auto-derived via `color-mix()`
- **Shiki themes**: `fromShikiTheme(shikiTheme)` for VS Code theme mapping
- **Live switching**: CSS variables for instant theme changes without re-render
- **Batch render**: `node scripts/batch.mjs --input-dir ./examples --output-dir ./out`

See [references/API.md](references/API.md) for React integration, `RenderOptions`, `AsciiRenderOptions`, and type signatures.
