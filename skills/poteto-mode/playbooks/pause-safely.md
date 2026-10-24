### Pause safely

**You own a clean stop. Leave a checkpoint a cold-start agent can resume from.** This is explicit only. On "keep going", "going to bed, keep going", or "don't stop", do not pause.

1. Stop at a safe boundary. Finish or back out only your current atomic step without disturbing user work. Start nothing new. Stop workers you created through supported controls; report any that cannot be confirmed stopped.
2. Take no new external or irreversible action merely to pause. Existing publication does not authorize another push or PR mutation.
3. Make authorized edits durable. If commits are allowed, stage only your files and make one clear `wip:` commit; name a broken tree in its body. If commits are forbidden, retain the working tree or an approved local patch and report its state, without stashing or deleting unrelated edits.
4. Write the resume note to an explicit writable store or agreed local scratch path. Capture intent, permissions, the original project root and model context, progress and receipts, state, next steps, key files, and gotchas. Point to an existing decision trail rather than duplicating it. Keep private context out of public artifacts.

**Reply:** where you are in the loop, what's on disk versus still in your head (paths, no diff dumps), the commits you made and whether the tree is clean, and the first action on resume. This is a pause, not a final report.
