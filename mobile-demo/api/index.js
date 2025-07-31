// Vercel Serverless Function for ThermoNet API
const url = require('url');

// Persistent storage using global object (survives across requests in same instance)
if (!global.realData) {
  global.realData = {
    readings: [],
    devices: new Map(),
    lastSync: Date.now()
  };
}
let realData = global.realData;

// Mock data generators
function generateMockTemperatures() {
  const data = [];
  for (let i = 0; i < 150; i++) {
    const lat = 37.7749 + (Math.random() - 0.5) * 0.4;
    const lng = -122.4194 + (Math.random() - 0.5) * 0.4;
    const temp = 15 + Math.random() * 15;
    
    data.push({
      id: i,
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6)),
      temperature: parseFloat(temp.toFixed(1)),
      pressure: parseFloat((1010 + (Math.random() - 0.5) * 30).toFixed(1)),
      timestamp: Date.now() - Math.random() * 3600000,
      deviceId: `DX${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      confidence: Math.floor(75 + Math.random() * 25),
      source: 'mock'
    });
  }
  return data;
}

function generateMockCities() {
  const cities = [
    { name: 'San Francisco', country: 'USA', lat: 37.7749, lng: -122.4194 },
    { name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
    { name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
    { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
    { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 }
  ];

  return cities.map(city => ({
    ...city,
    temperature: parseFloat((15 + Math.random() * 20).toFixed(1)),
    devices: Math.floor(50 + Math.random() * 200),
    readings: Math.floor(5000 + Math.random() * 15000),
    lastUpdate: Date.now() - Math.random() * 1800000
  }));
}

const mockData = {
  temperatures: generateMockTemperatures(),
  cities: generateMockCities(),
  stats: {
    totalDevices: 1247,
    totalReadings: 179000,
    avgTemperature: 21.4,
    networkHealth: 99.7
  }
};

function coordsToHexId(lat, lng) {
  if (!lat || !lng) return '00000000';
  const latHex = Math.floor((lat + 90) * 1000000).toString(16);
  const lngHex = Math.floor((lng + 180) * 1000000).toString(16);
  return `${latHex.slice(-4)}${lngHex.slice(-4)}`.padStart(8, '0');
}

// API Handler
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname.replace('/api', '');
  const query = parsedUrl.query;

  res.setHeader('Content-Type', 'application/json');

  try {
    switch (pathname) {
      case '/temperatures':
        handleTemperatures(req, res, query);
        break;
      
      case '/cities':
        handleCities(req, res, query);
        break;
      
      case '/stats':
        handleStats(req, res);
        break;
      
      case '/device':
        handleDevice(req, res);
        break;
      
      case '/sync-readings':
        await handleSyncReadings(req, res);
        break;
      
      default:
        res.status(404).json({ error: 'API endpoint not found' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

function handleTemperatures(req, res, query) {
  console.log(`🌡️ handleTemperatures called with filter: ${query.filter}`);
  console.log(`📊 Total stored readings: ${realData.readings.length}`);
  
  // Combine real and mock data
  let realReadings = realData.readings.map(r => ({
    id: r.id,
    lat: r.latitude,
    lng: r.longitude,
    temperature: r.temperature,
    pressure: 1013 + (Math.random() - 0.5) * 20,
    humidity: 60 + (Math.random() - 0.5) * 40,
    timestamp: r.timestamp,
    deviceId: r.deviceId,
    hexId: r.hexId,
    confidence: r.confidence,
    accuracy: r.accuracy || 5.0,
    source: 'real-device'
  })).filter(r => r.lat && r.lng);
  
  console.log(`📱 Mapped real readings: ${realReadings.length}`);
  
  let mockReadings = [...mockData.temperatures];
  let data = [...realReadings, ...mockReadings];
  
  // Apply filters
  if (query.filter) {
    switch (query.filter) {
      case 'cold':
        data = data.filter(r => r.temperature < 18);
        break;
      case 'warm':
        data = data.filter(r => r.temperature >= 18 && r.temperature < 25);
        break;
      case 'hot':
        data = data.filter(r => r.temperature >= 25);
        break;
      case 'real':
        data = realReadings;
        break;
    }
  }
  
  // Apply location bounds
  if (query.bounds) {
    const [swLat, swLng, neLat, neLng] = query.bounds.split(',').map(parseFloat);
    data = data.filter(r => 
      r.lat >= swLat && r.lat <= neLat && 
      r.lng >= swLng && r.lng <= neLng
    );
  }
  
  console.log(`📤 Sending response: ${data.length} total readings (${realReadings.length} real, ${mockReadings.length} mock)`);
  
  res.status(200).json({
    success: true,
    data: data,
    readings: data, // Add this for backward compatibility
    count: data.length,
    realReadings: realReadings.length,
    mockReadings: mockReadings.length,
    timestamp: Date.now()
  });
}

function handleCities(req, res, query) {
  let data = [...mockData.cities];
  
  if (query.search) {
    const search = query.search.toLowerCase();
    data = data.filter(city => 
      city.name.toLowerCase().includes(search) ||
      city.country.toLowerCase().includes(search)
    );
  }
  
  if (query.sort) {
    switch (query.sort) {
      case 'temperature':
        data.sort((a, b) => b.temperature - a.temperature);
        break;
      case 'devices':
        data.sort((a, b) => b.devices - a.devices);
        break;
      case 'name':
        data.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
  }
  
  res.status(200).json({
    success: true,
    data: data,
    timestamp: Date.now()
  });
}

function handleStats(req, res) {
  const realDeviceCount = realData.devices.size;
  const totalRealReadings = realData.readings.length;
  
  console.log(`📊 Stats requested: ${realDeviceCount} devices, ${totalRealReadings} readings`);
  
  let avgRealTemp = null;
  if (realData.readings.length > 0) {
    const totalTemp = realData.readings.reduce((sum, r) => sum + (r.temperature || 0), 0);
    avgRealTemp = parseFloat((totalTemp / realData.readings.length).toFixed(1));
    console.log(`🌡️ Average real temp: ${avgRealTemp}°C`);
  }
  
  const stats = {
    ...mockData.stats,
    totalDevices: mockData.stats.totalDevices + realDeviceCount,
    totalReadings: mockData.stats.totalReadings + totalRealReadings,
    avgTemperature: avgRealTemp || parseFloat((mockData.stats.avgTemperature + (Math.random() - 0.5) * 2).toFixed(1)),
    realDevices: realDeviceCount,
    realReadings: totalRealReadings,
    lastSync: realData.lastSync,
    lastUpdate: Date.now()
  };
  
  res.status(200).json({
    success: true,
    data: stats
  });
}

function handleDevice(req, res) {
  let deviceData = {
    deviceId: 'DX7K9',
    status: 'online',
    battery: 85,
    temperature: parseFloat((20 + (Math.random() - 0.5) * 6).toFixed(1)),
    gpsAccuracy: parseFloat((2 + Math.random() * 6).toFixed(1)),
    dataQuality: Math.floor(90 + Math.random() * 10),
    earnings: {
      tempTokens: 15420,
      bonkTokens: 1542,
      reputation: 7850,
      streak: 28
    },
    settings: {
      readingInterval: 10,
      autoSubmit: true,
      privacyMode: false
    },
    lastReading: Date.now() - 120000
  };
  
  // Use real device data if available
  if (realData.devices.size > 0) {
    const mostRecentDevice = [...realData.devices.entries()]
      .sort((a, b) => b[1].lastSeen - a[1].lastSeen)[0];
    
    if (mostRecentDevice) {
      const [deviceId, deviceInfo] = mostRecentDevice;
      const latestReading = realData.readings
        .filter(r => r.deviceId === deviceId)
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      
      deviceData = {
        ...deviceData,
        deviceId: deviceId,
        battery: deviceInfo.batteryLevel || deviceData.battery,
        temperature: latestReading?.temperature || deviceData.temperature,
        gpsAccuracy: latestReading?.accuracy || deviceData.gpsAccuracy,
        dataQuality: deviceInfo.confidence || deviceData.dataQuality,
        lastReading: deviceInfo.lastSeen,
        totalReadings: deviceInfo.totalReadings,
        earnings: {
          ...deviceData.earnings,
          tempTokens: deviceData.earnings.tempTokens + (deviceInfo.totalReadings * 10),
          bonkTokens: deviceData.earnings.bonkTokens + Math.floor(deviceInfo.totalReadings / 10)
        }
      };
    }
  }
  
  res.status(200).json({
    success: true,
    data: deviceData
  });
}

async function handleSyncReadings(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    let body = '';
    
    // For Vercel, req is already parsed for JSON
    const readings = req.body || [];
    
    if (!readings || !Array.isArray(readings)) {
      res.status(400).json({ error: 'Invalid readings data' });
      return;
    }
    
    // Process and store readings
    const processedReadings = readings.map(reading => ({
      ...reading,
      serverTimestamp: Date.now(),
      processed: true,
      hexId: coordsToHexId(reading.latitude, reading.longitude)
    }));
    
    // Store in memory (use database in production)
    realData.readings.push(...processedReadings);
    realData.lastSync = Date.now();
    
    // Update device tracking
    processedReadings.forEach(reading => {
      if (reading.deviceId) {
        realData.devices.set(reading.deviceId, {
          lastSeen: Date.now(),
          totalReadings: (realData.devices.get(reading.deviceId)?.totalReadings || 0) + 1,
          lastLocation: {
            latitude: reading.latitude,
            longitude: reading.longitude
          },
          batteryLevel: reading.batteryLevel,
          confidence: reading.confidence
        });
      }
    });
    
    console.log(`📊 Synced ${readings.length} real readings from ${processedReadings[0]?.deviceId}`);
    console.log(`📱 Total real readings: ${realData.readings.length}, Active devices: ${realData.devices.size}`);
    
    // Keep only last 1000 readings
    if (realData.readings.length > 1000) {
      realData.readings = realData.readings.slice(-1000);
    }
    
    // Log the actual data being stored
    const latestReading = processedReadings[0];
    if (latestReading) {
      console.log(`🌡️ Latest: ${latestReading.temperature}°C at ${latestReading.latitude?.toFixed(4)}, ${latestReading.longitude?.toFixed(4)}`);
    }
    
    res.status(200).json({
      success: true,
      synced: readings.length,
      totalReadings: realData.readings.length,
      activeDevices: realData.devices.size,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('Sync error:', error);
    res.status(400).json({ error: 'Invalid JSON' });
  }
}