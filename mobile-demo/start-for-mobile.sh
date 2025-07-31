#!/bin/bash

echo "🌡️ Starting ThermoNet for Mobile Demo..."

# Get local IP address
LOCAL_IP=$(ip addr show | grep 'inet ' | grep -v '127.0.0.1' | head -1 | awk '{print $2}' | cut -d'/' -f1)

echo "📱 Your local IP address: $LOCAL_IP"
echo "🌐 Mobile URL: http://$LOCAL_IP:8080"
echo ""
echo "📋 Steps to connect your phone:"
echo "1. Make sure your phone is on the same WiFi network"
echo "2. Open browser on phone"
echo "3. Go to: http://$LOCAL_IP:8080"  
echo "4. Tap 'Add to Home Screen' when prompted"
echo "5. Go to 'Device' tab to start data collection"
echo ""
echo "🚀 Starting server..."
echo ""

# Start the server
node demo-server.js