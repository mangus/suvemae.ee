#!/usr/bin/env bash
# Publishes the checkout to Opalstack. Run by .github/workflows/deploy.yml on
# every push to main, with SSH already set up and the targets in the
# environment; it also works by hand from a machine whose key is in
# suvemaeweb's authorized_keys. DRY_RUN=1 only shows what would change.
#
# www/, labor/ and redirect/ are mirrored onto their static apps: files removed
# from the repository are removed from the server too; only /.well-known/
# (Let's Encrypt) is left alone. server/ goes to the lab API app, whose
# database is backed up before the server is restarted. The API's data/,
# config.json, projects.json and node_modules are never overwritten.
set -euo pipefail
: "${SSH_TARGET:?}" "${WWW_DIR:?}" "${LABOR_DIR:?}" "${REDIRECT_DIR:?}" "${API_DIR:?}"

cd "$(dirname "$0")/.."
ssh_cmd="ssh -o BatchMode=yes"
rsync_flags=(--recursive --links --times --checksum --compress --itemize-changes -e "$ssh_cmd")
[ "${DRY_RUN:-0}" = 1 ] && rsync_flags+=(--dry-run)

mirror() {
  echo "## $1/ -> $2"
  rsync "${rsync_flags[@]}" --delete --exclude=/.well-known/ "$1/" "$SSH_TARGET:$2/"
}

mirror www "$WWW_DIR"
mirror labor "$LABOR_DIR"
mirror redirect "$REDIRECT_DIR"

echo "## server/ -> $API_DIR"
rsync "${rsync_flags[@]}" --exclude=node_modules --exclude=data --exclude=config.json --exclude=projects.json \
  server/ "$SSH_TARGET:$API_DIR/"
[ "${DRY_RUN:-0}" = 1 ] && exit 0

# The API only accepts projects that have a folder in labor/.
find labor -mindepth 1 -maxdepth 1 -type d ! -name '.*' -printf '%f\n' | sort \
  | python3 -c 'import json, sys; print(json.dumps(sys.stdin.read().split()))' \
  | $ssh_cmd "$SSH_TARGET" "cat > '$API_DIR/projects.json'"

# Opalstack's default node is too old for node:sqlite; use the Node 22 it ships.
echo "## restarting the lab API"
$ssh_cmd "$SSH_TARGET" "export PATH=/opt/nodejs22/bin:\$PATH && cd '$API_DIR' \
  && node backup.js && npm ci --omit=dev --no-audit --no-fund --loglevel=error && ./run.sh restart"
