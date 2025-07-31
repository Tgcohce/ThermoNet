# 🚀 ThermoNet Mobile App - APK Build Guide

Your ThermoNet mobile app is now ready for Android APK generation! Here are the steps to build and install the APK on your phone.

## ✅ What's Already Set Up

- ✅ **Capacitor Android Project** - Native Android wrapper created
- ✅ **Mobile-Optimized UI** - Responsive design for phones and tablets
- ✅ **GPS Location Tracking** - Real-time location acquisition
- ✅ **Temperature Sensors** - Enhanced temperature estimation using device sensors
- ✅ **Data Transmission** - Automatic sync to backend/cloud
- ✅ **Progressive Web App** - Can be installed directly from browser
- ✅ **Service Worker** - Offline functionality and caching

## 🛠️ Build APK Methods

### Method 1: Install as PWA (Easiest - No APK needed!)

1. **Start the server:**
   ```bash
   cd mobile-demo
   npm start
   ```

2. **Open on your phone:**
   - Navigate to `http://YOUR_IP:8080` in Chrome/Edge
   - Tap the "Add to Home Screen" option
   - The app will install like a native app!

### Method 2: Build APK with Android Studio (Recommended)

1. **Install Android Studio** from https://developer.android.com/studio

2. **Open the project:**
   ```bash
   cd mobile-demo
   npx cap open android
   ```

3. **In Android Studio:**
   - Click "Build" → "Build Bundle(s) / APK(s)" → "Build APK(s)"
   - Find the APK in `android/app/build/outputs/apk/debug/`

4. **Install on phone:**
   - Enable "Developer Options" and "USB Debugging" on your phone
   - Connect via USB and install:
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

### Method 3: Using Gradle (Command Line)

```bash
cd mobile-demo/android
./gradlew assembleDebug
```

The APK will be generated in `android/app/build/outputs/apk/debug/app-debug.apk`

## 📱 Mobile App Features

### 🎯 Core Functionality
- **GPS Location Tracking** - Automatic location detection
- **Temperature Estimation** - Uses device sensors, time, location, and environmental data
- **Data Sync** - Automatic submission to ThermoNet network
- **Battery Monitoring** - Tracks battery level for temperature correlation
- **Motion Detection** - Uses accelerometer for indoor/outdoor detection
- **Ambient Light** - Light sensor integration (where available)

### 🎨 Mobile-Optimized UI
- **Touch-Friendly Interface** - Large tap targets (44px minimum)
- **Responsive Design** - Adapts to all screen sizes
- **Mobile Navigation** - Collapsible menu for phones
- **Safe Area Support** - Works with notched devices
- **Haptic Feedback** - Visual feedback for interactions
- **Offline Support** - Works without internet connection

### ⚙️ Settings & Control
- **Auto-Submit Toggle** - Enable/disable automatic data submission
- **Reading Interval** - Adjust collection frequency (5, 10, 15 minutes)
- **Privacy Mode** - Hide precise location in public data
- **Device Stats** - Battery, GPS accuracy, data quality monitoring

## 🔧 Technical Details

### Permissions Required
- **Location (GPS)** - For temperature location tagging
- **Network Access** - For data synchronization
- **Battery Stats** - For temperature correlation analysis

### Data Collection
- **Location**: High-accuracy GPS coordinates
- **Temperature**: Estimated using multiple factors:
  - Device thermal characteristics
  - Geographic location (latitude-based baseline)
  - Time of day (daily temperature cycles)
  - Seasonal variations
  - Ambient light levels
  - Device motion (indoor/outdoor detection)
  - Battery temperature correlation

### Data Transmission
- **Automatic Sync** - Configurable intervals (5-15 minutes)
- **Offline Storage** - Readings cached when offline
- **Background Sync** - Uses service worker for reliable delivery
- **Error Handling** - Retries failed submissions

## 📊 App Pages

1. **Demo Page** - Interactive simulation with 150+ virtual sensors
2. **Live Data** - Real network data from actual devices
3. **Cities** - Temperature data aggregated by metropolitan areas
4. **Device** - Your device settings, earnings, and statistics

## 🎮 Getting Started

1. **Launch the app** on your phone
2. **Grant permissions** when prompted (Location, etc.)
3. **Navigate to Device page**
4. **Enable "Auto Submit"** to start contributing data
5. **Monitor your earnings** in TEMP tokens

## 🏆 Earnings System

- **TEMP Tokens** - Earn for each valid temperature reading
- **BONK Tokens** - Bonus rewards for consistent participation
- **Reputation Score** - Build credibility for higher rewards
- **Streak Counter** - Daily participation bonuses

## 🔍 Troubleshooting

### GPS Not Working
- Ensure location permissions are granted
- Try moving outdoors for better GPS signal
- Check "Device" page for GPS accuracy

### Data Not Syncing
- Check internet connection
- Verify server is running (for local development)
- Check "Device" page for sync status

### Temperature Readings Seem Off
- Remember these are estimated temperatures using available sensors
- Actual temperature sensors would provide more accurate readings
- The app combines multiple data sources for best estimation

## 🌐 Network Deployment

For production deployment, the app can be hosted on:
- **Vercel** (already configured in `vercel.json`)
- **Netlify**
- **AWS S3 + CloudFront**
- **Any static hosting service**

The backend API can be deployed separately or integrated with the frontend.

## 📝 Development Notes

- **Framework**: Vanilla JavaScript + Capacitor for native features
- **Maps**: Leaflet.js for interactive temperature visualization
- **Charts**: Chart.js for temperature trends
- **Styling**: Custom CSS with mobile-first responsive design
- **PWA**: Full Progressive Web App with service worker
- **Storage**: LocalStorage for settings and offline data

## 🚀 Ready to Use!

Your ThermoNet mobile app is fully functional and ready for Android deployment. The easiest way to test is installing it as a PWA directly from your browser, but you can also build a native APK using Android Studio for distribution.

Have fun contributing to the decentralized temperature oracle network! 🌡️📱