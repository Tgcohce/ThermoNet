import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Thermometer, Users, Database, Coins, Activity } from 'lucide-react';

const Dashboard = ({ data, stats }) => {
  const [timeRange, setTimeRange] = useState('24h');
  const [chartData, setChartData] = useState([]);
  const [temperatureDistribution, setTemperatureDistribution] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Generate time-series data for charts
    const now = new Date();
    const timeData = [];
    const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
    
    for (let i = hours; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const baseTemp = 20 + Math.sin(i / 4) * 5; // Simulate daily temperature cycle
      const readings = Math.floor(50 + Math.random() * 100);
      
      timeData.push({
        time: time.toISOString(),
        temperature: baseTemp + (Math.random() - 0.5) * 4,
        readings: readings,
        devices: Math.floor(readings * 0.3),
        rewards: readings * 15
      });
    }
    setChartData(timeData);

    // Generate temperature distribution
    const tempRanges = [
      { range: '<0°C', count: data.filter(d => d.temperature < 0).length, color: '#3b82f6' },
      { range: '0-10°C', count: data.filter(d => d.temperature >= 0 && d.temperature < 10).length, color: '#06b6d4' },
      { range: '10-20°C', count: data.filter(d => d.temperature >= 10 && d.temperature < 20).length, color: '#10b981' },
      { range: '20-30°C', count: data.filter(d => d.temperature >= 20 && d.temperature < 30).length, color: '#f59e0b' },
      { range: '30+°C', count: data.filter(d => d.temperature >= 30).length, color: '#ef4444' }
    ];
    setTemperatureDistribution(tempRanges.filter(range => range.count > 0));

    // Generate recent activity
    const activities = [
      { type: 'reading', message: 'New temperature reading: 23.4°C', time: '2 min ago', icon: Thermometer },
      { type: 'device', message: 'Device DX7K9 came online', time: '5 min ago', icon: Users },
      { type: 'reward', message: '150 TEMP tokens distributed', time: '8 min ago', icon: Coins },
      { type: 'alert', message: 'High temperature detected: 35.2°C', time: '12 min ago', icon: TrendingUp },
      { type: 'reading', message: 'Pressure reading: 1013.2 hPa', time: '15 min ago', icon: Activity }
    ];
    setRecentActivity(activities);
  }, [data, timeRange]);

  const StatCard = ({ title, value, unit, change, icon: Icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-xl"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
          </div>
          {change && (
            <div className={`flex items-center space-x-1 mt-2 text-sm ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{Math.abs(change)}% from yesterday</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Devices"
          value={stats.totalDevices.toLocaleString()}
          change={12}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Readings"
          value={(stats.totalReadings / 1000).toFixed(1)}
          unit="K"
          change={8}
          icon={Database}
          color="bg-green-500"
        />
        <StatCard
          title="Avg Temperature"
          value={stats.avgTemperature.toFixed(1)}
          unit="°C"
          change={-2}
          icon={Thermometer}
          color="bg-orange-500"
        />
        <StatCard
          title="TEMP Tokens"
          value={(stats.tempTokens / 1000).toFixed(0)}
          unit="K"
          change={15}
          icon={Coins}
          color="bg-purple-500"
        />
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Network Analytics</h2>
        <div className="flex space-x-2">
          {['24h', '7d', '30d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                timeRange === range
                  ? 'bg-primary-500 text-white'
                  : 'glass-card text-gray-600 hover:text-primary-600'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Temperature Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="time" 
                tickFormatter={(time) => new Date(time).toLocaleTimeString([], {hour: '2-digit'})}
                stroke="#6b7280"
              />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                labelFormatter={(time) => new Date(time).toLocaleString()}
                formatter={(value) => [`${value.toFixed(1)}°C`, 'Temperature']}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="temperature" 
                stroke="#3b82f6" 
                fill="rgba(59, 130, 246, 0.1)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Readings Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Readings Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.slice(-12)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="time" 
                tickFormatter={(time) => new Date(time).toLocaleTimeString([], {hour: '2-digit'})}
                stroke="#6b7280"
              />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                labelFormatter={(time) => new Date(time).toLocaleString()}
                formatter={(value) => [value, 'Readings']}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="readings" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Temperature Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Temperature Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={temperatureDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                label={({range, count}) => `${range}: ${count}`}
              >
                {temperatureDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [value, 'Devices']}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'reading' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'device' ? 'bg-green-100 text-green-600' :
                  activity.type === 'reward' ? 'bg-purple-100 text-purple-600' :
                  activity.type === 'alert' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  <activity.icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;