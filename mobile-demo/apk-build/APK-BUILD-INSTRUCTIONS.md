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
