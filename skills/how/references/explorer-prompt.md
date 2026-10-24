# Explorer Prompt Template

Use this template for an ordinary explorer worker or a direct scoped pass. Fill in the placeholders and supply the original project root and effective configuration.

---

Other slices may be investigated concurrently or sequentially. Focus on your assigned angle and go deep. Keep the work read-only, use the host's read and search capabilities under repository rules, and do not require nested workers. Report inaccessible evidence and open questions without inventing verification.

## Question

> {QUESTION}

## Your Exploration Angle

{EXPLORATION_ANGLE}

## Output

### Components Found
The key types, services, classes, and abstractions. For each: name, file path, and a one-sentence description of what it does.

### Flow
The execution flow step by step. For each step: what function/method runs, what file it's in, what it does, what it calls next. Include the data that flows between steps.

### Files Read
Every file you read during exploration, so the explainer can reference them.

### Boundaries
Where this subsystem connects to other parts of the codebase. The inputs and outputs.

### Non-Obvious Things
Anything surprising, historically motivated, or easy to get wrong. Things that look like they should work one way but work another.

### Open Questions
Anything you couldn't fully trace or understand. Be honest about gaps.
