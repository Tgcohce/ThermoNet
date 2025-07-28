import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Smartphone, Wifi, Battery, MapPin, Clock, Shield, Coins, Save, RefreshCw } from 'lucide-react';

const DeviceSettings = () => {
  const [settings, setSettings] = useState({
    deviceName: 'ThermoNet Device #DX7K9',
    readingInterval: 10,
    autoSubmit: true,
    offlineMode: true,
    bleBackup: true,
    gpsAccuracy: 'high',
    temperatureUnit: 'celsius',
    notificationsEnabled: true,
    stakingAmount: 1000,
    privacyMode: false
  });

  const [deviceStatus, setDeviceStatus] = useState({
    battery: 85,
    temperature: 23.4,
    lastReading: '2 minutes ago',
    networkStatus: 'Connected',
    gpsAccuracy: 3.2,
    reputation: 7850,
    tokensEarned: 15420,
    streak: 28
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    // Simulate saving settings
    console.log('Saving settings:', settings);
    // In real app, this would sync with the device
  };

  const refreshStatus = () => {
    // Simulate refreshing device status
    setDeviceStatus(prev => ({
      ...prev,
      battery: Math.max(0, prev.battery + (Math.random() - 0.5) * 10),
      temperature: prev.temperature + (Math.random() - 0.5) * 2,
      lastReading: 'Just now'
    }));
  };

  const SettingCard = ({ title, description, children }) => (
    <div className="glass-card p-6 rounded-xl">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      {children}
    </div>
  );

  const StatusCard = ({ icon: Icon, label, value, status = 'normal' }) => (
    <div className="glass-card p-4 rounded-xl">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          status === 'good' ? 'bg-green-100 text-green-600' :
          status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
          status === 'error' ? 'bg-red-100 text-red-600' :
          'bg-blue-100 text-blue-600'
        }`}>
          <Icon size={20} />
        </div>
        <div>
          <div className="text-sm text-gray-600">{label}</div>
          <div className="font-semibold text-gray-900">{value}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Device Settings</h2>
          <p className="text-gray-600 mt-1">Configure your ThermoNet device and sensor parameters</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={refreshStatus}
            className="flex items-center space-x-2 px-4 py-2 glass-card text-gray-600 hover:text-primary-600 rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button
            onClick={saveSettings}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Save size={16} />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Device Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <StatusCard 
          icon={Battery} 
          label="Battery Level" 
          value={`${deviceStatus.battery}%`}
          status={deviceStatus.battery > 50 ? 'good' : deviceStatus.battery > 20 ? 'warning' : 'error'}
        />
        <StatusCard 
          icon={Smartphone} 
          label="Temperature" 
          value={`${deviceStatus.temperature}°C`}
          status="normal"
        />
        <StatusCard 
          icon={Clock} 
          label="Last Reading" 
          value={deviceStatus.lastReading}
          status="good"
        />
        <StatusCard 
          icon={Wifi} 
          label="Network" 
          value={deviceStatus.networkStatus}
          status="good"
        />
      </motion.div>

      {/* Rewards Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 rounded-xl"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rewards Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{deviceStatus.tokensEarned.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">TEMP Tokens Earned</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{deviceStatus.reputation.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">Reputation Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{deviceStatus.streak}</div>
            <div className="text-sm text-gray-600 mt-1">Day Streak</div>
          </div>
        </div>
      </motion.div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sensor Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SettingCard
            title="Sensor Configuration"
            description="Configure how your device collects temperature data"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device Name
                </label>
                <input
                  type="text"
                  value={settings.deviceName}
                  onChange={(e) => handleSettingChange('deviceName', e.target.value)}
                  className="w-full px-3 py-2 glass-card rounded-lg border-0 focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reading Interval (minutes)
                </label>
                <select
                  value={settings.readingInterval}
                  onChange={(e) => handleSettingChange('readingInterval', parseInt(e.target.value))}
                  className="w-full px-3 py-2 glass-card rounded-lg border-0 focus:ring-2 focus:ring-primary-500"
                >
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature Unit
                </label>
                <select
                  value={settings.temperatureUnit}
                  onChange={(e) => handleSettingChange('temperatureUnit', e.target.value)}
                  className="w-full px-3 py-2 glass-card rounded-lg border-0 focus:ring-2 focus:ring-primary-500"
                >
                  <option value="celsius">Celsius (°C)</option>
                  <option value="fahrenheit">Fahrenheit (°F)</option>
                </select>
              </div>
            </div>
          </SettingCard>
        </motion.div>

        {/* Network Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SettingCard
            title="Network & Connectivity"
            description="Manage how your device connects and shares data"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Auto Submit</label>
                  <p className="text-xs text-gray-500">Automatically submit readings to network</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoSubmit}
                    onChange={(e) => handleSettingChange('autoSubmit', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Offline Mode</label>
                  <p className="text-xs text-gray-500">Queue readings when network unavailable</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.offlineMode}
                    onChange={(e) => handleSettingChange('offlineMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">BLE Backup</label>
                  <p className="text-xs text-gray-500">Use Bluetooth mesh for backup sharing</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.bleBackup}
                    onChange={(e) => handleSettingChange('bleBackup', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GPS Accuracy
                </label>
                <select
                  value={settings.gpsAccuracy}
                  onChange={(e) => handleSettingChange('gpsAccuracy', e.target.value)}
                  className="w-full px-3 py-2 glass-card rounded-lg border-0 focus:ring-2 focus:ring-primary-500"
                >
                  <option value="high">High (3-5m accuracy)</option>
                  <option value="medium">Medium (5-10m accuracy)</option>
                  <option value="low">Low (10-20m accuracy)</option>
                </select>
              </div>
            </div>
          </SettingCard>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SettingCard
            title="Security & Privacy"
            description="Manage data privacy and security settings"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Privacy Mode</label>
                  <p className="text-xs text-gray-500">Hide precise location in public data</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacyMode}
                    onChange={(e) => handleSettingChange('privacyMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Notifications</label>
                  <p className="text-xs text-gray-500">Receive alerts about rewards and updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notificationsEnabled}
                    onChange={(e) => handleSettingChange('notificationsEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Seed Vault Status</span>
                </div>
                <p className="text-xs text-blue-700">
                  Your device is secured with Solana Mobile's Seed Vault. All readings are cryptographically signed.
                </p>
              </div>
            </div>
          </SettingCard>
        </motion.div>

        {/* Staking Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <SettingCard
            title="Staking & Rewards"
            description="Manage your TEMP token stake and reward preferences"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Staking Amount (TEMP)
                </label>
                <input
                  type="number"
                  value={settings.stakingAmount}
                  onChange={(e) => handleSettingChange('stakingAmount', parseInt(e.target.value))}
                  min="1000"
                  max="100000"
                  step="100"
                  className="w-full px-3 py-2 glass-card rounded-lg border-0 focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 1,000 TEMP required. Higher stakes earn better rewards.
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-900">Current Stake</span>
                  <span className="text-sm font-bold text-green-900">{settings.stakingAmount.toLocaleString()} TEMP</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-green-700">Daily Reward Rate</span>
                  <span className="text-xs font-medium text-green-700">~{Math.floor(settings.stakingAmount * 0.002)} TEMP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-700">APY Estimate</span>
                  <span className="text-xs font-medium text-green-700">~12.5%</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Coins size={12} />
                <span>Rewards are distributed daily based on data quality and network contribution</span>
              </div>
            </div>
          </SettingCard>
        </motion.div>
      </div>
    </div>
  );
};

export default DeviceSettings;