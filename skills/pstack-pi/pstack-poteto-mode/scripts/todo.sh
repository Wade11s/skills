#!/usr/bin/env bash
# pstack run todo: a file-based plan for one run.
#
# State lives at ${PSTACK_STATE_DIR:-.pstack}/<slug>/todo.md.
# The file format is:
#
#   # pstack todo: <title>
#   <!-- pstack:todo v1 -->
#   - [ ] 01 frame - done means: ...
#   - [x] 02 repro - repro fails at HEAD (done 2026-01-01T00:00:00Z)
#
# A phase is not complete until `done` exits 0. The file wins over the reply.

set -euo pipefail

usage() {
  cat <<'USAGE'
usage: todo.sh <command> <slug> [args]

  init <slug> "<title>"            create the run's todo.md
  add <slug> "<text>"              append an open step, print its id
  done <slug> <id> [--note "<n>"]  mark a step complete
  open <slug>                      print open steps as: id<TAB>text
  check <slug>                     validate the file format

State root: ${PSTACK_STATE_DIR:-.pstack}
USAGE
}

die() {
  printf 'todo.sh: %s\n' "$1" >&2
  exit 1
}

state_root() {
  printf '%s' "${PSTACK_STATE_DIR:-.pstack}"
}

run_dir() {
  printf '%s/%s' "$(state_root)" "$1"
}

file_of() {
  printf '%s/todo.md' "$(run_dir "$1")"
}

slug_check() {
  case "$1" in
    "" | */* | *..* | *" "*) die "invalid slug: $1" ;;
  esac
}

one_line() {
  case "$1" in
    *$'\n'* | *$'\r'*) die "$2 must be a single line" ;;
  esac
}

id_check() {
  case "$1" in
    "" | *[!0-9]*) die "id must be digits: $1" ;;
  esac
}

LOCKDIR=""
LOCK_SPINS="${PSTACK_LOCK_SPINS:-200}"

steal_lock() {
  mv "$1" "$1.stale.$$" 2>/dev/null || return 1
  rm -rf "$1.stale.$$"
}

release() {
  [ -n "$LOCKDIR" ] || return 0
  rm -rf "$LOCKDIR" 2>/dev/null || true
  LOCKDIR=""
}

acquire() {
  local lock="$1.lock" i=0 owner
  trap 'release' EXIT
  trap 'release; exit 143' TERM
  trap 'release; exit 130' INT
  while ! mkdir "$lock" 2>/dev/null; do
    if [ -f "$lock/pid" ]; then
      owner=$(cat "$lock/pid" 2>/dev/null || true)
      if [ -n "$owner" ] && ! kill -0 "$owner" 2>/dev/null; then
        steal_lock "$lock" && continue
      fi
    fi
    i=$((i + 1))
    if [ "$i" -gt "$LOCK_SPINS" ]; then
      # No pid after a full timeout cannot be a live holder: it writes one immediately.
      if [ ! -s "$lock/pid" ]; then
        steal_lock "$lock" && continue
      fi
      die "lock is held by a live process: $lock"
    fi
    sleep 0.05
  done
  printf '%s\n' "$$" >"$lock/pid"
  LOCKDIR="$lock"
}

next_id() {
  local max
  max=$(sed -n 's/^- \[[ x]\] \([0-9][0-9]*\) .*/\1/p' "$1" | sort -n | tail -1)
  printf '%02d' $((10#${max:-0} + 1))
}

has_step() {
  # Compare against a literal step text, ignoring the trailing done marker.
  STEP_TEXT="$2" awk '
    BEGIN { target = ENVIRON["STEP_TEXT"] }
    /^- \[[ x]\] [0-9][0-9]* / {
      line = $0
      sub(/^- \[[ x]\] [0-9][0-9]* /, "", line)
      sub(/ \(done [0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]T[0-9:]+Z(: .*)?\)$/, "", line)
      if (line == target) found = 1
    }
    END { exit found ? 0 : 1 }
  ' "$1"
}

has_id() {
  ID="$2" awk '
    BEGIN { id = ENVIRON["ID"] }
    index($0, "- [ ] " id " ") == 1 { open = 1 }
    index($0, "- [x] " id " ") == 1 { done = 1 }
    END { exit (open && !done) ? 0 : 1 }
  ' "$1"
}

cmd_init() {
  local slug="${1:-}" title="${2:-}" force="${3:-}" dir
  [ -n "$slug" ] || die "slug is required"
  [ -n "$title" ] || die "title is required"
  one_line "$title" "title"
  slug_check "$slug"
  dir=$(run_dir "$slug")
  mkdir -p "$dir"
  local file
  file=$(file_of "$slug")
  if [ -f "$file" ] && [ "$force" != "--force" ]; then
    die "already exists: $file (use --force to reset)"
  fi
  printf '# pstack todo: %s\n<!-- pstack:todo v1 -->\n' "$title" >"$file"
  printf '%s/todo.md\n' "$(cd "$dir" && pwd)"
}

cmd_add() {
  local slug="${1:-}" text="${2:-}" file id
  [ -n "$slug" ] || die "slug is required"
  [ -n "$text" ] || die "text is required"
  one_line "$text" "step text"
  slug_check "$slug"
  file=$(file_of "$slug")
  [ -f "$file" ] || die "no todo file; run init first"
  acquire "$file"
  if has_step "$file" "$text"; then
    die "duplicate step: $text"
  fi
  id=$(next_id "$file")
  printf -- '- [ ] %s %s\n' "$id" "$text" >>"$file"
  release
  printf '%s\n' "$id"
}

cmd_done() {
  local slug="${1:-}" id="${2:-}" note="" file ts
  [ -n "$slug" ] || die "slug is required"
  [ -n "$id" ] || die "id is required"
  id_check "$id"
  slug_check "$slug"
  shift 2
  while [ $# -gt 0 ]; do
    case "$1" in
      --note)
        [ $# -ge 2 ] || die "--note needs a value"
        one_line "$2" "note"
        note="$2"
        shift 2
        ;;
      *)
        die "unknown argument: $1"
        ;;
    esac
  done
  file=$(file_of "$slug")
  [ -f "$file" ] || die "no todo file; run init first"
  acquire "$file"
  if ! has_id "$file" "$id"; then
    if ID="$id" awk 'index($0, "- [x] " ENVIRON["ID"] " ") == 1 { done = 1 } END { exit done ? 0 : 1 }' "$file"; then
      printf 'already done: %s\n' "$id"
      return 0
    fi
    die "no open step $id"
  fi
  ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  ID="$id" NOTE="$note" TS="$ts" awk '
    BEGIN { id = ENVIRON["ID"]; note = ENVIRON["NOTE"]; ts = ENVIRON["TS"] }
    index($0, "- [ ] " id " ") == 1 {
      line = $0
      sub(/^- \[ \] /, "- [x] ", line)
      suffix = " (done " ts ")"
      if (note != "") suffix = " (done " ts ": " note ")"
      print line suffix
      next
    }
    { print }
  ' "$file" >"$file.tmp"
  mv "$file.tmp" "$file"
  printf 'done: %s\n' "$id"
}

cmd_open() {
  local slug="${1:-}" file
  [ -n "$slug" ] || die "slug is required"
  slug_check "$slug"
  file=$(file_of "$slug")
  [ -f "$file" ] || die "no todo file"
  sed -n 's/^- \[ \] \([0-9][0-9]*\) \(.*\)$/\1\t\2/p' "$file"
}

cmd_check() {
  local slug="${1:-}" file
  [ -n "$slug" ] || die "slug is required"
  slug_check "$slug"
  file=$(file_of "$slug")
  [ -f "$file" ] || die "no todo file"
  awk '
    NR == 1 { if ($0 !~ /^# pstack todo: /) bad = 1 }
    NR == 2 { if ($0 != "<!-- pstack:todo v1 -->") bad = 1 }
    NR > 2 { exit }
    END { if (NR < 2) bad = 1; exit bad ? 1 : 0 }
  ' "$file" || die "bad header or marker"
  awk '
    NR > 2 && NF > 0 {
      if ($0 !~ /^- \[[ x]\] [0-9][0-9]+ .+$/) {
        print "bad line " NR ": " $0
        bad = 1
        next
      }
      line = $0
      sub(/^- \[[ x]\] /, "", line)
      split(line, parts, " ")
      if (seen[parts[1]]++) {
        print "duplicate id " parts[1] " on line " NR
        bad = 1
      }
    }
    END { exit bad ? 1 : 0 }
  ' "$file"
  printf 'ok\n'
}

command="${1:-}"
shift || true
case "$command" in
  init) cmd_init "$@" ;;
  add) cmd_add "$@" ;;
  done) cmd_done "$@" ;;
  open) cmd_open "$@" ;;
  check) cmd_check "$@" ;;
  "" | -h | --help) usage ;;
  *)
    usage >&2
    exit 2
    ;;
esac
