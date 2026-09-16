# Domain Docs

How engineering skills consume this repository's domain documentation.

## Before exploring

- Read root `CONTEXT.md`, or root `CONTEXT-MAP.md` when it points at multiple
  relevant contexts.
- Read ADRs under `docs/adr/` that affect the work.
- In a configured multi-context repository, also read the context-local
  `CONTEXT.md` and ADR directory named by the map.

If any file is absent, proceed silently. Domain content is created lazily when
terminology or decisions are actually resolved.

## Layout

Layout: `<single-context|multi-context>`

Single-context:

```text
/
├── CONTEXT.md
├── docs/adr/
└── src/
```

Multi-context:

```text
/
├── CONTEXT-MAP.md
├── docs/adr/
└── <context roots named by the map>/
    ├── CONTEXT.md
    └── docs/adr/
```

Use glossary terms in tickets, tests, and code. Surface a conflict with an ADR
instead of silently overriding it.

