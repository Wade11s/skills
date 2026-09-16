# Triage Labels

The skills use five canonical triage roles. This file maps each role to the
selected tracker's literal label or equivalent representation.

Representation: `<label|metadata|custom-field|workflow-state>`

| Canonical role | Tracker value | Meaning |
|---|---|---|
| `needs-triage` | `<exact value>` | Maintainer must evaluate the request |
| `needs-info` | `<exact value>` | Waiting for reporter information |
| `ready-for-agent` | `<exact value>` | Fully specified and eligible for agent delivery |
| `ready-for-human` | `<exact value>` | Requires human implementation or judgment |
| `wontfix` | `<exact value>` | Will not be actioned |

Use the canonical role in reasoning and the tracker value only at the Adapter
write/read seam. Every value must already exist or have been created through an
explicitly approved setup write.

