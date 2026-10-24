# Incident & Postmortem Context

Use these incident-oriented queries only within the investigator's assigned, authorized source. Labels and channel names are examples to discover, not assumed workspace conventions. Record cross-source links as leads for a separate pass; do not post messages or change incident records.

- **Linear**: look for tickets labeled `incident`, `sev-*`, `postmortem-action-item`, `reliability`
- **Slack**: search `#sev-*` and `#incident-*` channels around the dates the target code was added
- **Git**: commits with messages like "fix for incident", "add defensive check", "revert" followed by "re-apply with..." are strong signals
