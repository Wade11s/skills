---
name: architecture-diagram-generator
description: Create polished dark-themed architecture diagrams as self-contained HTML+SVG files. Use when the user asks for system, infrastructure, cloud, security, or network topology diagrams.
---

# Architecture Diagram Generator

Generate professional technical architecture diagrams as self-contained HTML files with inline SVG and CSS.

## Quick start

1. Copy and customize `resources/template.html`
2. Build the SVG diagram using the design system below
3. Output a single `.html` file with embedded CSS and inline SVG

## Design system

### Color semantics

| Type | Fill | Stroke |
|------|------|--------|
| Frontend | `rgba(8, 51, 68, 0.4)` | `#22d3ee` |
| Backend | `rgba(6, 78, 59, 0.4)` | `#34d399` |
| Database | `rgba(76, 29, 149, 0.4)` | `#a78bfa` |
| AWS/Cloud | `rgba(120, 53, 15, 0.3)` | `#fbbf24` |
| Security | `rgba(136, 19, 55, 0.4)` | `#fb7185` |
| Message Bus | `rgba(251, 146, 60, 0.3)` | `#fb923c` |
| External | `rgba(30, 41, 59, 0.5)` | `#94a3b8` |

Background: `#020617` with 40px grid pattern (`#1e293b` lines).
Typography: JetBrains Mono from Google Fonts.

### Component box

```svg
<!-- Opaque backing to mask arrows -->
<rect x="X" y="Y" width="W" height="H" rx="6" fill="#0f172a"/>
<!-- Styled box on top -->
<rect x="X" y="Y" width="W" height="H" rx="6" fill="FILL" stroke="STROKE" stroke-width="1.5"/>
<text x="CX" y="Y+20" fill="white" font-size="11" font-weight="600" text-anchor="middle">LABEL</text>
<text x="CX" y="Y+36" fill="#94a3b8" font-size="9" text-anchor="middle">sublabel</text>
```

- Component height: 60px (standard), 80-120px (large)
- Minimum vertical gap: 40px
- Draw arrows early in SVG (before boxes) so they render behind

### Info card

```html
<div class="card">
  <div class="card-header">
    <div class="card-dot" style="background:#22d3ee"></div>
    <h3>Title</h3>
  </div>
  <ul>
    <li>• Item one</li>
    <li>• Item two</li>
  </ul>
</div>
```

### Layout structure

1. Header — title, pulsing dot, subtitle, export toggle
2. Main SVG — contained in rounded border card
3. Summary cards — grid of 3 cards below SVG
4. Footer — minimal metadata line

## Export toolbar (preserve in output)

Every diagram must include the export toolbar intact:

- Two CDN scripts in `<head>` with pinned SRI hashes and `crossorigin="anonymous"`:
  - `html2canvas@1.4.1` — `integrity="sha384-ZZ1pncU3bQe8y31yfZdMFdSpttDoPmOZg2wguVK9almUodir1PghgT0eY7Mrty8H"`
  - `jspdf@2.5.2` — `integrity="sha384-en/ztfPSRkGfME4KIm05joYXynqzUgbsG5nMrj/xEFAHXkeZfO3yMK8QQ+mP7p1/"`
- `id="report-container"` on the outermost `.container` div
- `.toolbar` markup with `.toolbar-actions` (collapsed) and `.toolbar-toggle` (`⋯`)
- `.toolbar` CSS + `@media print { .toolbar { display: none !important; } }`
- `copyAsImage()`, `downloadPNG()`, `downloadPDF()` using `getBoundingClientRect()` + `html2canvas(document.body, { x, y, width, height, ignoreElements, scale: 2 })`

## Output rules

- Single self-contained `.html` file
- Embedded CSS only (no external stylesheets except Google Fonts)
- Inline SVG only (no external images)
- SVG viewBox: ~1000px wide, responsive
- Legend placed outside all boundary boxes, at least 20px below the lowest boundary
- Expand viewBox height to accommodate legend

## Reference

See [REFERENCE.md](REFERENCE.md) for complete spacing rules, arrow masking patterns, security group styling, region boundaries, message bus patterns, and advanced customization.
