import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Thermometer, Map, BarChart3, Settings, Wifi, WifiOff } from 'lucide-react';
import TemperatureMap from './components/TemperatureMap';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import DeviceSettings from './components/DeviceSettings';
import Header from './components/Header';
import { generateMockData } from './utils/mockData';

function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [mockData, setMockData] = useState([]);
  const [isConnected, setIsConnected] = useState(true);
  const [stats, setStats] = useState({
    totalDevices: 0,
    totalReadings: 0,
    avgTemperature: 0,
    tempTokens: 0
  });

  useEffect(() => {
    // Generate initial mock data
    const initialData = generateMockData(150);
    setMockData(initialData);
    
    // Update stats
    const avgTemp = initialData.reduce((sum, item) => sum + item.temperature, 0) / initialData.length;
    setStats({
      totalDevices: initialData.length,
      totalReadings: initialData.length * 144, // 144 readings per day
      avgTemperature: avgTemp,
      tempTokens: initialData.length * 2000 // 2000 TEMP tokens per device
    });

    // Simulate real-time updates
    const interval = setInterval(() => {
      setMockData(prevData => {
        const newData = [...prevData];
        // Update 10% of devices with new readings
        const devicesToUpdate = Math.floor(newData.length * 0.1);
        for (let i = 0; i < devicesToUpdate; i++) {
          const randomIndex = Math.floor(Math.random() * newData.length);
          const baseTemp = newData[randomIndex].temperature;
          newData[randomIndex] = {
            ...newData[randomIndex],
            temperature: baseTemp + (Math.random() - 0.5) * 2, // ±1°C variation
            timestamp: Date.now(),
          };
        }
        return newData;
      });

      // Simulate network connectivity
      setIsConnected(Math.random() > 0.05); // 95% uptime
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'map', name: 'Temperature Map', icon: Map },
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'analytics', name: 'Analytics', icon: Thermometer },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        return <TemperatureMap data={mockData} />;
      case 'dashboard':
        return <Dashboard data={mockData} stats={stats} />;
      case 'analytics':
        return <Analytics data={mockData} />;
      case 'settings':
        return <DeviceSettings />;
      default:
        return <TemperatureMap data={mockData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header stats={stats} isConnected={isConnected} />
      
      <div className="container mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 p-1 glass-card rounded-xl w-fit mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-white/50'
              }`}
            >
              <tab.icon size={20} />
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Connection Status */}
        <AnimatePresence>
          {!isConnected && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-center space-x-2 mb-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-700"
            >
              <WifiOff size={16} />
              <span className="text-sm font-medium">Network connection unstable</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="animate-fade-in"
        >
          {renderContent()}
        </motion.div>
      </div>

      {/* Live Status Indicator */}
      <div className="fixed bottom-6 right-6">
        <div className="flex items-center space-x-2 glass-card px-4 py-2 rounded-full">
          <div className="pulse-ring"></div>
          <div className="pulse-dot"></div>
          <span className="text-sm font-medium text-gray-700">Live Data</span>
        </div>
      </div>
    </div>
  );
}

export default App;