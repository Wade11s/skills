# NOTICE

## Upstream

The skills under `skills/pstack-pi/` and the adapted guide under `docs/guide/` are
derived from **pstack**, part of [cursor/plugins](https://github.com/cursor/plugins/tree/main/pstack):

- Copyright (c) 2026 Lauren Tan
- Licensed under the MIT License
- Pinned at commit `b7b93c3`, pstack version `0.15.48`

The port keeps upstream structure, ordering, and judgement rules, and changes only what
the Pi platform requires: tool and path names, model configuration, the progress
mechanism, and the removal of Cursor-only features (Bugbot, Automations, cloud agents,
`cursor-team-kit`, and the Grok Bot web UI). `docs/planning/pstack-for-pi.md` records
each adaptation decision.

Upstream license text, as required by the MIT License:

```
MIT License

Copyright (c) 2026 Lauren Tan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## This repository

Files that are not derived from pstack are Copyright (c) 2026 Wade11s and licensed
under the MIT License. See `LICENSE`.
