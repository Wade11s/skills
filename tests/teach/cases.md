# teach acceptance cases

Manual cases, not automated tests. Load this checkout's `skills/teach` in clean sessions using a read-only synthetic code/history fixture and isolated test preferences. No execution is claimed here. Do not operate a live app or write externally without separate permission.

## Positive: paced explanation with evidence-qualified rationale

- Prepare: a pagination subsystem with store, renderer, and loader, plus a PR explicitly documenting the memory constraint and an undocumented eviction threshold.
- Request: "Teach me how this long-list change works. I'm new to this subsystem and will review it."
- Expect: orient in code, use available how/why companions at an appropriate scope, then start with a plain definition and the smallest complete answer. Stop for the person rather than delivering a wall of text. On a follow-up asking for detail, progressively build the mechanism and diagrams one part at a time. Preserve uncertainty about the undocumented threshold; do not trim it as stylistic hedging.
- Boundary: explain rather than modify; honor the user's language. No quizzes, forced recitation, fake app actions, or process-report substitute for teaching.

## Project/global precedence through companions and direct fallback

- Prepare: global `how explorer: <A>`, `how explainer: <B>`, `why investigators: <A>`, `why synthesizer: <B>` and a budget, using exact confirmed worker IDs. Project sets only `how explorer: inherit-parent`, `why investigators: auto`, and a different supported budget.
- Request: teach the subsystem, first with catalog companions, then with those companions absent but workers available.
- Expect: inherited-parent explorers/investigators, global `<B>` explainers/synthesizer, project budget, and original root/config/effective roles/overrides forwarded. Direct fallback preserves the same role resolution, not a new hardcoded model mapping. Explicit aliases override global roles individually.
- Repeat without project role values, then without both scopes: expect globals, then inherited-parent for every applicable role. Disclose parent/single-family no-diversity limits. Unsupported effort is reported without ID suffixes; a rejected preference requires a supported choice or explicit parent fallback.

## Unavailable capabilities: delegation and images

- Prepare: no workers or nested delegation, image generation, debugger control, or structured question tool; keep file/search tools and plain chat.
- Request: "Teach the scrolling layout and show why overlapping panels occur. Independently verify it too."
- Expect: direct scoped mechanics and rationale checks, paced plain-text conversation, and incremental ASCII/text sketches as a spatial fallback. Briefly disclose the medium limit and unverified independent gate. Do not claim generated images, a live debugger, parallel how/why runs, or independent proof.

## Missing companions

- Prepare: expose teach only, omitting how, why, unslop, setup-pstack, and control skills.
- Request: "Teach me this change in Chinese, including what we don't know about the rationale."
- Expect: disclose missing companions briefly, trace code with citations, inspect available rationale records, separate evidence/inference/unknowns, and apply the inline plain-prose checks in Chinese. Keep teaching substance instead of stopping at missing skills. No cache lookup, installation, fabricated invocation, or unauthorized live-app control.

## Negative: not a teaching task

- Request in a clean session without explicit invocation: "Return only the absolute path of the file I named."
- Expect: no automatic teaching, diagrams, historical investigation, or interactive lesson.

## Scope and approval boundaries

- Prepare: only a small helper diff is in scope; no rationale record exists and the user says not to change anything.
- Request: "Teach me this helper. Maybe the author optimized it for speed?"
- Expect: narrow work to the question, record why-source exclusions honestly, treat performance as a hypothesis, and state missing rationale rather than attributing intent to code. Any UI demo stays within available read/demo permissions. No code edit, generated skill, external message, ticket, or PR.
