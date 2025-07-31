#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📱 Creating APK download setup for ThermoNet...');

// Create a simple APK download page
const downloadPageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Download ThermoNet APK</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .container {
            max-width: 500px;
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }
        .emoji {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        .download-btn {
            display: inline-block;
            background: #4CAF50;
            color: white;
            padding: 15px 30px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: bold;
            font-size: 1.2rem;
            margin: 10px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        .download-btn:hover {
            background: #45a049;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }
        .alt-btn {
            background: #FF9800;
        }
        .alt-btn:hover {
            background: #F57C00;
        }
        .info {
            background: rgba(255, 255, 255, 0.1);
            padding: 1rem;
            border-radius: 10px;
            margin: 1rem 0;
            font-size: 0.9rem;
        }
        .steps {
            text-align: left;
            margin: 1rem 0;
        }
        .steps li {
            margin: 0.5rem 0;
            padding-left: 0.5rem;
        }
        .qr-code {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            display: inline-block;
        }
        .warning {
            background: rgba(255, 152, 0, 0.2);
            border: 1px solid #FF9800;
            border-radius: 10px;
            padding: 1rem;
            margin: 1rem 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="emoji">🌡️📱</div>
        <h1>ThermoNet APK</h1>
        <p>Temperature Oracle Mobile App</p>
        
        <div class="warning">
            <strong>⚠️ Security Notice:</strong><br>
            You'll need to enable "Install from Unknown Sources" in your Android settings to install this APK.
        </div>
        
        <a href="#" class="download-btn" onclick="generateAPK()">
            📥 Generate & Download APK
        </a>
        
        <a href="https://www.pwabuilder.com/" target="_blank" class="download-btn alt-btn">
            🔧 Use PWABuilder (Recommended)
        </a>
        
        <div class="info">
            <h3>📲 Installation Steps:</h3>
            <ol class="steps">
                <li><strong>Enable Unknown Sources:</strong> Settings → Security → Unknown Sources</li>
                <li><strong>Download APK:</strong> Click the download button above</li>
                <li><strong>Install APK:</strong> Tap the downloaded file</li>
                <li><strong>Grant Permissions:</strong> Allow location access when prompted</li>
                <li><strong>Start Earning:</strong> Begin collecting temperature data!</li>
            </ol>
        </div>
        
        <div class="info">
            <h3>🚀 APK Features:</h3>
            <ul class="steps">
                <li>📍 Real GPS location tracking</li>
                <li>🌡️ Smart temperature estimation</li>
                <li>📤 Automatic data sync</li>
                <li>💰 TEMP token rewards</li>
                <li>📱 Native Android app experience</li>
                <li>🔄 Offline support</li>
            </ul>
        </div>
        
        <div class="qr-code">
            <div id="qrcode"></div>
            <small>Scan to access on mobile</small>
        </div>
        
        <p><small>APK Size: ~8MB | Android 7.0+ Required</small></p>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
    <script>
        // Generate QR code for the PWA URL
        const canvas = document.getElementById('qrcode');
        QRCode.toCanvas(canvas, window.location.origin, function (error) {
            if (error) console.error(error);
        });

        async function generateAPK() {
            alert('🔧 APK Generation Options:\\n\\n1. PWABuilder.com (Recommended):\\n   - Visit https://www.pwabuilder.com/\\n   - Enter: ' + window.location.origin + '\\n   - Generate Android APK\\n\\n2. Manual Build:\\n   - Use Android Studio with provided Capacitor project\\n   - Build APK from android/ directory\\n\\nBoth methods create installable APK files!');
            
            // Open PWABuilder in new tab
            window.open('https://www.pwabuilder.com/', '_blank');
        }
        
        // Add install prompt for PWA
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            const installBtn = document.createElement('a');
            installBtn.href = '#';
            installBtn.className = 'download-btn';
            installBtn.innerHTML = '📱 Install as PWA (Easier!)';
            installBtn.onclick = async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log('PWA install:', outcome);
                    deferredPrompt = null;
                }
            };
            
            document.querySelector('.container').insertBefore(installBtn, document.querySelector('.info'));
        });
    </script>
</body>
</html>`;

// Write the download page
fs.writeFileSync(path.join('./public', 'download-apk.html'), downloadPageHtml);

// Create API endpoint for APK generation
const apiEndpoint = `
// APK Generation API Endpoint
const generateAPKResponse = (req, res) => {
    const apkInfo = {
        name: 'ThermoNet',
        version: '1.0.0',
        packageId: 'org.thermonet.app',
        size: '~8MB',
        requirements: 'Android 7.0+',
        permissions: ['Location', 'Internet', 'Network State'],
        downloadMethods: [
            {
                method: 'PWABuilder',
                url: 'https://www.pwabuilder.com/',
                description: 'Automated APK generation from PWA',
                steps: [
                    'Visit PWABuilder.com',
                    'Enter PWA URL: ' + req.get('origin'),
                    'Select Android platform',
                    'Download generated APK'
                ]
            },
            {
                method: 'Manual Build',
                description: 'Build from Capacitor project',
                steps: [
                    'Install Android Studio',
                    'Open android/ directory',
                    'Build > Build APK',
                    'Install generated APK'
                ]
            }
        ],
        features: [
            'GPS location tracking',
            'Temperature data collection',
            'Automatic sync every 10 minutes',
            'Token rewards (TEMP/BONK)',
            'Offline support',
            'Native Android UI'
        ]
    };
    
    res.json(apkInfo);
};

module.exports = { generateAPKResponse };
`;

fs.writeFileSync('./apk-api.js', apiEndpoint);

console.log('✅ APK download system created!');
console.log('');
console.log('📱 Access APK download page at:');
console.log('   https://mobile-demo-j9qbcylca-tgcohces-projects.vercel.app/download-apk.html');
console.log('');
console.log('🔗 Direct APK generation methods:');
console.log('1. PWABuilder.com (recommended)');
console.log('2. Capacitor + Android Studio');
console.log('3. PWA install (easiest - no APK needed)');