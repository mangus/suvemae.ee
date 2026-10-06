#!/usr/bin/env bash
# Runs on the agent server every minute (suvemae-sync.timer): fast-forwards the
# main checkout and, when main has moved, refreshes the preview server and
# publishes to Opalstack.
set -euo pipefail

MAIN=${SUVEMAE_MAIN:-/srv/suvemae/main}
STATE=${SUVEMAE_STATE:-/srv/suvemae/state}
OPALSTACK_ENV=${OPALSTACK_ENV:-/etc/suvemae/opalstack.env}

mkdir -p "$STATE"
exec 9>"$STATE/sync.lock"
flock -n 9 || exit 0

cd "$MAIN"
git fetch -q origin main
new=$(git rev-parse origin/main)
old=$(cat "$STATE/deployed" 2>/dev/null || true)
[ "$new" = "$old" ] && exit 0

git merge -q --ff-only origin/main

if [ -z "$old" ] || ! git diff --quiet "$old" "$new" -- server deploy/preview.json; then
  (cd server && npm ci --omit=dev --no-audit --no-fund --loglevel=error)
  systemctl restart suvemae-preview
fi

if [ -f "$OPALSTACK_ENV" ]; then
  "$MAIN/deploy/opalstack.sh"
fi

echo "$new" > "$STATE/deployed"
echo "Published $(git log -1 --format='%h %s' "$new")"
