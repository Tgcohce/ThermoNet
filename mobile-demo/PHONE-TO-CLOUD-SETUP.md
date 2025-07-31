# 📱☁️ Complete Phone-to-Cloud Setup Guide

## 🚀 **LOCAL TESTING FIRST** (5 minutes)

### Step 1: Start Local Server
```bash
cd /home/tipo/WebstormProjects/ThermoNet/mobile-demo/
./start-for-mobile.sh
```

### Step 2: Connect Your Phone
- Connect phone to same WiFi as your computer
- Open browser on phone
- Go to: **http://192.168.14.69:8080**
- Tap "Add to Home Screen" when prompted

### Step 3: Test Data Collection
- Go to "Device" tab in the app
- Grant location permissions
- Watch console for: `📊 New sensor reading: {temperature: 22.3, lat: 37.7749, ...}`
- Check server terminal for: `📊 Synced 1 real temperature readings from DX7K9`

### Step 4: Verify Data on Website
- Open http://192.168.14.69:8080 on your computer
- Go to "Demo" or "Live Data" tab
- Look for your real device readings on the map (marked as `source: 'real-device'`)

---

## ☁️ **DEPLOY TO VERCEL** (10 minutes)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```
Follow the prompts to authenticate.

### Step 3: Deploy
```bash
cd /home/tipo/WebstormProjects/ThermoNet/mobile-demo/
vercel --prod
```

Vercel will give you a URL like: `https://thermonet-mobile-abc123.vercel.app`

### Step 4: Test Production App
- Open the Vercel URL on your phone
- Tap "Add to Home Screen"
- Go to "Device" tab
- Grant permissions and test data collection
- App will automatically detect it's in production and use the correct API endpoints

---

## 🔍 **HOW IT WORKS**

### Data Collection Process:
1. **Phone sensors** → GPS location, battery level, estimated temperature
2. **Every 30 seconds** → App collects sensor reading
3. **Submit to API** → POST to `/api/sync-readings`
4. **Server processes** → Validates and stores real data
5. **Website displays** → Real readings prioritized over mock data

### Smart URL Detection:
```javascript
// App automatically detects environment
if (hostname === 'localhost' || hostname.startsWith('192.168.')) {
    // Use local server: http://192.168.14.69:8080
} else {
    // Use production: https://your-app.vercel.app
}
```

### Temperature Estimation Algorithm:
- Base temperature (20°C + seasonal variation)
- Battery heat contribution
- Ambient light correlation
- Geographic/time adjustments
- Random micro-climate variation

---

## 🧪 **TESTING & VERIFICATION**

### Test Real Data Collection:
```javascript
// In browser console on phone
console.log(window.thermoNetApp.sensorData);
```

### Test API Endpoints:
```bash
# Check stats (should show your real device)
curl https://your-app.vercel.app/api/stats

# Check temperatures (should include your readings)
curl "https://your-app.vercel.app/api/temperatures?filter=real"
```

### Test Offline Functionality:
1. Turn off phone internet
2. Let app collect readings (stored locally)
3. Turn internet back on
4. Watch background sync submit cached data

---

## 🎯 **HACKATHON DEMO FLOW**

### Demo Script:
1. **"This is ThermoNet running on my phone"**
   - Show PWA installed on phone
   - Open app, show Device tab

2. **"It's collecting real sensor data from my location"**
   - Point out GPS coordinates
   - Show battery level, estimated temperature
   - Show data collection in real-time

3. **"The data flows to our decentralized network"**
   - Open website on computer
   - Show your real device pin on the map
   - Explain real vs mock data

4. **"It works offline and syncs when connected"**
   - Demonstrate offline capabilities
   - Show background sync

5. **"Ready for app store distribution"**
   - Show PWA installation prompt
   - Mention APK conversion options

---

## 🚨 **TROUBLESHOOTING**

### Phone Can't Connect to Local Server:
- Check WiFi connection (same network)
- Try IP: `ip addr show | grep 'inet '`
- Check firewall settings

### No Sensor Data:
- Grant location permissions
- Check browser console for errors
- Ensure HTTPS for production (required for sensors)

### API Errors:
- Check network connectivity
- Verify API endpoint URLs
- Check server logs for errors

### Deployment Issues:
- Run `npm run build` before deploying
- Check Vercel function logs
- Verify API routes in vercel.json

---

## 🎉 **YOU'RE READY!**

Your ThermoNet app now:
- ✅ Collects real data from your phone
- ✅ Transmits to cloud backend  
- ✅ Displays on interactive map
- ✅ Works offline with sync
- ✅ Ready for production deployment
- ✅ Perfect for hackathon demo!

**Commands to remember:**
```bash
# Local testing
./start-for-mobile.sh

# Production deployment  
vercel --prod
```