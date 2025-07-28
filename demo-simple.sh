#!/bin/bash

# ThermoNet Simple Demo Setup Script
# This script runs the frontend demo without requiring Solana CLI

set -e

echo "🌡️  ThermoNet Simple Demo Setup Starting..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is required but not installed${NC}"
    echo -e "${YELLOW}Please install Node.js from https://nodejs.org${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is required but not installed${NC}"
    echo -e "${YELLOW}Please install npm (usually comes with Node.js)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js and npm found${NC}"

# Install frontend dependencies
echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing packages for the first time...${NC}"
    npm install
else
    echo -e "${GREEN}Dependencies already installed${NC}"
fi

# Create a simple mock API server
echo -e "${BLUE}🚀 Setting up mock API server...${NC}"
cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Mock temperature data
const mockData = Array.from({length: 150}, (_, i) => {
  const lat = 37.7749 + (Math.random() - 0.5) * 0.5;
  const lng = -122.4194 + (Math.random() - 0.5) * 0.5;
  const temp = 15 + Math.random() * 15;
  
  return {
    id: i,
    lat: parseFloat(lat.toFixed(6)),
    lng: parseFloat(lng.toFixed(6)),
    temperature: parseFloat(temp.toFixed(1)),
    pressure: parseFloat((1010 + (Math.random() - 0.5) * 20).toFixed(1)),
    timestamp: Date.now() - Math.random() * 3600000,
    deviceId: `DX${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
    hexId: Math.random().toString(16).substr(2, 8),
    confidence: Math.floor(75 + Math.random() * 25),
    accuracy: parseFloat((2 + Math.random() * 8).toFixed(1)),
    nonce: Math.floor(Math.random() * 1000000)
  };
});

// API endpoints
app.get('/api/temperatures', (req, res) => {
  res.json(mockData);
});

app.get('/api/stats', (req, res) => {
  res.json({
    totalDevices: mockData.length,
    totalReadings: mockData.length * 144,
    avgTemperature: mockData.reduce((sum, d) => sum + d.temperature, 0) / mockData.length,
    tempTokens: mockData.length * 2000
  });
});

app.listen(port, () => {
  console.log(`🌐 Mock API server running on http://localhost:${port}`);
});
EOF

# Install express and cors if not present
if ! npm list express &> /dev/null; then
    echo -e "${YELLOW}Installing Express server...${NC}"
    npm install express cors --no-save
fi

# Start the mock API server
echo -e "${BLUE}🌐 Starting mock API server...${NC}"
node server.js &
API_PID=$!

# Wait for API to start
sleep 2

# Start the React development server
echo -e "${BLUE}🚀 Starting React frontend...${NC}"
npm start &
FRONTEND_PID=$!

# Wait for everything to start
sleep 5

echo -e "${GREEN}✅ ThermoNet demo is now running!${NC}"
echo ""
echo -e "${GREEN}🌐 Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}📡 Mock API: http://localhost:3001/api/temperatures${NC}"
echo ""
echo -e "${YELLOW}Demo Features:${NC}"
echo "• Interactive temperature heatmap with 150+ sensors"
echo "• Real-time data visualization and analytics"
echo "• Device dashboard with network statistics"
echo "• Beautiful, responsive UI with smooth animations"
echo "• Mock Solana integration (frontend only)"
echo ""
echo -e "${BLUE}💡 This is a frontend-only demo with simulated data${NC}"
echo -e "${BLUE}   For full blockchain integration, install Solana CLI${NC}"
echo ""
echo -e "${YELLOW}To stop demo:${NC}"
echo "kill $API_PID $FRONTEND_PID"
echo ""
echo -e "${BLUE}🔄 Demo running... Press Ctrl+C to stop${NC}"

# Keep script running and handle cleanup
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping demo...${NC}"
    kill $API_PID $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Demo stopped${NC}"
    exit 0
}

trap cleanup INT

# Wait for processes
wait