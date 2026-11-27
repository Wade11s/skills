#!/usr/bin/env bash
# pstack run todo: a file-based plan for one run.
#
# State lives at ${PSTACK_STATE_DIR:-.pstack}/<slug>/todo.md.
# The file format is:
#
#   # pstack todo: <title>
#   <!-- pstack:todo v1 -->
#   - [ ] 01 frame - done means: ...
#   - [x] 02 repro - repro fails at HEAD (2026-01-01T00:00:00Z)
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

LOCKDIR=""
acquire() {
  local lock="$1.lock" i=0
  while ! mkdir "$lock" 2>/dev/null; do
    i=$((i + 1))
    if [ "$i" -gt 200 ]; then
      die "lock timeout: $lock"
    fi
    sleep 0.05
  done
  LOCKDIR="$lock"
  trap 'rmdir "$LOCKDIR" 2>/dev/null || true' EXIT
}

next_id() {
  local max
  max=$(sed -n 's/^- \[[ x]\] \([0-9][0-9]*\) .*/\1/p' "$1" | sort -n | tail -1)
  printf '%02d' $((10#${max:-0} + 1))
}

cmd_init() {
  local slug="${1:-}" title="${2:-}" force="${3:-}" dir file
  [ -n "$slug" ] || die "slug is required"
  [ -n "$title" ] || die "title is required"
  slug_check "$slug"
  dir=$(run_dir "$slug")
  file=$(file_of "$slug")
  mkdir -p "$dir"
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
  slug_check "$slug"
  file=$(file_of "$slug")
  [ -f "$file" ] || die "no todo file; run init first"
  acquire "$file"
  if sed -n 's/^- \[[ x]\] [0-9][0-9]* //p' "$file" | grep -Fxq -- "$text"; then
    die "duplicate step: $text"
  fi
  id=$(next_id "$file")
  printf -- '- [ ] %s %s\n' "$id" "$text" >>"$file"
  rmdir "$LOCKDIR" 2>/dev/null || true
  LOCKDIR=""
  printf '%s\n' "$id"
}

cmd_done() {
  local slug="${1:-}" id="${2:-}" note="" file ts
  [ -n "$slug" ] || die "slug is required"
  [ -n "$id" ] || die "id is required"
  slug_check "$slug"
  shift 2
  while [ $# -gt 0 ]; do
    case "$1" in
      --note)
        [ $# -ge 2 ] || die "--note needs a value"
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
  if grep -qE "^- \[x\] $id " "$file"; then
    printf 'already done: %s\n' "$id"
    return 0
  fi
  grep -qE "^- \[ \] $id " "$file" || die "no open step $id"
  ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  awk -v id="$id" -v note="$note" -v ts="$ts" '
    index($0, "- [ ] " id " ") == 1 {
      line = $0
      sub(/^- \[ \] /, "- [x] ", line)
      suffix = " (" ts ")"
      if (note != "") suffix = suffix " " note
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
  head -1 "$file" | grep -q '^# pstack todo: ' || die "bad header"
  sed -n '2p' "$file" | grep -q '^<!-- pstack:todo v1 -->$' || die "bad marker"
  awk 'NR > 2 && NF > 0 && $0 !~ /^- \[[ x]\] [0-9][0-9]+ .+$/ {
         print "bad line " NR ": " $0
         bad = 1
       }
       END { exit bad ? 1 : 0 }' "$file"
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
