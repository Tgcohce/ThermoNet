import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import { Thermometer, MapPin, Clock, Signal } from 'lucide-react';

const getTemperatureColor = (temp) => {
  if (temp < 0) return '#3b82f6'; // Cold blue
  if (temp < 10) return '#06b6d4'; // Cool cyan
  if (temp < 20) return '#10b981'; // Mild green
  if (temp < 30) return '#f59e0b'; // Warm yellow
  if (temp < 40) return '#ef4444'; // Hot red
  return '#dc2626'; // Extreme red
};

const getTemperatureClass = (temp) => {
  if (temp < 0) return 'temp-cold';
  if (temp < 10) return 'temp-cool';
  if (temp < 20) return 'temp-mild';
  if (temp < 30) return 'temp-warm';
  if (temp < 40) return 'temp-hot';
  return 'temp-extreme';
};

const HeatmapLayer = ({ data }) => {
  const map = useMap();
  
  useEffect(() => {
    if (data.length > 0) {
      // Auto-fit map to show all data points
      const group = new window.L.featureGroup(
        data.map(point => 
          window.L.circleMarker([point.lat, point.lng])
        )
      );
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [data, map]);

  return null;
};

const TemperatureMarker = ({ point, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <CircleMarker
      key={`${point.lat}-${point.lng}-${index}`}
      center={[point.lat, point.lng]}
      radius={isHovered ? 12 : 8}
      fillColor={getTemperatureColor(point.temperature)}
      color="#ffffff"
      weight={2}
      opacity={0.9}
      fillOpacity={0.8}
      eventHandlers={{
        mouseover: () => setIsHovered(true),
        mouseout: () => setIsHovered(false),
      }}
    >
      <Popup className="custom-popup">
        <div className="p-4 min-w-[250px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg text-gray-800">Temperature Reading</h3>
            <div className={`px-2 py-1 rounded-full text-sm font-medium ${getTemperatureClass(point.temperature)}`}>
              {point.temperature.toFixed(1)}°C
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <MapPin size={14} className="text-gray-500" />
              <span className="text-gray-700">
                {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Thermometer size={14} className="text-gray-500" />
              <span className="text-gray-700">
                Pressure: {point.pressure?.toFixed(1) || 'N/A'} hPa
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock size={14} className="text-gray-500" />
              <span className="text-gray-700">
                {new Date(point.timestamp).toLocaleTimeString()}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Signal size={14} className="text-gray-500" />
              <span className="text-gray-700">
                Confidence: {point.confidence || 85}%
              </span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Device: {point.deviceId?.slice(0, 8) || 'demo-device'}</span>
              <span>Hex: {point.hexId?.slice(0, 8) || 'abc12345'}</span>
            </div>
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
};

const TemperatureMap = ({ data }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [mapStats, setMapStats] = useState({
    minTemp: 0,
    maxTemp: 0,
    avgTemp: 0,
    totalPoints: 0
  });

  useEffect(() => {
    if (data.length > 0) {
      const temperatures = data.map(d => d.temperature);
      const minTemp = Math.min(...temperatures);
      const maxTemp = Math.max(...temperatures);
      const avgTemp = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
      
      setMapStats({
        minTemp,
        maxTemp,
        avgTemp,
        totalPoints: data.length
      });
    }
  }, [data]);

  const filteredData = data.filter(point => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'cold') return point.temperature < 15;
    if (selectedFilter === 'mild') return point.temperature >= 15 && point.temperature < 25;
    if (selectedFilter === 'hot') return point.temperature >= 25;
    return true;
  });

  const defaultCenter = data.length > 0 
    ? [data[0].lat, data[0].lng] 
    : [37.7749, -122.4194]; // San Francisco default

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex space-x-2">
          {[
            { id: 'all', label: 'All Readings', count: data.length },
            { id: 'cold', label: 'Cold (<15°C)', count: data.filter(d => d.temperature < 15).length },
            { id: 'mild', label: 'Mild (15-25°C)', count: data.filter(d => d.temperature >= 15 && d.temperature < 25).length },
            { id: 'hot', label: 'Hot (>25°C)', count: data.filter(d => d.temperature >= 25).length }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedFilter === filter.id
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'glass-card text-gray-600 hover:text-primary-600 hover:bg-white/70'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* Temperature Legend */}
        <div className="flex items-center space-x-4 glass-card px-4 py-2 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Temperature Scale:</span>
          <div className="temperature-gradient w-32 h-4 rounded-full"></div>
          <div className="flex space-x-4 text-xs text-gray-600">
            <span>Cold</span>
            <span>Hot</span>
          </div>
        </div>
      </div>

      {/* Map Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Points', value: mapStats.totalPoints, unit: '' },
          { label: 'Min Temp', value: mapStats.minTemp.toFixed(1), unit: '°C' },
          { label: 'Max Temp', value: mapStats.maxTemp.toFixed(1), unit: '°C' },
          { label: 'Average', value: mapStats.avgTemp.toFixed(1), unit: '°C' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-4 rounded-xl text-center"
          >
            <div className="text-2xl font-bold text-primary-600">
              {stat.value}<span className="text-sm text-gray-500">{stat.unit}</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Interactive Map */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-4 rounded-xl"
      >
        <div style={{ height: '600px', width: '100%' }}>
          <MapContainer
            center={defaultCenter}
            zoom={10}
            style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <HeatmapLayer data={filteredData} />
            
            {filteredData.map((point, index) => (
              <TemperatureMarker key={index} point={point} index={index} />
            ))}
          </MapContainer>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>Showing {filteredData.length} temperature readings</span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </motion.div>
    </div>
  );
};

export default TemperatureMap;