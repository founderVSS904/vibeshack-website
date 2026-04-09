#!/bin/bash
# VibeShack production server with auto-restart
cd /root/.openclaw/workspace/vibeshack-website

while true; do
  echo "[$(date)] Starting VibeShack server..."
  PORT=3000 NODE_OPTIONS="--max-old-space-size=4096" npm run start
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE. Restarting in 3 seconds..."
  sleep 3
done
