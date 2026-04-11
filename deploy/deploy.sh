#!/bin/bash
# TetrisOS auto-deploy script
# Triggered by GitHub webhook on push to main

set -euo pipefail

REPO_DIR="/home/jake/TetrisOS"
COMPOSE_DIR="$REPO_DIR/packages/twenty-docker"
LOG_FILE="/home/jake/TetrisOS/deploy/deploy.log"

log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG_FILE"
}

log "=== Deploy triggered ==="

cd "$REPO_DIR"

# Pull latest
log "Pulling latest from origin/main..."
git fetch origin main
git reset --hard origin/main

# Build and deploy
log "Building from source and deploying..."
cd "$COMPOSE_DIR"
docker compose build server
docker compose up -d --force-recreate

log "Waiting for health check..."
sleep 10

if curl -sf http://localhost:8080/healthz > /dev/null 2>&1; then
  log "✅ Deploy successful — server healthy"
else
  log "⚠️ Deploy completed but health check failed — check logs"
fi

log "=== Deploy complete ==="
