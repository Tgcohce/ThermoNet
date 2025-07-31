
# 📱 ThermoNet APK Generation Instructions

## Method 1: Use PWABuilder.com (Recommended)

1. **Visit PWABuilder.com:**
   Go to https://www.pwabuilder.com/

2. **Enter your PWA URL:**
   https://mobile-demo-j9qbcylca-tgcohces-projects.vercel.app

3. **Click "Start" and wait for analysis**

4. **Select Android platform:**
   - Click "Package For Stores"
   - Choose "Android" 
   - Select "Google Play" or "Signed APK"

5. **Configure settings:**
   - App name: ThermoNet
   - Package ID: org.thermonet.app
   - Version: 1.0.0

6. **Download APK:**
   - Click "Generate Package"
   - Download the signed APK file

## Method 2: Use Bubblewrap CLI

```bash
# Install Bubblewrap
npm install -g @bubblewrap/cli

# Initialize TWA project
bubblewrap init --manifest https://mobile-demo-j9qbcylca-tgcohces-projects.vercel.app/manifest.json

# Build APK
bubblewrap build
```

## Method 3: Use Android Studio with TWA

1. **Create new Android project**
2. **Add Trusted Web Activity dependencies**
3. **Configure AndroidManifest.xml** (see generated file above)
4. **Build APK:** Build > Build Bundle(s) / APK(s) > Build APK(s)

## 📲 Install APK on Your Phone

### Option A: Direct Download (Easiest)
1. **Enable "Install from Unknown Sources"** in Android Settings
2. **Download APK** from PWABuilder.com to your phone
3. **Tap the APK file** to install

### Option B: Side-load via ADB
```bash
# Connect phone via USB with USB Debugging enabled
adb install thermonet.apk
```

### Option C: Use Cloud Storage
1. **Upload APK** to Google Drive/Dropbox
2. **Download on phone** and install

## 🔧 APK Configuration Used:
- **App Name:** ThermoNet
- **Package ID:** org.thermonet.app
- **PWA URL:** https://mobile-demo-j9qbcylca-tgcohces-projects.vercel.app
- **Permissions:** Internet, Location, Network State
- **Orientation:** Portrait
- **Theme:** #667eea

## 📱 Features in APK:
- ✅ Native app icon and splash screen
- ✅ Offline support with service worker
- ✅ GPS location tracking
- ✅ Temperature data collection
- ✅ Background sync capabilities
- ✅ Full PWA functionality

Your APK will be a Trusted Web Activity (TWA) that loads your PWA in a native wrapper!
