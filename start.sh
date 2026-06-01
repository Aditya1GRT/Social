#!/bin/bash
# Start backend and frontend together

BACKEND_DIR="$(dirname "$0")/backend"
FRONTEND_DIR="$(dirname "$0")/TheSocialScoop-master/TheSocialScoop-master"

echo "Starting backend on port 5000..."
cd "$BACKEND_DIR" && node server.js &
BACKEND_PID=$!

echo "Waiting for backend to be ready..."
sleep 2

echo "Starting frontend on port 3000..."
cd "$FRONTEND_DIR" && npm start &
FRONTEND_PID=$!

echo ""
echo "======================================"
echo " Backend:  http://localhost:5000"
echo " Frontend: http://localhost:3000"
echo "======================================"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
