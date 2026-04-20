#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${GREEN}=== The Dead Man's Snitch - Project Launcher ===${NC}"
echo ""

# Check if backend/.env exists, if not copy from .env.example
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  backend/.env not found. Copying from .env.example...${NC}"
    cp .env.example backend/.env
    echo -e "${YELLOW}⚠️  Please fill in your API keys in backend/.env before running the services!${NC}"
    echo ""
fi

# Check if Python dependencies are installed (check for fastapi)
echo "Checking Python dependencies..."
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Python dependencies not found. Installing from requirements.txt...${NC}"
    pip install -r backend/requirements.txt
    echo -e "${GREEN}✓ Python dependencies installed${NC}"
    echo ""
fi

# Check if frontend/node_modules exists, if not run npm install
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  frontend/node_modules not found. Running npm install...${NC}"
    cd frontend && npm install
    cd ..
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
    echo ""
fi

# Array to store background process PIDs
PIDS=()

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down all services...${NC}"
    for pid in "${PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null
            wait "$pid" 2>/dev/null
        fi
    done
    echo -e "${GREEN}✓ All services stopped${NC}"
    exit 0
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

echo -e "${GREEN}Starting all services...${NC}"
echo ""

# Start FastAPI backend server
echo -e "${GREEN}Starting backend server...${NC}"
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8000 &
PIDS+=($!)
cd ..

# Give backend a moment to start
sleep 1

# Start snitch_bot monitor
echo -e "${GREEN}Starting snitch bot...${NC}"
cd backend
python3 snitch_bot.py &
PIDS+=($!)
cd ..

# Start Next.js frontend dev server
echo -e "${GREEN}Starting frontend...${NC}"
cd frontend
npm run dev &
PIDS+=($!)
cd ..

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}All services started successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Backend API:     ${YELLOW}http://localhost:8000${NC}"
echo -e "Snitch Bot:      ${YELLOW}Running in background${NC}"
echo -e "Frontend:        ${YELLOW}http://localhost:3000${NC}"
echo ""
echo -e "Press ${YELLOW}Ctrl+C${NC} to stop all services"
echo ""

# Wait for all background processes
wait
