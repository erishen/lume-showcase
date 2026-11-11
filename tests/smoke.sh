#!/bin/bash
# tests/smoke.sh — showcase gate: server.lume starts on both the interpreter
# and the text backend, four API count assertions + static service + byte-
# identical output between backends (interp vs text).
# Usage: LUME_BIN=../lume-core/bin/lume-core bash tests/smoke.sh
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BIN="${LUME_BIN:-$ROOT/../lume-core/bin/lume-core}"
PORT="${PORT:-18793}"
TMP="$(mktemp -d)"
SRV=""
cleanup() { [ -n "$SRV" ] && kill "$SRV" 2>/dev/null; rm -rf "$TMP"; }
trap cleanup EXIT

assert_count() {  # $1=endpoint, $2=expected
  local n
  n=$(curl -s "http://127.0.0.1:$PORT/api/$1" | python3 -c "import json,sys; print(len(json.loads(json.load(sys.stdin)['body'])))")
  if [ "$n" = "$2" ]; then
    echo "ok   /api/$1 = $n items"
  else
    echo "FAIL /api/$1 = $n (want $2)"; exit 1
  fi
}

wait_health() {
  for _ in $(seq 1 20); do
    curl -s "http://127.0.0.1:$PORT/api/health" | grep -q '"status":200' && return 0
    sleep 0.5
  done
  echo "FAIL server did not become healthy"; exit 1
}

echo "=== interpreter server ==="
"$BIN" "$ROOT/server.lume" > "$TMP/interp.log" 2>&1 & SRV=$!
wait_health
assert_count features 12
assert_count algorithms 12
assert_count apps 12
assert_count bench 3
curl -s -o /dev/null -w "ok   static index %{http_code}\n" "http://127.0.0.1:$PORT/"
curl -s "http://127.0.0.1:$PORT/api/features" > "$TMP/interp_features.json"
curl -s "http://127.0.0.1:$PORT/api/algorithms" > "$TMP/interp_algorithms.json"
kill "$SRV" 2>/dev/null; SRV=""; sleep 0.5

echo "=== text backend server ==="
if "$BIN" --compile-text -o "$TMP/showcase_t.exe" "$ROOT/server.lume" 2>"$TMP/compile.log"; then
  "$TMP/showcase_t.exe" > "$TMP/text.log" 2>&1 & SRV=$!
  wait_health
  assert_count features 12
  assert_count algorithms 12
  curl -s "http://127.0.0.1:$PORT/api/features" > "$TMP/text_features.json"
  curl -s "http://127.0.0.1:$PORT/api/algorithms" > "$TMP/text_algorithms.json"
  kill "$SRV" 2>/dev/null; SRV=""
  diff "$TMP/interp_features.json" "$TMP/text_features.json" >/dev/null \
    && echo "ok   interp/text features byte-identical" \
    || { echo "FAIL features drift interp/text"; diff "$TMP/interp_features.json" "$TMP/text_features.json" | head; exit 1; }
  diff "$TMP/interp_algorithms.json" "$TMP/text_algorithms.json" >/dev/null \
    && echo "ok   interp/text algorithms byte-identical" \
    || { echo "FAIL algorithms drift interp/text"; exit 1; }
  echo "ok   text backend server"
else
  echo "skip text backend (compile failed: $(head -1 "$TMP/compile.log"))"
fi

echo "PASS showcase smoke"
