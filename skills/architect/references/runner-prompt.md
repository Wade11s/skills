# Architect runner prompt

The orchestrator supplies this file for each Phase B candidate and fills in the task, Phase A grounding, isolated output location, original project root, preference paths, effective roles, budget, and explicit overrides. Use a permitted worktree when supported, otherwise a per-candidate directory. Write only your candidate artifacts, not shared implementation files. Separate output locations prevent write collisions; they do not establish model diversity or independent reasoning.

Produce one candidate design, not another orchestration run. The orchestrator supplies architect's relevant workflow context, or its catalog path for reading. Output a candidate design package: type sketch, function signatures, module map, and prose rationale shaped per [`rationale-template.md`](rationale-template.md). No custom worker type or nested delegation is needed. Named principle companions below are optional; apply the concrete design checks stated here even when they are absent.

Apply the following discipline. The orchestrator compares candidates on these axes to pick a base.

- Caller's usage first. Write the README-style usage and two or three real call sites before the types, then derive the type sketch from them. The usage is the spec. The two must agree, so reconcile the sketch to the usage, not the reverse.
- Data structures first. Get the core types right and the code becomes obvious. Trace each dominant access pattern through the proposed structure. If the answer is "we'll add a map / index / cache later," the structure is wrong.
- Interface depth. Compare the capability hidden behind the public surface relative to the size of that surface. Prefer a simple interface that pulls complexity into the callee, even when the implementation becomes less simple. Do not put transport or wire types on the public API. Parse into domain types behind the interface.
- Shared state: if two actors might both write, ask "what happens?" If the answer isn't "nothing," default to per-actor state with a merge at the read boundary, per the **separate-before-serializing-shared-state** principle skill.
- Make boundaries visible. `not implemented` errors for bodies, `// TODO` pseudocode for tricky logic, doc comments stating intent and invariants. A reader should trace data from input to output by reading types and signatures alone.
- Encode invariants in types: hard-to-misuse types > runtime checks > prose comments, per the **encode-lessons-in-structure** principle skill.
- Validate at boundaries, trust types inside, per the **boundary-discipline** principle skill. Business logic as pure functions. The shell stays thin.
- Single source of truth per invariant. Derive instead of sync.
- Idempotent state transitions where applicable, per the **make-operations-idempotent** principle skill. Ask what happens if the operation runs twice or crashes halfway.
- Short call chains. If tracing the flow needs more than three files, flatten the hierarchy, per the **laziness-protocol** and **minimize-reader-load** principle skills.

Produce the strongest design for this candidate without seeing or averaging the others. Candidates may use the same model or run sequentially. The orchestrator must report single-family degradation and label same-context passes as self-review, not independent proof. Differences between candidates are the signal used to pick a base and graft. Converging on a safe-looking middle defeats the exploration.
