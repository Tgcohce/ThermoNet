#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

const PWA_URL = 'https://mobile-demo-j9qbcylca-tgcohces-projects.vercel.app';
const OUTPUT_DIR = './apk-output';

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🔨 Generating APK for ThermoNet PWA...');
console.log('📱 PWA URL:', PWA_URL);

// PWABuilder API configuration
const apkConfig = {
    url: PWA_URL,
    name: 'ThermoNet',
    packageId: 'org.thermonet.app',
    version: '1.0.0',
    versionCode: 1,
    display: 'standalone',
    orientation: 'portrait',
    themeColor: '#667eea',
    backgroundColor: '#667eea',
    startUrl: '/',
    iconUrl: `${PWA_URL}/icons/icon-512x512.png`,
    maskableIconUrl: `${PWA_URL}/icons/icon-512x512.png`,
    monochromeIconUrl: `${PWA_URL}/icons/icon-512x512.png`,
    shortcutIcons: [
        {
            name: 'Temperature Map',
            shortName: 'Map',
            url: '/?page=demo',
            iconUrl: `${PWA_URL}/icons/icon-192x192.png`
        }
    ],
    signing: {
        keystore: null,
        alias: 'my-key-alias',
        keystorePassword: 'android',
        keyPassword: 'android'
    },
    features: {
        locationService: {
            enabled: true
        },
        playBilling: {
            enabled: false
        }
    },
    additionalTrustedOrigins: [],
    appVersion: '1.0.0',
    appVersionCode: 1,
    webManifestUrl: `${PWA_URL}/manifest.json`,
    splashScreenFadeOutDuration: 300
};

// Generate APK using PWABuilder-like approach
async function generateAPK() {
    try {
        console.log('📋 Creating Android project structure...');
        
        // Create basic Android project structure
        const androidDir = path.join(OUTPUT_DIR, 'android-project');
        if (!fs.existsSync(androidDir)) {
            fs.mkdirSync(androidDir, { recursive: true });
        }

        // Create AndroidManifest.xml
        const manifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="org.thermonet.app"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:label="ThermoNet"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen"
        android:hardwareAccelerated="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:theme="@android:style/Theme.DeviceDefault.NoActionBar">
            
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https"
                      android:host="mobile-demo-j9qbcylca-tgcohces-projects.vercel.app" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

        fs.writeFileSync(path.join(androidDir, 'AndroidManifest.xml'), manifest);

        // Create build.gradle
        const buildGradle = `
apply plugin: 'com.android.application'

android {
    compileSdkVersion 34
    defaultConfig {
        applicationId "org.thermonet.app"
        minSdkVersion 24
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
    buildTypes {
        release {
            minifyEnabled false
        }
    }
}

dependencies {
    implementation 'androidx.browser:browser:1.4.0'
    implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.2.0'
}
`;

        fs.writeFileSync(path.join(androidDir, 'build.gradle'), buildGradle);

        console.log('✅ Android project structure created');
        console.log('📦 Generating APK instructions...');

        // Create instructions for manual APK creation
        const instructions = `
# 📱 ThermoNet APK Generation Instructions

## Method 1: Use PWABuilder.com (Recommended)

1. **Visit PWABuilder.com:**
   Go to https://www.pwabuilder.com/

2. **Enter your PWA URL:**
   ${PWA_URL}

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

\`\`\`bash
# Install Bubblewrap
npm install -g @bubblewrap/cli

# Initialize TWA project
bubblewrap init --manifest ${PWA_URL}/manifest.json

# Build APK
bubblewrap build
\`\`\`

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
\`\`\`bash
# Connect phone via USB with USB Debugging enabled
adb install thermonet.apk
\`\`\`

### Option C: Use Cloud Storage
1. **Upload APK** to Google Drive/Dropbox
2. **Download on phone** and install

## 🔧 APK Configuration Used:
- **App Name:** ThermoNet
- **Package ID:** org.thermonet.app
- **PWA URL:** ${PWA_URL}
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
`;

        fs.writeFileSync(path.join(OUTPUT_DIR, 'APK-GENERATION-GUIDE.md'), instructions);

        console.log('✅ APK generation guide created!');
        console.log('📂 Check:', path.resolve(OUTPUT_DIR));
        console.log('');
        console.log('🚀 Quick Start:');
        console.log('1. Go to https://www.pwabuilder.com/');
        console.log('2. Enter:', PWA_URL);
        console.log('3. Generate Android APK');
        console.log('4. Download and install on your phone!');

    } catch (error) {
        console.error('❌ Error generating APK:', error.message);
    }
}

generateAPK();