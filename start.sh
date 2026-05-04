#!/bin/bash
# Bahrain HRMS — Start both servers
source ~/.nvm/nvm.sh 2>/dev/null || true

# Kill anything on these ports first
fuser -k 5000/tcp 2>/dev/null
fuser -k 5173/tcp 2>/dev/null
sleep 1

echo "Starting Bahrain HRMS..."

# Backend
cd /mnt/c/Users/m2med/OneDrive/Desktop/Hr/bahrain-hrms/backend
npm run dev &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 6

# Frontend
cd /mnt/c/Users/m2med/OneDrive/Desktop/Hr/bahrain-hrms/frontend
npm run dev -- --host &
FRONTEND_PID=$!

echo ""
echo "✅ Backend  → http://localhost:5000"
echo "✅ Frontend → http://192.168.190.228:5173"
echo ""
echo "Press Ctrl+C to stop both servers."

# Keep running until Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Servers stopped.'; exit" INT
wait
