// Mock data generator for ThermoNet demo

export const generateMockData = (count = 100) => {
  const data = [];
  
  // San Francisco Bay Area coordinates
  const centerLat = 37.7749;
  const centerLng = -122.4194;
  const radius = 0.5; // ~50km radius

  // Major cities and their typical temperatures
  const locations = [
    { name: 'San Francisco', lat: 37.7749, lng: -122.4194, baseTemp: 18 },
    { name: 'Oakland', lat: 37.8044, lng: -122.2712, baseTemp: 20 },
    { name: 'San Jose', lat: 37.3382, lng: -121.8863, baseTemp: 22 },
    { name: 'Berkeley', lat: 37.8715, lng: -122.2730, baseTemp: 19 },
    { name: 'Palo Alto', lat: 37.4419, lng: -122.1430, baseTemp: 21 },
    { name: 'Fremont', lat: 37.5485, lng: -121.9886, baseTemp: 23 },
    { name: 'Richmond', lat: 37.9358, lng: -122.3477, baseTemp: 17 },
    { name: 'Hayward', lat: 37.6688, lng: -122.0808, baseTemp: 21 },
    { name: 'Sunnyvale', lat: 37.3688, lng: -122.0363, baseTemp: 22 },
    { name: 'Santa Clara', lat: 37.3541, lng: -121.9552, baseTemp: 23 }
  ];

  for (let i = 0; i < count; i++) {
    // Choose a location (80% near major cities, 20% random)
    let lat, lng, baseTemp;
    
    if (Math.random() < 0.8 && locations.length > 0) {
      const location = locations[Math.floor(Math.random() * locations.length)];
      // Add some variance around the city center
      lat = location.lat + (Math.random() - 0.5) * 0.1;
      lng = location.lng + (Math.random() - 0.5) * 0.1;
      baseTemp = location.baseTemp;
    } else {
      // Random location in the area
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.sqrt(Math.random()) * radius;
      lat = centerLat + (distance * Math.cos(angle));
      lng = centerLng + (distance * Math.sin(angle));
      baseTemp = 20; // Default temperature
    }

    // Add realistic temperature variation
    const timeOfDay = new Date().getHours();
    const dailyVariation = 5 * Math.sin((timeOfDay - 6) * Math.PI / 12); // Peak at 2 PM
    const seasonalVariation = Math.random() * 10 - 5; // ±5°C seasonal variation
    const microclimateVariation = (Math.random() - 0.5) * 4; // ±2°C microclimate
    
    const temperature = baseTemp + dailyVariation + seasonalVariation + microclimateVariation;

    // Generate realistic pressure (varies with elevation and weather)
    const elevation = Math.random() * 500; // 0-500m elevation
    const basePressure = 1013.25 - (elevation * 0.12); // Pressure decreases with elevation
    const weatherVariation = (Math.random() - 0.5) * 40; // ±20 hPa weather variation
    const pressure = basePressure + weatherVariation;

    // Generate device ID and hex ID
    const deviceId = `DX${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const hexId = generateHexId(lat, lng);

    data.push({
      id: i,
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6)),
      temperature: parseFloat(temperature.toFixed(1)),
      pressure: parseFloat(pressure.toFixed(1)),
      timestamp: Date.now() - Math.random() * 3600000, // Within last hour
      deviceId,
      hexId,
      confidence: Math.floor(75 + Math.random() * 25), // 75-100% confidence
      accuracy: parseFloat((2 + Math.random() * 8).toFixed(1)), // 2-10m GPS accuracy
      nonce: Math.floor(Math.random() * 1000000)
    });
  }

  return data;
};

// Generate H3-like hex ID (simplified)
const generateHexId = (lat, lng) => {
  // This is a simplified hex ID generator
  // In production, you'd use the actual H3 library
  const latHex = Math.floor((lat + 90) * 1000000).toString(16);
  const lngHex = Math.floor((lng + 180) * 1000000).toString(16);
  return `${latHex.slice(-4)}${lngHex.slice(-4)}`.padStart(8, '0');
};

// Generate time series data for charts
export const generateTimeSeriesData = (hours = 24) => {
  const data = [];
  const now = new Date();

  for (let i = hours; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    
    // Simulate daily temperature cycle
    const hourOfDay = time.getHours();
    const baseTemp = 18 + 6 * Math.sin((hourOfDay - 6) * Math.PI / 12);
    const noise = (Math.random() - 0.5) * 3;
    
    data.push({
      time: time.toISOString(),
      temperature: parseFloat((baseTemp + noise).toFixed(1)),
      devices: Math.floor(80 + Math.random() * 40),
      readings: Math.floor(500 + Math.random() * 200),
      rewards: Math.floor(1000 + Math.random() * 500)
    });
  }

  return data;
};

// Generate device activity data
export const generateDeviceActivity = (count = 20) => {
  const activities = [
    'submitted temperature reading',
    'came online',
    'earned TEMP tokens',
    'updated location',
    'synchronized with network',
    'completed daily streak',
    'achieved high accuracy',
    'contributed to hex tile'
  ];

  const devices = [];
  for (let i = 0; i < count; i++) {
    const deviceId = `DX${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const activity = activities[Math.floor(Math.random() * activities.length)];
    const timestamp = new Date(Date.now() - Math.random() * 3600000);

    devices.push({
      id: i,
      deviceId,
      activity,
      timestamp: timestamp.toISOString(),
      temperature: parseFloat((15 + Math.random() * 20).toFixed(1)),
      location: getRandomLocation(),
      reputation: Math.floor(1000 + Math.random() * 8000)
    });
  }

  return devices.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

const getRandomLocation = () => {
  const locations = [
    'San Francisco, CA',
    'Oakland, CA',
    'San Jose, CA',
    'Berkeley, CA',
    'Palo Alto, CA',
    'Fremont, CA',
    'Richmond, CA',
    'Hayward, CA',
    'Sunnyvale, CA',
    'Santa Clara, CA'
  ];
  return locations[Math.floor(Math.random() * locations.length)];
};

// Generate network statistics
export const generateNetworkStats = () => {
  const baseStats = {
    totalDevices: 15247,
    activeDevices: 12891,
    totalReadings: 2847592,
    dailyReadings: 185643,
    avgTemperature: 21.3,
    networkUptime: 99.7,
    tempTokensDistributed: 847293,
    bonkTokensDistributed: 84729,
    averageAccuracy: 94.2,
    topReputation: 9847
  };

  // Add some realistic variance
  return {
    ...baseStats,
    totalDevices: baseStats.totalDevices + Math.floor((Math.random() - 0.5) * 100),
    activeDevices: baseStats.activeDevices + Math.floor((Math.random() - 0.5) * 50),
    avgTemperature: parseFloat((baseStats.avgTemperature + (Math.random() - 0.5) * 2).toFixed(1)),
    networkUptime: parseFloat((baseStats.networkUptime + (Math.random() - 0.5) * 0.3).toFixed(1)),
    averageAccuracy: parseFloat((baseStats.averageAccuracy + (Math.random() - 0.5) * 2).toFixed(1))
  };
};

// Export all generators
export default {
  generateMockData,
  generateTimeSeriesData,
  generateDeviceActivity,
  generateNetworkStats
};