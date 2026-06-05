# beautiful-mermaid API Reference

## Core Functions

### `renderMermaidSVG(text, options?): string`

Synchronous. Auto-detects diagram type.

**Parameters:**
- `text` — Mermaid source code
- `options` — `RenderOptions` (optional)

**Returns:** SVG string

### `renderMermaidSVGAsync(text, options?): Promise<string>`

Async version. Same output, returns `Promise<string>`.

### `renderMermaidASCII(text, options?): string`

Synchronous ASCII/Unicode output.

**Parameters:**
- `text` — Mermaid source code
- `options` — `AsciiRenderOptions` (optional)

**Returns:** ASCII art string

### `parseMermaid(text): MermaidGraph`

Parse into structured graph object for custom processing.

### `fromShikiTheme(theme): DiagramColors`

Extract diagram colors from a Shiki theme object.

### `THEMES: Record<string, DiagramColors>`

All 15 built-in themes.

### `DEFAULTS: { bg: string, fg: string }`

Default colors (`#FFFFFF` / `#27272A`).

---

## RenderOptions (SVG)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `bg` | `string` | `#FFFFFF` | Background color or CSS variable |
| `fg` | `string` | `#27272A` | Foreground color or CSS variable |
| `line` | `string?` | — | Edge/connector color |
| `accent` | `string?` | — | Arrow heads, highlights |
| `muted` | `string?` | — | Secondary text, labels |
| `surface` | `string?` | — | Node fill tint |
| `border` | `string?` | — | Node stroke color |
| `font` | `string` | `Inter` | Font family |
| `transparent` | `boolean` | `false` | Transparent background |
| `padding` | `number` | `40` | Canvas padding (px) |
| `nodeSpacing` | `number` | `24` | Horizontal node spacing |
| `layerSpacing` | `number` | `40` | Vertical layer spacing |
| `componentSpacing` | `number` | `24` | Disconnected component spacing |
| `thoroughness` | `number` | `3` | Crossing minimization (1-7) |
| `interactive` | `boolean` | `false` | XY chart hover tooltips |

---

## AsciiRenderOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `useAscii` | `boolean` | `false` | Pure ASCII (no Unicode) |
| `paddingX` | `number` | `5` | Horizontal node spacing |
| `paddingY` | `number` | `5` | Vertical node spacing |
| `boxBorderPadding` | `number` | `1` | Inner box padding |
| `colorMode` | `string` | `'auto'` | `'none'`, `'auto'`, `'ansi16'`, `'ansi256'`, `'truecolor'`, `'html'` |
| `theme` | `Partial<AsciiTheme>` | — | Override default ASCII colors |

---

## Color Derivation (Mono Mode)

When only `bg` and `fg` are provided, the system auto-derives:

| Element | Derivation |
|---------|------------|
| Text | `fg` at 100% |
| Secondary text | `fg` at 60% into `bg` |
| Edge labels | `fg` at 40% into `bg` |
| Faint text | `fg` at 25% into `bg` |
| Connectors | `fg` at 50% into `bg` |
| Arrow heads | `fg` at 85% into `bg` |
| Node fill | `fg` at 3% into `bg` |
| Group header | `fg` at 5% into `bg` |
| Inner strokes | `fg` at 12% into `bg` |
| Node stroke | `fg` at 20% into `bg` |

Optional enrichment colors override specific derivations.

---

## Built-in Themes

| Theme | Type | Background | Accent |
|-------|------|------------|--------|
| `zinc-light` | Light | `#FFFFFF` | Derived |
| `zinc-dark` | Dark | `#18181B` | Derived |
| `tokyo-night` | Dark | `#1a1b26` | `#7aa2f7` |
| `tokyo-night-storm` | Dark | `#24283b` | `#7aa2f7` |
| `tokyo-night-light` | Light | `#d5d6db` | `#34548a` |
| `catppuccin-mocha` | Dark | `#1e1e2e` | `#cba6f7` |
| `catppuccin-latte` | Light | `#eff1f5` | `#8839ef` |
| `nord` | Dark | `#2e3440` | `#88c0d0` |
| `nord-light` | Light | `#eceff4` | `#5e81ac` |
| `dracula` | Dark | `#282a36` | `#bd93f9` |
| `github-light` | Light | `#ffffff` | `#0969da` |
| `github-dark` | Dark | `#0d1117` | `#4493f8` |
| `solarized-light` | Light | `#fdf6e3` | `#268bd2` |
| `solarized-dark` | Dark | `#002b36` | `#268bd2` |
| `one-dark` | Dark | `#282c34` | `#c678dd` |
