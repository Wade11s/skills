# Profile Discovery and Launch

Load this reference only at an Alignment or Execution profile gate.

## What each role needs

Roles are not interchangeable slots. Propose against the demand, not against whatever Main happens to be running:

| Role | Demand | Reasoning | Where the money should go |
|---|---|---|---|
| Coordinator | long mail loop, exact command following, context wide enough for every ticket in the wave; no code judgment at all | low to medium | the cheapest model that follows commands exactly; the wrong place for the strongest one |
| Worker | strongest available coding model, long output for a full implementation | medium to high | the wave's premium slot |
| Reviewer | adversarial reading, spec conformance, context wide enough to hold diff plus ticket | high | premium, and **a different model family from the Worker** |
| Integration Worker | conflict semantics on a small diff with high stakes | high | strong; inheriting a deliberately cheap Worker profile is the wrong default |
| Integration Reviewer | the Reviewer demand over a narrower scope | high | different family from whoever produced the integration commit |
| Alignment | conversation, product reasoning, question generation; little coding | high thinking | whichever family the user converses with comfortably |

## Cross-family review

The Worker and the Reviewer must come from **different model families**. Independent sessions, fixed comparison points, and read-only authority all fail against a correlated blind spot: the model that wrote a defect is the least likely to see it. Family means the model lineage (GPT, Claude, Gemini, GLM, Kimi, Grok, DeepSeek, Qwen, and so on), not the gateway that serves it, so two entries from one gateway still count as one family when the lineage matches.

The same rule applies to the Integration Reviewer against whoever produced the integration commit. If the user prefers one family for both, record that decision in the manifest as an explicit exception rather than leaving it implicit.

## Stored project profiles

Check `docs/agents/agent-profiles.md` before discovering anything. It records this repository's confirmed role pools, the complexity vocabulary, and the assignment defaults, so a gate that finds a valid file revalidates instead of re-exploring.

A valid file needs an understood `schemaVersion`, a `host.name` matching this machine, an `exploredAt` within `maxAgeDays`, one passing bounded auth check per entry this wave will launch, and each stored model still present in the harness catalog. Headroom is always read fresh, because the file stores capability and preference rather than per-run observations.

What the file replaces is rediscovery, not confirmation: Main proposes the stored pools as a one-line summary and takes a one-word confirmation, because profiles are user-confirmed parameters for every wave. A host mismatch, a failed check, a retired model, or a stale `exploredAt` sends the gate back to full discovery, after which Main offers to update the file. Sections below apply to that full-discovery path, and [the template](../templates/agent-profiles.md) is the seed for writing the file the first time.

## Facts the gate needs

Discovery is defined by the facts, not by any one tool. Only the Orca runtime is guaranteed present; every harness CLI and usage dashboard is optional, so each fact has a source ladder ending somewhere that always works.

| Fact | Why it gates | Source ladder |
|---|---|---|
| Launchable agents | `worker-start --agent` accepts only agents this host knows | version-matched Orca guide; `orca agent-context --json` (local read, no running app); `command -v` for the harness binary |
| Auth readiness | an unauthenticated provider fails at launch | `orca account list --json` for Orca-managed Claude/Codex accounts; the harness's own auth check; the user |
| Model id and capability | `--model` takes an opaque provider model id, and context width decides whether a role can hold its inputs | the harness catalog, queried by exact pattern; the provider's docs; the user, who always knows what they pay for |
| Reasoning flag and level | `--effort` needs `--model` and model support; other harnesses use their own flag | the version-matched Orca guide plus one harness `--help`; the user |
| Headroom | an exhausted plan fails mid-wave rather than at launch | a usage CLI when one is installed; the provider's own usage command; the user; otherwise recorded as unknown |
| Family | cross-family review depends on it | the model id's lineage; the user when a gateway name hides it |

Probe availability once per session and cache the answer:

```bash
command -v pi codexbar claude codex cursor-agent 2>/dev/null
```

A missing optional tool degrades the gate, never blocks it: propose from the tools that are present, ask the user for what none of them can answer, and record which source answered. The one thing that must not happen is treating an unavailable headroom source as unlimited headroom; write `headroomAtConfirmation: unknown` so the failure path knows the wave was launched blind.

## Bounded discovery

The gate needs one recommended tuple per requested role or pool slot, not a census of every installed model. Reach this path when no valid stored profile file answers the question.

1. Start from a profile already known to work. On a Pi host that is Main's own profile, in one shell call:

   ```bash
   printf '%s/%s:%s\n' "$PI_PROVIDER" "$PI_MODEL" "$PI_REASONING_LEVEL"
   ```

   Elsewhere it is whatever the user last confirmed, or the Orca-managed account that `orca account list --json` reports.

2. Validate every proposed candidate before proposing it. On a Pi host:

   ```bash
   pi --list-models '<provider>/<model>'
   pi auth check --provider '<provider>' --model '<model>' --json --no-refresh
   ```

   For an Orca-managed Claude or Codex launch, `orca account list --json` plus one `worker-start` receipt comparison of `launch.requested` against `launch.effective` is the equivalent evidence.

   An auth probe is evidence, not a verdict. It is reliable for first-party OAuth accounts and unreliable for third-party providers and gateways, which often serve requests fine while reporting `not_ready`, and occasionally report nothing useful for a provider whose credentials resolve only at call time. So a failed probe never silently drops a candidate; it moves it to the smoke test in the next step.

3. Smoke-test any candidate whose probe did not come back ready, because one real call answers what the probe cannot. The test is "ask this exact model for one token through a non-interactive one-shot call", and its shape depends on what this host has. Where `pi` exists:

   ```bash
   pi --model '<provider>/<model>' --thinking off -p 'reply with exactly: OK' --no-session --no-tools
   ```

   On a host without `pi`, use the candidate harness's own one-shot mode, taking the exact flag from that binary's `--help` rather than assuming one. When no CLI on this host can make a one-shot call, the smoke test is unavailable: say so, quote the probe result, and go straight to the user decision below, where the first Dispatch launch becomes the test.

   A smoke test costs a few tokens and a few seconds. Judge the **output**, not the exit status, which stays `0` even when the provider refuses. Then:

   - the model returns the token, so it is usable: propose it, and record that the smoke test rather than the probe is its evidence;
   - the call returns a provider error, so quote that exact error to the user and let them decide. Provider errors are specific and often actionable in a way a probe result is not: a retired model names its replacement, a blocked region or an expired key names itself. The user may vouch for the provider, point at a sibling model, or drop it;
   - a vouched candidate is proposed with the vouch recorded, and its first launch becomes the real test. If that launch fails, drop the vouch, report the provider error, and fail over inside the pool. This is also the path when no smoke test was possible at all.

   Record the outcome per entry in `docs/agents/agent-profiles.md` under `verification`, so the user answers this question once per provider rather than once per wave.

4. Check headroom once per gate when a usage CLI exists. Where CodexBar is installed:

   ```bash
   codexbar usage --format toon
   ```

   It takes roughly half a minute and reports each enabled provider's window usage, so call it once and cache the result. Skip any provider whose window is in deficit or nearly spent for the size of this wave, and record the observed headroom in the manifest so a later escalation knows what was true at confirmation. A metered balance counts as headroom, but a plan window that resets is the safer host for a long wave. With no usage source at all, say so at the gate and let the user decide whether to proceed.

5. Propose one tuple per role, or a small pool per role when the wave will run several tickets, with the Worker and Reviewer families differing. An alternatives table is for when the user asks for alternatives.
6. If alternatives are requested, inspect at most three role-appropriate candidates and filter output to matching rows. Unfiltered catalog dumps, broad provider listings, and executable-directory scans stay out of the normal gate.
7. Check a harness other than the host's usual one only when it is a proposed candidate, with one bounded executable/auth/capability check.
8. Cache tool availability, versions, command capabilities, headroom, and successfully checked candidate rows in Main's session state. Reuse them for later gates in the same Main session unless a version, auth state, headroom reading, or requested candidate changes. User confirmation remains required for each new Alignment Agent even when discovery is cached.
9. After the user confirms, offer to persist the result to `docs/agents/agent-profiles.md` so the next wave revalidates instead of re-exploring.

## Freeze without duplicate artifacts

The confirmed profile must be inlined in the Alignment Task or Wave Manifest. A second standalone temporary profile file is unnecessary unless another process must consume it. Preserve only:

- exact harness, provider/model, and reasoning/effort;
- the user confirmation reference;
- the launcher form;
- the runtime verification method.

## Two launch paths, chosen by harness

`worker-start` expresses a profile through `--model` and `--effort`, and the CLI constrains which harnesses can use it: `--model` accepts Claude, Codex, and Cursor provider model ids, `--effort` requires `--model`, and neither combines with `--terminal`. That splits every launch into exactly two paths.

| Harness | Path | Profile evidence |
|---|---|---|
| Claude, Codex, Cursor | one call: `worker-start --task <task> --worktree current --agent <agent> --model <id> --effort <level> --run <run> --json` | `launch.requested` and `launch.effective` in the receipt must agree |
| Pi, or any harness whose profile lives in its own CLI arguments | two steps: create the terminal with exact argv, then `worker-start --terminal <handle>` | one child-internal probe run by the Task after injection |

Two details decide the reasoning setting rather than guesswork: `--effort` requires `--model` and applies only where that agent and model actually support levels, and a harness driven by its own argv uses its own flag (Pi's `--thinking`). Validate the level once at the gate and record the flag form in the Wave Manifest, so no launch has to infer it.

Both paths keep the same Task-first, attach-once, bounded-read sequence below.

## Deterministic Alignment launch

The recipe below is written for Pi as the worked example of the argv path; any harness whose profile lives in its own CLI arguments follows the same shape with its own flags and its own in-session attestation.

An interactive Pi session's effective profile cannot be proven before it has received a message: Pi persists no session file until message activity, and its `PI_PROVIDER`, `PI_MODEL`, and `PI_REASONING_LEVEL` values are injected only into Pi's own LLM-callable shell tools rather than the external process environment.

For a confirmed Pi profile:

1. Create the complete Alignment Task first.
2. Create the terminal with exact CLI arguments, preferably the unambiguous combined model form:

   ```text
   pi --model <provider>/<model> --thinking <level>
   ```

3. Wait once for `tui-idle`. A successful wait plus the exact launch command is sufficient pre-dispatch launch evidence.
4. Attach and inject the Task immediately; do not pause for external process forensics:

   ```text
   orca orchestration worker-start --task <task> --worktree current --terminal <terminal> --run <Main Run> --json
   ```

5. The Task's first action runs this child-internal probe through Pi's `bash` tool:

   ```bash
   printf 'ALIGNMENT_PROFILE=%s/%s:%s\n' "$PI_PROVIDER" "$PI_MODEL" "$PI_REASONING_LEVEL"
   ```

6. The Alignment Agent compares the probe with the confirmed profile before requirement work and includes the exact attestation in its first human-facing response. On mismatch it sends an escalation, performs no alignment work, and idles.
7. Before attachment, make a one-row bounded terminal read and retain its `nextCursor`. After `worker-start` and `tui-idle`, read only new output with `terminal read --terminal <handle> --cursor <nextCursor> --limit 40 --json`. Ask the user to switch only when the attestation matches. If the version-matched guide offers a better bounded rendered-screen command, use it instead of assuming an unsupported flag.

## Launch failures

`worker-start` exits 0 only for a ready Dispatch. A `failed` or `outcome_unknown` result exits 1 and returns `stage`/`failedStage`, `setup`, `effects`, `residualResources`, and recovery commands. Treat that JSON as the instruction set:

1. Read `residualResources` and run the returned recovery commands before any second attempt, so a half-created terminal or worktree is reclaimed rather than orphaned.
2. For `outcome_unknown`, confirm the real state with `request-show` (or replay the identical call with the same `--retry-request` id) before deciding whether anything launched at all.
3. Launch the replacement with `worker-start --retry-of <dispatch_id>`, repeating the intended placement flags because `--retry-of` links the attempt without inheriting them.
4. If the process cannot be proven stopped, fence it with `worker-abandon` rather than assuming it died.

A launch that cannot be made ready leaves the ticket awaiting that role. Repair or replace the launch instead of substituting another role's judgment.

## Bounded verification only

An agent's effective profile comes from the launch receipt or one attestation, never from `ps`, `pgrep`, `lsof`, `sysctl`, shell history, process-environment dumps, session-directory scans, or repeated terminal reads. Besides being ineffective for Pi's injected `PI_*` values, process-environment dumps can leak credentials into transcripts. One cursor-bounded read replaces reading the whole accumulated terminal stream.

If the single attestation cannot be obtained, report `profile_verification_failed`, release the launch safely, and return to the user instead of improvising another forensic loop.
