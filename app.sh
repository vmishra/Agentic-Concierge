#!/usr/bin/env bash
#
# Agent Concierge — one-shot lifecycle script.
#
#   ./app.sh start     install deps if missing, start dev server, wait until ready
#   ./app.sh stop      kill the dev server (and any descendants on the port)
#   ./app.sh restart   stop then start
#   ./app.sh status    report state and URL
#   ./app.sh logs      tail the running log
#   ./app.sh build     production build into dist/
#
# PORT env var overrides the default 5173.

set -eu

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PID_FILE="$ROOT/.app.pid"
LOG_FILE="$ROOT/.app.log"
PORT="${PORT:-5173}"

c_dim="\033[2m"; c_accent="\033[38;5;180m"; c_ok="\033[38;5;108m"; c_err="\033[38;5;174m"; c_reset="\033[0m"

say()  { printf "%b%s%b\n" "$c_accent" "$1" "$c_reset"; }
ok()   { printf "%b✓%b %s\n" "$c_ok" "$c_reset" "$1"; }
warn() { printf "%b!%b %s\n" "$c_err" "$c_reset" "$1"; }
dim()  { printf "%b%s%b\n" "$c_dim" "$1" "$c_reset"; }

ensure_node() {
  if ! command -v node >/dev/null 2>&1; then
    warn "node not found on PATH"
    case "$(uname -s)" in
      Darwin*) dim "  install with Homebrew:   brew install node" ;;
      Linux*)  dim "  install with nvm:        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash && nvm install 20" ;;
      *)       dim "  download Node 20+ from https://nodejs.org" ;;
    esac
    dim "  then re-run:             ./app.sh start"
    exit 1
  fi

  # Require Node 20+.
  local major
  major="$(node -p 'parseInt(process.versions.node.split(".")[0], 10)' 2>/dev/null || echo 0)"
  if [ "$major" -lt 20 ] 2>/dev/null; then
    warn "node $(node --version) is too old — Node 20+ is required"
    dim "  upgrade and re-run ./app.sh start"
    exit 1
  fi

  if ! command -v npm >/dev/null 2>&1; then
    warn "npm not found on PATH (should ship with Node)"
    exit 1
  fi
}

port_pids() {
  if command -v lsof >/dev/null 2>&1; then
    lsof -nP -t -i:"$PORT" 2>/dev/null || true
  fi
}

start() {
  ensure_node

  if [ -n "$(port_pids)" ]; then
    ok "already running — http://localhost:$PORT/"
    exit 0
  fi

  # First run: install dependencies. Also re-install if package.json is
  # newer than node_modules (common when pulling changes that updated deps).
  local needs_install=0
  if [ ! -d "$ROOT/node_modules" ]; then
    needs_install=1
  elif [ "$ROOT/package-lock.json" -nt "$ROOT/node_modules" ] 2>/dev/null; then
    needs_install=1
  elif [ "$ROOT/package.json" -nt "$ROOT/node_modules" ] 2>/dev/null; then
    needs_install=1
  fi
  if [ "$needs_install" = 1 ]; then
    say "→ installing dependencies"
    (cd "$ROOT" && npm install)
  fi

  say "→ starting Agent Concierge on :$PORT"
  (cd "$ROOT" && nohup npm run dev -- --port "$PORT" >"$LOG_FILE" 2>&1 & echo $! >"$PID_FILE")

  printf "  waiting for the server"
  for _ in $(seq 1 45); do
    printf "."
    if curl -sSf "http://localhost:$PORT/" >/dev/null 2>&1; then
      printf "\n"
      ok "ready at http://localhost:$PORT/"
      dim "  logs:  ./app.sh logs    stop:  ./app.sh stop"
      exit 0
    fi
    sleep 1
  done
  printf "\n"
  warn "did not come up in 45s — tail $LOG_FILE for clues"
  exit 1
}

stop() {
  stopped=0
  if [ -f "$PID_FILE" ]; then
    pid="$(cat "$PID_FILE")"
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
      pkill -P "$pid" 2>/dev/null || true
      stopped=1
    fi
    rm -f "$PID_FILE"
  fi
  pids="$(port_pids)"
  if [ -n "$pids" ]; then
    # shellcheck disable=SC2086
    kill $pids 2>/dev/null || true
    stopped=1
  fi
  if [ "$stopped" = 1 ]; then
    ok "stopped"
  else
    dim "not running"
  fi
}

status() {
  pids="$(port_pids)"
  if [ -n "$pids" ]; then
    ok "running — http://localhost:$PORT/"
    dim "  pids: $(echo "$pids" | tr '\n' ' ')"
  else
    dim "not running"
  fi
}

logs() {
  if [ ! -f "$LOG_FILE" ]; then
    warn "no log yet — start the app first"
    exit 1
  fi
  tail -f "$LOG_FILE"
}

build() {
  ensure_node
  if [ ! -d "$ROOT/node_modules" ]; then
    say "→ installing dependencies"
    (cd "$ROOT" && npm install)
  fi
  say "→ production build"
  (cd "$ROOT" && npm run build)
  ok "dist/ ready"
}

case "${1:-}" in
  start)   start ;;
  stop)    stop ;;
  restart) stop; start ;;
  status)  status ;;
  logs)    logs ;;
  build)   build ;;
  *)
    cat <<USAGE
Agent Concierge — lifecycle

  ./app.sh start      install + start dev server, wait until ready
  ./app.sh stop       kill the dev server
  ./app.sh restart    stop then start
  ./app.sh status     show state + URL
  ./app.sh logs       tail the running log
  ./app.sh build      production build into dist/

  PORT=5174 ./app.sh start   override the default 5173
USAGE
    exit 1
    ;;
esac
