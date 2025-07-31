# 🌡️ ThermoNet Mobile Demo - Complete Setup Guide

## 🚀 Quick Start (2 minutes)

```bash
cd mobile-demo/
node demo-server.js
```

Then open **http://localhost:8080** in your phone's browser and tap "Add to Home Screen"

## 📱 Real Data Collection Features Added

Your ThermoNet app now collects **real sensor data** from your phone:

### ✅ Sensors Enabled
- **📍 GPS Location** - Real latitude/longitude coordinates
- **🔋 Battery Level** - Current battery percentage
- **🌡️ Temperature Estimation** - Based on device sensors and environmental factors
- **💡 Ambient Light** - If available on device
- **📱 Device Motion** - Accelerometer data for environmental estimation

### ✅ Data Flow
1. **Phone collects data** every 30 seconds (configurable)
2. **Submits to backend** via `/api/sync-readings`
3. **Server stores real data** alongside mock data
4. **Website displays** your real readings with priority

## 🏃‍♂️ Full Demo Steps

### 1. Start the Server
```bash
cd /home/tipo/WebstormProjects/ThermoNet/mobile-demo/
node demo-server.js
```

### 2. Test on Computer First
- Open http://localhost:8080
- Navigate through all 4 tabs: Demo, Live Data, Cities, Device
- Check browser console for sensor messages

### 3. Test on Phone (PWA)
- Open http://[YOUR-IP]:8080 in phone browser
- Tap "Add to Home Screen" when prompted
- Grant location and sensor permissions
- Go to "Device" tab to start data collection

### 4. Convert to APK (Optional)
```bash
# Install tools
./install-apk-tools.sh

# Method 1: PWA Builder (easiest)
npm run pwa-builder

# Method 2: Capacitor (full native)
npm run init-capacitor
npm run android
```

## 🔧 Key Files Modified/Created

### Enhanced with Real Sensors:
- `app.js` - Added sensor collection, GPS, battery, temperature estimation
- `demo-server.js` - Real data storage and processing
- `sw.js` - Background sync for offline data submission

### PWA/APK Conversion:
- `manifest.json` - PWA configuration
- `package.json` - NPM scripts for building
- `capacitor.config.ts` - Capacitor configuration
- `convert-to-apk.md` - Detailed APK conversion guide
- `install-apk-tools.sh` - Automated tool installation

## 📊 Real Data Collection Process

### When you open the "Device" page:
1. **Requests permissions** for location, device motion, battery
2. **Starts collecting** real sensor readings every 30 seconds
3. **Estimates temperature** using device sensors and environmental factors
4. **Submits data** to backend API
5. **Updates UI** with real readings
6. **Stores offline** if network unavailable

### Temperature Estimation Algorithm:
- Base temperature (seasonal variation)
- Battery heat contribution  
- Ambient light correlation
- Geographic/time-based adjustments
- Micro-climate random variation

## 🌐 API Endpoints Enhanced

### GET `/api/temperatures`
- Now returns **real device data first**, then mock data
- Filter by `?filter=real` for only your device readings
- Includes `source: 'real-device'` vs `source: 'mock'`

### POST `/api/sync-readings`
- Accepts array of sensor readings from mobile app
- Validates and processes data
- Updates device tracking
- Returns sync statistics

### GET `/api/stats`
- Shows combined real + mock statistics
- `realDevices`, `realReadings` separate from mock data
- Updates in real-time as you submit data

### GET `/api/device`
- Returns data from your actual device if available
- Battery level, GPS accuracy, confidence scores
- Token earnings calculated from real readings

## 🎯 Demo Scenarios for Hackathon

### Scenario 1: Show Real Data Collection
1. Start app on phone
2. Go to Device tab
3. Show sensor permissions being requested
4. Watch real-time data collection in console
5. Submit actual temperature reading from your location

### Scenario 2: Data Flows to Website
1. Keep app open on phone (collecting data)
2. Open website on computer
3. Navigate to "Live Data" or "Demo" tabs
4. Point out your real device readings on the map
5. Show how real data has priority over mock data

### Scenario 3: Offline Capabilities
1. Turn off phone internet
2. Let app collect readings
3. Turn internet back on
4. Show background sync submitting cached data

### Scenario 4: PWA Installation
1. Open in phone browser
2. Show "Add to Home Screen" prompt
3. Install as PWA
4. Launch from home screen (full-screen app experience)
5. Demonstrate offline functionality

## 🔍 Debugging Tips

### Check Real Data Collection:
```javascript
// In browser console
console.log(window.thermoNetApp.sensorData);
```

### Verify Server Receiving Data:
```bash
# Server logs will show:
# 📊 Synced 1 real temperature readings from DX7K9
# 🌡️ Temperature: 22.3°C at 37.7749, -122.4194
```

### Test API Endpoints:
```bash
curl http://localhost:8080/api/stats
curl http://localhost:8080/api/temperatures?filter=real
```

## 🚀 Production Deployment

### For Hackathon Demo:
1. Replace mock data with your actual sensor network
2. Connect to real Solana program/blockchain
3. Deploy server to cloud (Heroku, AWS, Vercel)
4. Update API endpoints in mobile app
5. Submit APK to app stores

### Network Setup:
```bash
# Find your local IP
ip addr show | grep 'inet ' | grep -v '127.0.0.1'

# Access from phone
http://[YOUR-IP]:8080
```

## 🎉 You're Ready!

Your ThermoNet mobile app now:
- ✅ Collects real sensor data from your phone
- ✅ Submits data to the network 
- ✅ Works as a PWA (installable)
- ✅ Can be converted to APK
- ✅ Shows real data on the website
- ✅ Works offline with background sync
- ✅ Perfect for hackathon demo!

**Start with:** `node demo-server.js` and open on your phone! 🚀