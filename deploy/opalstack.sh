#!/usr/bin/env bash
# Publishes the checkout to Opalstack. Run by .github/workflows/deploy.yml on
# every push to main, with SSH already set up and the targets in the
# environment. www/ and labor/ go to the static apps; server/ goes to the lab
# API app, whose database is backed up before the server is restarted. The
# API's data/, config.json, projects.json and node_modules are never overwritten.
set -euo pipefail
: "${SSH_TARGET:?}" "${WWW_DIR:?}" "${LABOR_DIR:?}" "${API_DIR:?}"

cd "$(dirname "$0")/.."
ssh_cmd="ssh -o BatchMode=yes"
delete=()
[ "${RSYNC_DELETE:-0}" = 1 ] && delete=(--delete)

rsync -rlt --exclude='.*' "${delete[@]}" -e "$ssh_cmd" www/ "$SSH_TARGET:$WWW_DIR/"
rsync -rlt --exclude='.*' "${delete[@]}" -e "$ssh_cmd" labor/ "$SSH_TARGET:$LABOR_DIR/"
rsync -rlt --exclude='.*' --exclude=node_modules --exclude=data --exclude=config.json --exclude=projects.json \
  "${delete[@]}" -e "$ssh_cmd" server/ "$SSH_TARGET:$API_DIR/"

# The API only accepts projects that have a folder in labor/.
find labor -mindepth 1 -maxdepth 1 -type d ! -name '.*' -printf '%f\n' | sort \
  | python3 -c 'import json, sys; print(json.dumps(sys.stdin.read().split()))' \
  | $ssh_cmd "$SSH_TARGET" "cat > '$API_DIR/projects.json'"

$ssh_cmd "$SSH_TARGET" "cd '$API_DIR' && node backup.js && npm ci --omit=dev --no-audit --no-fund --loglevel=error && ./run.sh restart"
