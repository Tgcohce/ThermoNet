# Generate ThermoNet Icons

## Required Icon Sizes for PWA/APK

- 72x72 (Android)
- 96x96 (Android)  
- 128x128 (Android)
- 144x144 (Android)
- 152x152 (iOS)
- 192x192 (Android, PWA)
- 384x384 (Android)
- 512x512 (Android, PWA)

## Quick Icon Generation

### Option 1: Use Online Generator
- Visit https://realfavicongenerator.net/
- Upload a 512x512 source image
- Download all sizes

### Option 2: Use PWA Builder
- Visit https://www.pwabuilder.com/imageGenerator
- Upload your image
- Generate all required sizes

### Option 3: Use ImageMagick (Command Line)
```bash
# Install ImageMagick
sudo apt-get install imagemagick

# Generate all sizes from a source image
convert source-512.png -resize 72x72 icon-72x72.png
convert source-512.png -resize 96x96 icon-96x96.png
convert source-512.png -resize 128x128 icon-128x128.png
convert source-512.png -resize 144x144 icon-144x144.png
convert source-512.png -resize 152x152 icon-152x152.png
convert source-512.png -resize 192x192 icon-192x192.png
convert source-512.png -resize 384x384 icon-384x384.png
convert source-512.png -resize 512x512 icon-512x512.png
```

## Temporary Placeholder
For now, you can use a simple colored square or the thermometer emoji as a placeholder until you create proper icons.

The manifest.json is already configured to use these icon files.