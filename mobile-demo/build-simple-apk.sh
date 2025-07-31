#!/bin/bash

echo "🔨 Building ThermoNet APK using simple method..."

PWA_URL="https://mobile-demo-j9qbcylca-tgcohces-projects.vercel.app"
APK_NAME="ThermoNet"
PACKAGE_ID="org.thermonet.app"

echo "📱 PWA URL: $PWA_URL"
echo "📦 Package: $PACKAGE_ID"

# Create APK build directory
mkdir -p apk-build
cd apk-build

echo "🛠️  Method 1: Using PWABuilder CLI (if available)"
if command -v pwa &> /dev/null; then
    echo "✅ PWABuilder found, generating APK..."
    pwa build --url $PWA_URL --platform android --package-id $PACKAGE_ID
else
    echo "⚠️  PWABuilder CLI not found"
fi

echo ""
echo "🛠️  Method 2: Using Bubblewrap (Automated TWA)"
if command -v bubblewrap &> /dev/null; then
    echo "✅ Bubblewrap found, generating TWA APK..."
    
    # Create temporary manifest for Bubblewrap
    cat > temp-manifest.json << EOF
{
  "name": "$APK_NAME",
  "short_name": "$APK_NAME",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#667eea",
  "theme_color": "#667eea",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
EOF
    
    # Initialize Bubblewrap project
    echo "📋 Initializing Bubblewrap project..."
    bubblewrap init --manifest temp-manifest.json --directory twa-project
    
    if [ -d "twa-project" ]; then
        cd twa-project
        echo "🔨 Building APK..."
        bubblewrap build
        
        if [ -f "app-release-unsigned.apk" ]; then
            echo "✅ APK built successfully!"
            mv app-release-unsigned.apk "../$APK_NAME.apk"
            echo "📱 APK location: $(pwd)/../$APK_NAME.apk"
        fi
        cd ..
    fi
else
    echo "⚠️  Bubblewrap not found"
fi

echo ""
echo "🛠️  Method 3: Manual APK Generation Instructions"
cat > APK-BUILD-INSTRUCTIONS.md << 'EOF'
# 📱 ThermoNet APK Generation Guide

## ✅ Easiest Method: PWABuilder.com

1. **Go to https://www.pwabuilder.com/**
2. **Enter your PWA URL:**
   ```
   https://mobile-demo-j9qbcylca-tgcohces-projects.vercel.app
   ```
3. **Click "Start" and wait for analysis**
4. **Select "Android" platform**
5. **Click "Package For Stores"**
6. **Configure APK settings:**
   - App Name: ThermoNet
   - Package ID: org.thermonet.app
   - Version: 1.0.0
7. **Download the signed APK**
8. **Install on your phone**

## 🔧 Alternative: Capacitor Build

```bash
# From mobile-demo directory
npm run build
npx cap sync
npx cap run android --external
```

## 📲 Installing APK on Phone

### Enable Unknown Sources:
1. **Android Settings** → **Security** → **Unknown Sources** → **Enable**
2. Or **Settings** → **Apps** → **Special Access** → **Install Unknown Apps** → **Chrome** → **Allow**

### Install Methods:
1. **Direct Download:** Download APK directly to phone and tap to install
2. **USB Transfer:** Copy APK to phone via USB and install
3. **Cloud Storage:** Upload to Google Drive/Dropbox, download on phone
4. **ADB Install:** `adb install ThermoNet.apk` (requires USB debugging)

## 🎯 APK Features

Your APK will include:
✅ Native Android app icon
✅ Splash screen with ThermoNet branding
✅ Full offline functionality
✅ GPS location tracking
✅ Temperature data collection
✅ Background sync capabilities
✅ Push notifications (if supported)
✅ App shortcuts and widgets

## 📱 App Permissions

The APK will request:
- **Location (GPS)** - For temperature location tagging
- **Internet** - For data synchronization
- **Network State** - To check connectivity
- **Wake Lock** - For background operations

## 🔒 Security Notes

- APK is unsigned (for testing only)
- For production, use signed APK from Google Play
- Enable "Install from Unknown Sources" temporarily
- Disable after installation for security

## 🚀 Quick Start After Install

1. **Open ThermoNet app**
2. **Grant location permissions**
3. **Navigate to Device tab**
4. **Enable "Auto Submit"**
5. **Start earning TEMP tokens!**

Your phone is now a ThermoNet temperature oracle! 🌡️📱
EOF

echo "✅ APK build instructions created!"
echo ""
echo "📋 Summary:"
echo "1. Use PWABuilder.com for easiest APK generation"
echo "2. Or use existing Capacitor project with Android Studio"
echo "3. Check APK-BUILD-INSTRUCTIONS.md for detailed steps"
echo ""
echo "🌐 PWA is also installable directly from:"
echo "   $PWA_URL"
echo "   (Tap 'Add to Home Screen' in browser menu)"

cd ..