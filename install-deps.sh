#!/bin/bash

# ThermoNet Dependencies Installation Script

set -e

echo "🔧 Installing ThermoNet Dependencies..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running on supported OS
OS=$(uname -s)
echo -e "${BLUE}🖥️  Detected OS: $OS${NC}"

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Node.js...${NC}"
    
    if [[ "$OS" == "Linux" ]]; then
        # Ubuntu/Debian
        if command -v apt &> /dev/null; then
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
        # Red Hat/CentOS/Fedora
        elif command -v yum &> /dev/null; then
            curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
            sudo yum install -y nodejs npm
        else
            echo -e "${RED}❌ Unsupported Linux distribution${NC}"
            echo -e "${YELLOW}Please install Node.js manually from https://nodejs.org${NC}"
            exit 1
        fi
    elif [[ "$OS" == "Darwin" ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install node
        else
            echo -e "${YELLOW}Please install Homebrew first or download Node.js from https://nodejs.org${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Unsupported operating system: $OS${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Node.js already installed: $(node --version)${NC}"
fi

# Install Rust if not present (for optional Solana development)
if ! command -v rustc &> /dev/null; then
    echo -e "${YELLOW}🦀 Installing Rust...${NC}"
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source ~/.cargo/env
    echo -e "${GREEN}✅ Rust installed${NC}"
else
    echo -e "${GREEN}✅ Rust already installed: $(rustc --version)${NC}"
fi

# Install Solana CLI (optional)
echo -e "${YELLOW}⚡ Installing Solana CLI...${NC}"
if ! command -v solana &> /dev/null; then
    sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
    
    # Add to PATH
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
    echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc
    
    echo -e "${GREEN}✅ Solana CLI installed${NC}"
else
    echo -e "${GREEN}✅ Solana already installed: $(solana --version)${NC}"
fi

# Install Anchor CLI (optional)
echo -e "${YELLOW}⚓ Installing Anchor CLI...${NC}"
if ! command -v anchor &> /dev/null; then
    cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
    echo -e "${GREEN}✅ Anchor CLI installed${NC}"
else
    echo -e "${GREEN}✅ Anchor already installed: $(anchor --version)${NC}"
fi

# Verify installations
echo -e "${BLUE}🔍 Verifying installations...${NC}"

echo -e "${GREEN}Node.js: $(node --version)${NC}"
echo -e "${GREEN}npm: $(npm --version)${NC}"

if command -v rustc &> /dev/null; then
    echo -e "${GREEN}Rust: $(rustc --version)${NC}"
fi

if command -v solana &> /dev/null; then
    echo -e "${GREEN}Solana: $(solana --version)${NC}"
fi

if command -v anchor &> /dev/null; then
    echo -e "${GREEN}Anchor: $(anchor --version)${NC}"
fi

echo ""
echo -e "${GREEN}✅ All dependencies installed successfully!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Run the simple demo: ./demo-simple.sh"
echo "2. Or run the full demo: ./demo.sh"
echo ""
echo -e "${BLUE}💡 The simple demo works without Solana CLI${NC}"
echo -e "${BLUE}   The full demo requires all blockchain tools${NC}"