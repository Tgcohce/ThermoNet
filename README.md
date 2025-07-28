# ThermoNet Demo

A stunning, interactive demo of the ThermoNet crowdsourced temperature oracle system.

## 🚀 Quick Demo Start

Run the complete demo with one command:

```bash
./demo.sh
```

This will:
- Start a local Solana validator
- Deploy the Anchor program
- Seed realistic temperature data
- Launch the beautiful web interface
- Open http://localhost:3000 automatically

## 🎯 Demo Features

### 🗺️ Interactive Temperature Map
- **Real-time heatmap** with color-coded temperature zones
- **Interactive markers** with detailed sensor information
- **Filter controls** for different temperature ranges
- **Live updates** simulating real sensor network

### 📊 Analytics Dashboard
- **Network statistics** with active devices and readings
- **Time-series charts** showing temperature trends
- **Distribution analysis** with pie charts and correlations
- **Recent activity feed** with device events

### ⚙️ Device Management
- **Device settings** with sensor configuration
- **Network preferences** for connectivity options
- **Security controls** with privacy settings
- **Staking interface** for TEMP token rewards

### 🎨 Beautiful UI/UX
- **Glass morphism design** with modern aesthetics
- **Smooth animations** powered by Framer Motion
- **Responsive layout** working on all screen sizes
- **Real-time updates** with live data indicators

## 🛠️ Manual Setup

If you prefer to run components separately:

### Prerequisites
```bash
# Install dependencies
npm install -g @solana/cli
npm install -g @coral-xyz/anchor-cli
```

### Backend Setup
```bash
# Start Solana validator
solana-test-validator --reset

# Build and deploy program
anchor build
anchor deploy --provider.cluster localnet

# Seed demo data
node scripts/seed-demo-data.js
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🌡️ Demo Data

The demo includes:
- **150+ temperature sensors** across San Francisco Bay Area
- **Realistic temperature gradients** based on geography
- **Live device simulation** with battery and GPS status
- **Token rewards calculation** with reputation system
- **Network statistics** and performance metrics

## 🎮 Interactive Elements

- **Click temperature markers** to see detailed readings
- **Filter by temperature range** to focus on specific zones
- **Switch between dashboard tabs** for different views
- **Adjust device settings** to see configuration options
- **Export analytics data** in CSV format

## 📱 Mobile Ready

The interface is fully responsive and optimized for:
- Desktop browsers (Chrome, Firefox, Safari)
- Tablet devices (iPad, Android tablets)
- Mobile phones (iOS, Android)

## 🔧 Customization

### Add More Demo Data
```javascript
// In scripts/seed-demo-data.js
const readings = generateMockReadings(200); // Increase count
```

### Change Geographic Area
```javascript
// In frontend/src/utils/mockData.js
const centerLat = 40.7128; // New York
const centerLng = -74.0060;
```

### Modify Update Frequency
```javascript
// In frontend/src/App.js
const interval = setInterval(() => {
  // Update logic
}, 2000); // 2 seconds instead of 5
```

## 🎯 Demo Scenarios

### Scenario 1: Temperature Monitoring
1. Open the Temperature Map tab
2. Watch real-time temperature updates
3. Click on different markers to see sensor details
4. Filter by temperature ranges

### Scenario 2: Network Analytics
1. Switch to Dashboard tab
2. Observe live charts updating
3. Check device activity feed
4. View network performance metrics

### Scenario 3: Device Management
1. Go to Settings tab
2. Adjust sensor reading intervals
3. Configure staking amounts
4. Toggle privacy settings

## 🚀 Production Deployment

For production deployment:

1. **Deploy to Solana Mainnet**
   ```bash
   anchor deploy --provider.cluster mainnet
   ```

2. **Configure Production APIs**
   ```javascript
   const RPC_URL = 'https://api.mainnet-beta.solana.com';
   ```

3. **Build Production Frontend**
   ```bash
   cd frontend
   npm run build
   npm install -g serve
   serve -s build -l 3000
   ```

## 🔗 Integration Examples

### REST API Query
```bash
curl "http://localhost:3001/api/tiles/8a2a1072b59ffff" \
  -H "Content-Type: application/json"
```

### GraphQL Query
```graphql
query GetAreaTemperatures {
  tilesInArea(lat: 37.7749, lng: -122.4194, radius: 5000) {
    hexId
    medianTemp
    confidence
    sampleCount
  }
}
```

### WebSocket Subscription
```javascript
const ws = new WebSocket('ws://localhost:3001/ws');
ws.on('temperature_update', (data) => {
  console.log('New temperature:', data);
});
```

## 📚 Learn More

- [ThermoNet Documentation](./claude.txt) - Complete system specification
- [Anchor Program](./programs/thermo-net/src/lib.rs) - Smart contract implementation
- [Android App](./android/) - Mobile client source code
- [API Specification](./API.md) - REST and GraphQL endpoints

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the Solana Mobile ecosystem**