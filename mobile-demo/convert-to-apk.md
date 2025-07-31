# Convert ThermoNet PWA to APK

## Method 1: PWA Builder (Recommended)

### Install PWA Builder CLI
```bash
npm install -g @pwabuilder/cli
```

### Generate APK
```bash
# From mobile-demo directory
pwa-builder-cli http://localhost:8080 -p android
```

## Method 2: Capacitor

### Install Capacitor
```bash
npm install -g @capacitor/cli @capacitor/core @capacitor/android
```

### Initialize Capacitor Project
```bash
# From mobile-demo directory
npx cap init ThermoNet org.thermonet.app
```

### Add Android Platform
```bash
npx cap add android
```

### Copy Web Assets
```bash
npx cap copy android
```

### Open in Android Studio
```bash
npx cap open android
```

## Method 3: Trusted Web Activity (TWA)

### Install Bubblewrap
```bash
npm install -g @bubblewrap/cli
```

### Initialize TWA
```bash
bubblewrap init --manifest http://localhost:8080/manifest.json
```

### Build APK
```bash
bubblewrap build
```

## Method 4: Android Studio Manual Setup

1. Create new Android project with Empty Activity
2. Add WebView to main activity
3. Configure WebView to load your PWA URL
4. Add required permissions to AndroidManifest.xml

## Required Files for APK Conversion

✅ manifest.json - Already created
✅ Service Worker (sw.js) - Already created
✅ Icons - Need to be generated
✅ Index.html - Already created

## Icon Generation

Use tools like:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

Required icon sizes:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

## Testing APK

1. Enable Developer Options on Android device
2. Enable USB Debugging
3. Install APK via ADB:
   ```bash
   adb install app-release.apk
   ```

## Production Deployment to Google Play Store

1. Sign APK with release key
2. Upload to Google Play Console
3. Complete store listing
4. Submit for review

## Notes

- PWA Builder is the easiest method for quick conversion
- Capacitor provides more native integration options
- TWA maintains PWA features while allowing Play Store distribution
- Manual Android Studio setup gives full control but requires more setup