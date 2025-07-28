import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, AreaChart, Area } from 'recharts';
import { Calendar, Download, Filter, TrendingUp, MapPin, Clock } from 'lucide-react';

const Analytics = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState('temperature');
  const [dateRange, setDateRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState([]);
  const [correlationData, setCorrelationData] = useState([]);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    // Generate analytics data
    generateAnalyticsData();
    generateCorrelationData();
    generateInsights();
  }, [data, selectedMetric, dateRange]);

  const generateAnalyticsData = () => {
    const now = new Date();
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const timeData = [];

    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const temp = 18 + Math.sin(i / 3) * 8 + (Math.random() - 0.5) * 4;
      const pressure = 1013 + Math.sin(i / 5) * 20 + (Math.random() - 0.5) * 10;
      const humidity = 60 + Math.cos(i / 4) * 20 + (Math.random() - 0.5) * 10;
      
      timeData.push({
        date: date.toISOString().split('T')[0],
        temperature: temp,
        pressure: pressure,
        humidity: humidity,
        accuracy: 85 + Math.random() * 15,
        devices: Math.floor(50 + Math.random() * 100),
        variance: Math.random() * 2
      });
    }
    setAnalyticsData(timeData);
  };

  const generateCorrelationData = () => {
    const correlation = data.slice(0, 50).map(point => ({
      temperature: point.temperature,
      pressure: point.pressure || (1013 + (Math.random() - 0.5) * 50),
      humidity: 60 + (Math.random() - 0.5) * 40,
      elevation: Math.random() * 1000,
      accuracy: 80 + Math.random() * 20
    }));
    setCorrelationData(correlation);
  };

  const generateInsights = () => {
    const avgTemp = data.reduce((sum, d) => sum + d.temperature, 0) / data.length;
    const tempVariance = data.reduce((sum, d) => sum + Math.pow(d.temperature - avgTemp, 2), 0) / data.length;
    const stdDev = Math.sqrt(tempVariance);

    const newInsights = [
      {
        title: 'Temperature Stability',
        value: `±${stdDev.toFixed(1)}°C`,
        description: 'Standard deviation indicates good sensor consistency',
        trend: stdDev < 2 ? 'positive' : 'neutral',
        icon: TrendingUp
      },
      {
        title: 'Geographic Coverage',
        value: `${data.length} points`,
        description: 'Well distributed across the monitored area',
        trend: 'positive',
        icon: MapPin
      },
      {
        title: 'Data Freshness',
        value: '< 5 min',
        description: 'Most recent reading timestamp',
        trend: 'positive',
        icon: Clock
      }
    ];

    setInsights(newInsights);
  };

  const exportData = () => {
    const csv = [
      ['Date', 'Temperature', 'Pressure', 'Humidity', 'Devices'],
      ...analyticsData.map(row => [row.date, row.temperature, row.pressure, row.humidity, row.devices])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `thermonet-analytics-${dateRange}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const MetricCard = ({ title, value, description, trend, icon: Icon }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 rounded-xl"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Icon size={20} className={`${
              trend === 'positive' ? 'text-green-500' : 
              trend === 'negative' ? 'text-red-500' : 'text-gray-500'
            }`} />
            <h3 className="font-semibold text-gray-900">{title}</h3>
          </div>
          <div className="text-2xl font-bold text-primary-600 mb-1">{value}</div>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className={`w-3 h-3 rounded-full ${
          trend === 'positive' ? 'bg-green-400' : 
          trend === 'negative' ? 'bg-red-400' : 'bg-gray-400'
        }`}></div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="glass-card px-3 py-2 rounded-lg text-sm font-medium text-gray-700 border-0 focus:ring-2 focus:ring-primary-500"
            >
              <option value="temperature">Temperature</option>
              <option value="pressure">Pressure</option>
              <option value="humidity">Humidity</option>
              <option value="accuracy">Accuracy</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="glass-card px-3 py-2 rounded-lg text-sm font-medium text-gray-700 border-0 focus:ring-2 focus:ring-primary-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>

        <button
          onClick={exportData}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Download size={16} />
          <span>Export Data</span>
        </button>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((insight, index) => (
          <MetricCard key={index} {...insight} />
        ))}
      </div>

      {/* Time Series Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-xl"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Trends
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={analyticsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
            />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
            <Tooltip 
              labelFormatter={(date) => new Date(date).toLocaleDateString()}
              formatter={(value, name) => [
                typeof value === 'number' ? value.toFixed(2) : value,
                name.charAt(0).toUpperCase() + name.slice(1)
              ]}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: 'none', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey={selectedMetric} 
              stroke="#3b82f6" 
              fill="rgba(59, 130, 246, 0.1)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Correlation Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Temperature vs Pressure</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={correlationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                type="number" 
                dataKey="temperature" 
                name="Temperature" 
                unit="°C"
                stroke="#6b7280"
              />
              <YAxis 
                type="number" 
                dataKey="pressure" 
                name="Pressure" 
                unit="hPa"
                stroke="#6b7280"
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value, name) => [
                  `${value.toFixed(1)}${name === 'temperature' ? '°C' : 'hPa'}`,
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Scatter dataKey="pressure" fill="#3b82f6" fillOpacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Quality Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date"
                tickFormatter={(date) => new Date(date).getDate()}
                stroke="#6b7280"
              />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value, name) => [
                  `${value.toFixed(1)}${name === 'accuracy' ? '%' : ''}`,
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="variance" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Statistical Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-xl"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistical Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Mean Temperature', value: `${(data.reduce((sum, d) => sum + d.temperature, 0) / data.length).toFixed(1)}°C` },
            { label: 'Standard Deviation', value: `${Math.sqrt(data.reduce((sum, d) => sum + Math.pow(d.temperature - (data.reduce((s, dd) => s + dd.temperature, 0) / data.length), 2), 0) / data.length).toFixed(2)}°C` },
            { label: 'Min Temperature', value: `${Math.min(...data.map(d => d.temperature)).toFixed(1)}°C` },
            { label: 'Max Temperature', value: `${Math.max(...data.map(d => d.temperature)).toFixed(1)}°C` }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-primary-600">{stat.value}</div>
              <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;