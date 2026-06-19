#!/usr/bin/env sh

# Run frontend and backend together in the background.
# Usage: ./start.sh

cd "$(dirname "$0")" || exit 1

printf "Starting backend...\n"
(cd backend && npm run dev) &
backend_pid=$!

printf "Starting frontend...\n"
(cd frontend && npm run dev) &
frontend_pid=$!

printf "Backend PID: %s\nFrontend PID: %s\n" "$backend_pid" "$frontend_pid"
printf "Press Ctrl+C to stop both processes.\n"

trap 'printf "Stopping...\n"; kill "$backend_pid" "$frontend_pid"; exit' INT TERM
wait "$backend_pid" "$frontend_pid"
