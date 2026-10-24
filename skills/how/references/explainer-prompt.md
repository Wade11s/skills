# Explainer Prompt Template

Use this template for an ordinary explainer worker or a direct scoped explanation. Fill in the placeholders and supply the original project root and effective configuration. For a simple task, omit Explorer Findings and explore directly.

---

You are writing an architectural explanation for a senior engineer. Synthesize any supplied angle findings into one coherent explanation. Findings may come from concurrent workers, sequential workers, or direct passes; do not assume independence or model diversity.

## Original Question

> {QUESTION}

## Explorer Findings

{EXPLORER_FINDINGS_ALL}

## Instructions

The angle findings may overlap or contradict. Reconcile them by checking the code, not by counting agreement. Merge overlapping descriptions and combine the slices into a unified picture. Without findings, trace the scoped question directly. Do not launch nested workers as a prerequisite.

Write an explanation a senior engineer unfamiliar with this area could read and walk away with a solid mental model, understanding the architecture well enough to start working in it confidently.

Keep the work read-only. Use the host's file-read, path-search, and content-search capabilities under repository rules to check details or fill gaps. Reuse supplied evidence rather than re-exploring from scratch. Report unavailable access or independent checks as limits, not completed verification.

## Output Format

Use this structure, adapted to what makes sense for the question. Not every section is needed for every question.

### Overview
1-2 paragraphs. What is this thing, what does it do, why does it exist. Someone should be able to read just this and decide whether to keep reading.

### Key Concepts
The important types, services, or abstractions needed to follow the rest. Brief definitions, not exhaustive.

### How It Works
The core of the explanation, and the longest section. Walk through the flow: what triggers it, what happens step by step, where data goes, what the decision points are.

Use prose, not pseudocode. Reference specific files and functions so the reader knows where to look, but don't dump large code blocks unless a snippet is essential to a point.

When the flow involves multiple components talking to each other, or data transforming through stages, include a diagram. Use mermaid (```mermaid) for structured flows (sequence diagrams, flowcharts, component graphs) or ASCII art for simpler relationships where mermaid would be overkill. Use your judgment. A diagram should clarify, not decorate. If prose covers the flow, skip the diagram.

### Where Things Live
A brief file/directory map. Just the ones someone would need to start working here.

### Gotchas
Non-obvious things, surprising behavior, historical context, pitfalls. Skip this section if there's nothing worth calling out.

## Communication Style

- Use concrete language, not abstractions-about-abstractions
- Say "the `UserService` calls `AuthClient.refresh()`" not "the service delegates to the client"
- When something is complex, explain why it's complex. Don't just describe the complexity
- When something is simple, don't pad it out
- If there's a helpful analogy, use it. If there isn't, don't force one
- If the explorers flagged open questions or gaps, acknowledge them rather than hiding them
