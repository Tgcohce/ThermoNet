import React from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Wifi, WifiOff, TrendingUp, Users, Coins } from 'lucide-react';

const Header = ({ stats, isConnected }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card border-b border-white/20 sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <Thermometer className="text-white" size={24} />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                ThermoNet
              </h1>
              <p className="text-sm text-gray-600">Crowdsourced Temperature Oracle</p>
            </div>
          </div>

          {/* Stats Display */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm">
              <Users size={16} className="text-primary-500" />
              <span className="font-medium text-gray-700">
                {stats.totalDevices.toLocaleString()} Devices
              </span>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <TrendingUp size={16} className="text-green-500" />
              <span className="font-medium text-gray-700">
                {stats.totalReadings.toLocaleString()} Readings
              </span>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <Thermometer size={16} className="text-orange-500" />
              <span className="font-medium text-gray-700">
                {stats.avgTemperature.toFixed(1)}°C Avg
              </span>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <Coins size={16} className="text-yellow-500" />
              <span className="font-medium text-gray-700">
                {(stats.tempTokens / 1000).toFixed(0)}K TEMP
              </span>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
              isConnected 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {isConnected ? (
                <>
                  <Wifi size={14} />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <WifiOff size={14} />
                  <span>Offline</span>
                </>
              )}
            </div>

            {/* Network Indicator */}
            <div className="flex items-center space-x-1">
              <div className="text-xs text-gray-500">Solana</div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Mobile Stats */}
        <div className="md:hidden mt-4 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-primary-600">
              {stats.totalDevices.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Active Devices</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {(stats.totalReadings / 1000).toFixed(0)}K
            </div>
            <div className="text-xs text-gray-600">Total Readings</div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;