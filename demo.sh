#!/bin/bash

# ThermoNet Demo Setup Script
# This script sets up a complete demo environment with mock data

set -e

echo "🌡️  ThermoNet Demo Setup Starting..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check dependencies
check_dependency() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 is required but not installed${NC}"
        exit 1
    fi
}

echo -e "${BLUE}🔍 Checking dependencies...${NC}"
check_dependency "node"
check_dependency "npm"
check_dependency "solana"
check_dependency "anchor"

# Setup Solana localnet
echo -e "${BLUE}🚀 Starting Solana localnet...${NC}"
pkill -f solana-test-validator || true
sleep 2

solana-test-validator --reset --quiet &
VALIDATOR_PID=$!
echo "Validator PID: $VALIDATOR_PID"

# Wait for validator to start
echo -e "${YELLOW}⏳ Waiting for validator to start...${NC}"
sleep 10

# Configure Solana CLI for localnet
solana config set --url localhost --keypair ~/.config/solana/id.json

# Airdrop SOL to default keypair
echo -e "${BLUE}💰 Airdropping SOL...${NC}"
solana airdrop 10

# Build and deploy Anchor program
echo -e "${BLUE}🔨 Building Anchor program...${NC}"
anchor build

echo -e "${BLUE}🚀 Deploying to localnet...${NC}"
anchor deploy --provider.cluster localnet

# Install frontend dependencies
echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
cd frontend
npm install
cd ..

# Seed demo data
echo -e "${BLUE}🌱 Seeding demo data...${NC}"
node scripts/seed-demo-data.js

# Start frontend
echo -e "${BLUE}🌐 Starting frontend...${NC}"
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Wait a moment for everything to start
sleep 5

echo -e "${GREEN}✅ Demo setup complete!${NC}"
echo -e "${GREEN}🌐 Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}🔗 Solana Explorer: https://explorer.solana.com/?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899${NC}"
echo ""
echo -e "${YELLOW}Demo Features:${NC}"
echo "• Interactive temperature heatmap"
echo "• Real-time device dashboard"
echo "• Mock sensor readings with live updates"
echo "• API query examples"
echo "• Token reward visualization"
echo ""
echo -e "${YELLOW}To stop demo:${NC}"
echo "kill $VALIDATOR_PID $FRONTEND_PID"

# Keep script running
echo -e "${BLUE}🔄 Demo running... Press Ctrl+C to stop${NC}"
trap "kill $VALIDATOR_PID $FRONTEND_PID 2>/dev/null; exit" INT

wait