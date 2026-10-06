#!/usr/bin/env bash
# Starts the lab server on Opalstack (a "Custom/Proxy port" app) and keeps it
# up. Run from the app's crontab, so it also comes back after a server reboot:
#   @reboot      ~/apps/suvemaeweb_laborapi/server/run.sh
#   */5 * * * *  ~/apps/suvemaeweb_laborapi/server/run.sh
# `run.sh restart` stops the running copy first (the deploy uses this).
# Settings, including the port Opalstack gave the app, are in config.json.
set -euo pipefail

cd "$(dirname "$0")"
mkdir -p data
pidfile=data/server.pid

running() {
  [ -f "$pidfile" ] && kill -0 "$(cat "$pidfile")" 2>/dev/null
}

if [ "${1:-}" = restart ] && running; then
  kill "$(cat "$pidfile")"
  for _ in 1 2 3 4 5 6 7 8 9 10; do running || break; sleep 0.5; done
fi

running && exit 0
LABOR_CONFIG="$PWD/config.json" nohup node server.js >> data/server.log 2>&1 &
echo $! > "$pidfile"
