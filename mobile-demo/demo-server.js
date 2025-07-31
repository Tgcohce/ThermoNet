#!/usr/bin/env node

// ThermoNet Mobile Demo Server
// Serves the PWA with proper MIME types and API endpoints

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces for mobile access

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

// Real data storage
const realData = {
  readings: [], // Store real sensor readings from mobile devices
  devices: new Map(), // Track device information
  lastSync: Date.now()
};

// Mock API data
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
      confidence: Math.floor(75 + Math.random() * 25)
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

// Server request handler
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Set CORS headers for API requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API Routes
  if (pathname.startsWith('/api/')) {
    handleApiRequest(req, res, pathname, parsedUrl.query);
    return;
  }

  // Static file serving
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, filePath);

  // Security check - prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File not found, serve index.html for SPA routing
      serveFile(path.join(__dirname, 'index.html'), res, '.html');
    } else {
      const ext = path.extname(filePath);
      serveFile(filePath, res, ext);
    }
  });
});

function serveFile(filePath, res, ext) {
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Internal Server Error');
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000'
    });
    res.end(data);
  });
}

function handleApiRequest(req, res, pathname, query) {
  res.setHeader('Content-Type', 'application/json');

  try {
    switch (pathname) {
      case '/api/temperatures':
        handleTemperatures(req, res, query);
        break;
      
      case '/api/cities':
        handleCities(req, res, query);
        break;
      
      case '/api/stats':
        handleStats(req, res);
        break;
      
      case '/api/tiles':
        handleTiles(req, res, query);
        break;
      
      case '/api/device':
        handleDevice(req, res);
        break;
      
      case '/api/sync-readings':
        handleSyncReadings(req, res);
        break;
      
      default:
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'API endpoint not found' }));
    }
  } catch (error) {
    console.error('API Error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

function handleTemperatures(req, res, query) {
  // Combine real and mock data for demo purposes
  let realReadings = realData.readings.map(r => ({
    id: r.id,
    lat: r.latitude,
    lng: r.longitude,
    temperature: r.temperature,
    pressure: 1013 + (Math.random() - 0.5) * 20, // Simulated pressure
    humidity: 60 + (Math.random() - 0.5) * 40, // Simulated humidity
    timestamp: r.timestamp,
    deviceId: r.deviceId,
    hexId: r.hexId,
    confidence: r.confidence,
    accuracy: r.accuracy || 5.0,
    source: 'real-device'
  })).filter(r => r.lat && r.lng); // Only include readings with valid coordinates
  
  let mockReadings = [...mockData.temperatures].map(r => ({ ...r, source: 'mock' }));
  
  // Prioritize real data - if we have real readings, show them prominently
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
        data = realReadings; // Only real device data
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
  
  res.writeHead(200);
  res.end(JSON.stringify({
    success: true,
    data: data,
    count: data.length,
    realReadings: realReadings.length,
    mockReadings: mockReadings.length,
    timestamp: Date.now()
  }));
}

function handleCities(req, res, query) {
  let data = [...mockData.cities];
  
  // Apply search
  if (query.search) {
    const search = query.search.toLowerCase();
    data = data.filter(city => 
      city.name.toLowerCase().includes(search) ||
      city.country.toLowerCase().includes(search)
    );
  }
  
  // Apply sorting
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
  
  res.writeHead(200);
  res.end(JSON.stringify({
    success: true,
    data: data,
    timestamp: Date.now()
  }));
}

function handleStats(req, res) {
  // Calculate real stats from actual data
  const realDeviceCount = realData.devices.size;
  const totalRealReadings = realData.readings.length;
  
  // Calculate average temperature from real readings
  let avgRealTemp = null;
  if (realData.readings.length > 0) {
    const totalTemp = realData.readings.reduce((sum, r) => sum + (r.temperature || 0), 0);
    avgRealTemp = parseFloat((totalTemp / realData.readings.length).toFixed(1));
  }
  
  // Combine with mock stats
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
  
  res.writeHead(200);
  res.end(JSON.stringify({
    success: true,
    data: stats
  }));
}

function handleTiles(req, res, query) {
  if (query.hexId) {
    // Return specific tile data
    const tile = {
      hexId: query.hexId,
      medianTemp: parseFloat((20 + (Math.random() - 0.5) * 10).toFixed(1)),
      sampleCount: Math.floor(5 + Math.random() * 15),
      confidence: Math.floor(70 + Math.random() * 30),
      lastUpdated: Date.now() - Math.random() * 3600000,
      coordinates: [37.7749 + (Math.random() - 0.5) * 0.1, -122.4194 + (Math.random() - 0.5) * 0.1]
    };
    
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: tile
    }));
  } else {
    res.writeHead(400);
    res.end(JSON.stringify({ error: 'hexId parameter required' }));
  }
}

function handleDevice(req, res) {
  // Try to get real device data from the most recent active device
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
    lastReading: Date.now() - 120000 // 2 minutes ago
  };
  
  // If we have real device data, use it
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
  
  res.writeHead(200);
  res.end(JSON.stringify({
    success: true,
    data: deviceData
  }));
}

function handleSyncReadings(req, res) {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const readings = JSON.parse(body);
        
        // Process and store real readings
        const processedReadings = readings.map(reading => {
          // Add server-side validation and processing
          return {
            ...reading,
            serverTimestamp: Date.now(),
            processed: true,
            hexId: coordsToHexId(reading.latitude, reading.longitude)
          };
        });
        
        // Store in real data
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
        
        console.log(`📊 Synced ${readings.length} real temperature readings from ${processedReadings[0]?.deviceId}`);
        console.log(`🌡️  Temperature: ${processedReadings[0]?.temperature}°C at ${processedReadings[0]?.latitude?.toFixed(4)}, ${processedReadings[0]?.longitude?.toFixed(4)}`);
        
        // Keep only last 1000 readings to prevent memory issues
        if (realData.readings.length > 1000) {
          realData.readings = realData.readings.slice(-1000);
        }
        
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          synced: readings.length,
          totalReadings: realData.readings.length,
          activeDevices: realData.devices.size,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.error('Error processing readings:', error);
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else {
    res.writeHead(405);
    res.end(JSON.stringify({ error: 'Method not allowed' }));
  }
}

function coordsToHexId(lat, lng) {
  if (!lat || !lng) return '00000000';
  const latHex = Math.floor((lat + 90) * 1000000).toString(16);
  const lngHex = Math.floor((lng + 180) * 1000000).toString(16);
  return `${latHex.slice(-4)}${lngHex.slice(-4)}`.padStart(8, '0');
}

// Start server
server.listen(PORT, HOST, () => {
  console.log(`🌡️  ThermoNet Demo Server running at http://${HOST}:${PORT}`);
  console.log(`📱 Mobile-ready PWA with APK conversion support`);
  console.log(`🎮 Demo Mode: Simulated data with realistic patterns`);
  console.log(`📊 API Endpoints:`);
  console.log(`   GET  /api/temperatures - Temperature readings`);
  console.log(`   GET  /api/cities - City temperature data`);
  console.log(`   GET  /api/stats - Network statistics`);
  console.log(`   GET  /api/tiles?hexId=... - Hex tile data`);
  console.log(`   GET  /api/device - Device information`);
  console.log(`   POST /api/sync-readings - Sync readings`);
  console.log(`\n🚀 Open http://${HOST}:${PORT} in your browser`);
  console.log(`📱 Add to home screen for native app experience`);
  console.log(`\n⚡ Features:`);
  console.log(`   • Progressive Web App (PWA)`);
  console.log(`   • Offline support with service worker`);
  console.log(`   • Real-time data updates`);
  console.log(`   • Mobile-optimized interface`);
  console.log(`   • City-level temperature aggregation`);
  console.log(`   • Interactive maps and charts`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down ThermoNet demo server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down ThermoNet demo server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Update mock data periodically
setInterval(() => {
  mockData.temperatures = generateMockTemperatures();
  mockData.cities = generateMockCities();
  console.log('📊 Mock data refreshed');
}, 300000); // Every 5 minutes