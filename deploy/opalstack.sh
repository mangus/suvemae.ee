#!/usr/bin/env bash
# Publishes the current checkout to Opalstack: www/ and labor/ as static files,
# server/ as the lab API app, which is then restarted. Settings come from
# /etc/suvemae/opalstack.env (see opalstack.env.example). The API database
# lives in the app's data/ folder on Opalstack and is never overwritten.
set -euo pipefail

# shellcheck source=/dev/null
source "${OPALSTACK_ENV:-/etc/suvemae/opalstack.env}"
: "${STATIC_SSH:?}" "${WWW_DIR:?}" "${LABOR_DIR:?}" "${API_SSH:?}" "${API_DIR:?}" "${API_RESTART:?}"

cd "$(dirname "$0")/.."
ssh_cmd="ssh -i ${SSH_KEY:-/root/.ssh/suvemae_opalstack} -o IdentitiesOnly=yes -o BatchMode=yes"
delete=()
[ "${RSYNC_DELETE:-0}" = 1 ] && delete=(--delete)

rsync -rlt --exclude='.*' "${delete[@]}" -e "$ssh_cmd" www/ "$STATIC_SSH:$WWW_DIR/"
rsync -rlt --exclude='.*' "${delete[@]}" -e "$ssh_cmd" labor/ "$STATIC_SSH:$LABOR_DIR/"
rsync -rlt --exclude='.*' --exclude=node_modules --exclude=data --exclude=config.json --exclude=projects.json \
  -e "$ssh_cmd" server/ "$API_SSH:$API_DIR/"

# The API only accepts projects that have a folder in labor/.
find labor -mindepth 1 -maxdepth 1 -type d ! -name '.*' -printf '%f\n' | sort \
  | python3 -c 'import json, sys; print(json.dumps(sys.stdin.read().split()))' \
  | $ssh_cmd "$API_SSH" "cat > '$API_DIR/projects.json'"

$ssh_cmd "$API_SSH" "cd '$API_DIR' && npm ci --omit=dev --no-audit --no-fund --loglevel=error && $API_RESTART"
