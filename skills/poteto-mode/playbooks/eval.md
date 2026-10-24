### Eval

**You own the experiment design. Plan, blind, run, synthesize.**

**Non-negotiables for blinding:**

- No `eval`, `test`, `judge`, `experiment`, `rubric`, `score`, `compare`, `benchmark`, `candidate`, or `arena` in any directory, file, or prompt the candidate sees.
- The candidate prompt looks like an organic user request. State the goal, not the meta.
- No chain-eliciting cues. Don't ask the candidate to list which skills, principles, or files they applied. Ask for design notes generally and grade chain-following from code shape, not self-report.
- Sanitize directory and slug names. Use project-shaped names a user might pick.
- Don't tell the candidate other candidates exist.
- The judge can know it's judging but sees outputs by sanitized label only, never by model name.
- Comparing two variants: one judge scores both sets in a single pass on one scale, blind to which set each came from.

**Steps:**

1. **Frame.** State what variant is under test and what behavior counts as success. Write the rubric (3-6 concrete criteria) for the judge only. Hold it back from candidates.
2. **Set up sanitized environments.** Per-candidate working dir with the variant in place. Plant any context an organic task would have: a project skeleton, the skills the candidate would naturally read.
3. **Author one organic prompt.** What a user would type. No leakage of what's being measured.
4. **Dispatch N isolated candidates** through supported workers, following optional **arena** when available. Use the same organic prompt and separate sanitized directories. Resolve the configured panel per the Subagents section; repeated `inherit-parent` entries are attempts, not model diversity. Without parallel support, run separate workers sequentially and report timing loss. Without workers at all, inspect the variants as self-review only; blinding and independent comparison remain unverified. If arena is absent, use these local experiment steps and disclose the missing companion.
5. **Dispatch one blinded separate judge** when supported. Prefer a different confirmed model family if available; disclose its absence. The judge sees sanitized output labels and the rubric, never model names. A single context that saw the variants cannot pretend to be a blind judge.
6. **Verify the chain from authorized activity evidence, not self-report.** Discover the host's worker-history API or an explicitly supplied project-scoped transcript/export directory. Read only the candidates for this experiment; there is no universal transcript path. If unavailable, inspect outputs and code shape, but mark file-open/chain-following evidence unavailable. Never infer that a file was read from the candidate's claim or scan unrelated private history.
7. **Read every candidate output yourself** end to end. Compare to the judge's verdict. Disagreement means a model is biased or the rubric is ambiguous. Synthesize.

**Reply:** variant under test, rubric, per-candidate notes, judge's verdict, your synthesis, and a recommendation for whether to promote the variant.
