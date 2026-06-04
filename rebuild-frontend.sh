#!/bin/bash
# Rebuild the committed production frontend for the single-service Render deploy.
#
# The build is committed to the repo so Render's free tier never runs the
# memory-heavy React build (it peaks ~1 GB and gets OOM-killed on the 512 MB
# free tier). Run this whenever you change the UI, then commit the result.
#
# The build is baked with same-origin URLs (API at /api/, Socket.io same origin),
# so the output is portable to any host — localhost, Render, or a custom domain.
set -e

FRONTEND_DIR="$(dirname "$0")/TheSocialScoop-master/TheSocialScoop-master"
cd "$FRONTEND_DIR"

echo "Installing frontend deps (if needed)..."
npm install

echo "Building production bundle (same-origin, no source maps)..."
REACT_APP_API_URL=/api/ REACT_APP_SOCKET_URL= GENERATE_SOURCEMAP=false npm run build

echo ""
echo "Build complete -> $FRONTEND_DIR/build"
echo "Commit it so Render picks it up:"
echo "    git add TheSocialScoop-master/TheSocialScoop-master/build"
echo "    git commit -m 'Update frontend build'"
echo "    git push"
