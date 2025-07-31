#!/bin/bash

echo "🚀 Installing APK conversion tools for ThermoNet..."

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Install PWA Builder CLI (easiest method)
echo "🔧 Installing PWA Builder CLI..."
npm install -g @pwabuilder/cli

# Install Capacitor (more advanced method)
echo "⚡ Installing Capacitor..."
npm install -g @capacitor/cli
npm run install-capacitor

# Install Bubblewrap for TWA (alternative method)
echo "🫧 Installing Bubblewrap for TWA..."
npm install -g @bubblewrap/cli

echo "✅ Installation complete!"
echo ""
echo "🎯 Choose your preferred APK conversion method:"
echo ""
echo "1. PWA Builder (Easiest):"
echo "   npm run pwa-builder"
echo ""
echo "2. Capacitor (Most features):"
echo "   npm run init-capacitor"
echo "   npm run android"
echo ""
echo "3. Bubblewrap TWA:"
echo "   bubblewrap init --manifest http://localhost:8080/manifest.json"
echo "   bubblewrap build"
echo ""
echo "📱 First, start the server: npm start"
echo "🌐 Then open http://localhost:8080 on your phone to test PWA"
echo "📲 Add to home screen to test app-like behavior"