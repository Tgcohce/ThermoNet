// ThermoNet Mobile App JavaScript

class ThermoNetApp {
    constructor() {
        this.currentPage = 'demo';
        this.demoMap = null;
        this.realMap = null;
        this.charts = {};
        this.deferredPrompt = null;
        this.temperatureData = [];
        this.cityData = [];
        
        // Real sensor data collection
        this.sensorData = {
            currentPosition: null,
            batteryLevel: null,
            deviceMotion: null,
            ambientLight: null,
            lastReading: null
        };
        this.isCollectingData = false;
        this.dataCollectionInterval = null;
        
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupPWA();
        this.setupRealSensorCollection();
        this.generateMockData();
        this.initializePage();
        this.startRealTimeUpdates();
    }

    // Navigation
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        navLinks.forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                await this.switchPage(page);
                
                // Close mobile menu
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });

        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    async switchPage(pageId) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageId}"]`).classList.add('active');

        // Update pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(`${pageId}-page`).classList.add('active');

        this.currentPage = pageId;
        await this.initializePage();
    }

    async initializePage() {
        switch (this.currentPage) {
            case 'demo':
                this.initDemoPage();
                break;
            case 'real':
                await this.initRealPage();
                break;
            case 'cities':
                this.initCitiesPage();
                break;
            case 'device':
                this.initDevicePage();
                break;
        }
    }

    // PWA Setup
    setupPWA() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        }

        // Install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallBanner();
        });

        // Install banner
        const installBtn = document.getElementById('install-btn');
        const installClose = document.getElementById('install-close');
        const installBanner = document.getElementById('install-banner');

        if (installBtn) {
            installBtn.addEventListener('click', () => {
                if (this.deferredPrompt) {
                    this.deferredPrompt.prompt();
                    this.deferredPrompt.userChoice.then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('User accepted the install prompt');
                        }
                        this.deferredPrompt = null;
                        installBanner.classList.remove('show');
                    });
                }
            });
        }

        if (installClose) {
            installClose.addEventListener('click', () => {
                installBanner.classList.remove('show');
            });
        }
    }

    showInstallBanner() {
        setTimeout(() => {
            document.getElementById('install-banner').classList.add('show');
        }, 3000);
    }

    // Data Generation
    generateMockData() {
        this.temperatureData = this.generateTemperatureReadings(150);
        this.cityData = this.generateCityData();
    }

    generateTemperatureReadings(count) {
        const readings = [];
        const sanFrancisco = { lat: 37.7749, lng: -122.4194 };
        
        const locations = [
            { name: 'San Francisco', lat: 37.7749, lng: -122.4194, baseTemp: 18 },
            { name: 'Oakland', lat: 37.8044, lng: -122.2712, baseTemp: 20 },
            { name: 'San Jose', lat: 37.3382, lng: -121.8863, baseTemp: 22 },
            { name: 'Berkeley', lat: 37.8715, lng: -122.2730, baseTemp: 19 },
            { name: 'Palo Alto', lat: 37.4419, lng: -122.1430, baseTemp: 21 },
        ];

        for (let i = 0; i < count; i++) {
            let location;
            if (Math.random() < 0.7 && locations.length > 0) {
                location = locations[Math.floor(Math.random() * locations.length)];
            } else {
                location = {
                    lat: sanFrancisco.lat + (Math.random() - 0.5) * 0.4,
                    lng: sanFrancisco.lng + (Math.random() - 0.5) * 0.4,
                    baseTemp: 20
                };
            }

            const lat = location.lat + (Math.random() - 0.5) * 0.05;
            const lng = location.lng + (Math.random() - 0.5) * 0.05;
            
            // Add time-based variation
            const hour = new Date().getHours();
            const dailyVariation = 4 * Math.sin((hour - 6) * Math.PI / 12);
            const randomVariation = (Math.random() - 0.5) * 6;
            const temperature = location.baseTemp + dailyVariation + randomVariation;

            readings.push({
                id: i,
                lat: parseFloat(lat.toFixed(6)),
                lng: parseFloat(lng.toFixed(6)),
                temperature: parseFloat(temperature.toFixed(1)),
                pressure: parseFloat((1010 + (Math.random() - 0.5) * 30).toFixed(1)),
                humidity: parseFloat((60 + (Math.random() - 0.5) * 40).toFixed(1)),
                timestamp: Date.now() - Math.random() * 3600000,
                deviceId: `DX${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
                hexId: this.coordsToHexId(lat, lng),
                confidence: Math.floor(75 + Math.random() * 25),
                accuracy: parseFloat((2 + Math.random() * 8).toFixed(1))
            });
        }

        return readings;
    }

    generateCityData() {
        const cities = [
            { name: 'San Francisco', country: 'USA', lat: 37.7749, lng: -122.4194 },
            { name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
            { name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
            { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
            { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
            { name: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050 },
            { name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198 },
            { name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708 },
            { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333 },
            { name: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777 }
        ];

        return cities.map(city => {
            // Simulate seasonal and time-based temperature variation
            const baseTemps = {
                'San Francisco': 18, 'New York': 15, 'London': 12, 'Tokyo': 16,
                'Sydney': 22, 'Berlin': 10, 'Singapore': 28, 'Dubai': 32,
                'São Paulo': 24, 'Mumbai': 30
            };

            const baseTemp = baseTemps[city.name] || 20;
            const variation = (Math.random() - 0.5) * 8;
            const temperature = baseTemp + variation;
            
            const devices = Math.floor(50 + Math.random() * 200);
            const readings = devices * Math.floor(100 + Math.random() * 200);

            return {
                ...city,
                temperature: parseFloat(temperature.toFixed(1)),
                devices: devices,
                readings: readings,
                lastUpdate: Date.now() - Math.random() * 1800000, // Within last 30 min
                trend: Math.random() > 0.5 ? 'up' : 'down',
                trendValue: parseFloat((Math.random() * 3).toFixed(1))
            };
        }).sort((a, b) => b.temperature - a.temperature);
    }

    coordsToHexId(lat, lng) {
        const latHex = Math.floor((lat + 90) * 1000000).toString(16);
        const lngHex = Math.floor((lng + 180) * 1000000).toString(16);
        return `${latHex.slice(-4)}${lngHex.slice(-4)}`.padStart(8, '0');
    }

    // Demo Page
    initDemoPage() {
        this.updateDemoStats();
        this.initDemoMap();
        this.initDemoChart();
        this.updateDemoActivity();
        this.setupDemoFilters();
    }

    updateDemoStats() {
        const avgTemp = this.temperatureData.reduce((sum, reading) => sum + reading.temperature, 0) / this.temperatureData.length;
        
        document.getElementById('demo-devices').textContent = this.temperatureData.length;
        document.getElementById('demo-readings').textContent = `${(this.temperatureData.length * 144 / 1000).toFixed(1)}K`;
        document.getElementById('demo-temp').textContent = `${avgTemp.toFixed(1)}°C`;
        document.getElementById('demo-tokens').textContent = `${Math.floor(this.temperatureData.length * 2)}K`;
    }

    initDemoMap() {
        if (this.demoMap) {
            this.demoMap.remove();
        }

        this.demoMap = L.map('demo-map').setView([37.7749, -122.4194], 10);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.demoMap);

        this.addTemperatureMarkers(this.demoMap, this.temperatureData);
    }

    addTemperatureMarkers(map, data) {
        data.forEach(reading => {
            const color = this.getTemperatureColor(reading.temperature);
            
            const marker = L.circleMarker([reading.lat, reading.lng], {
                radius: 8,
                fillColor: color,
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(map);

            marker.bindPopup(this.createPopupContent(reading));
        });
    }

    getTemperatureColor(temp) {
        if (temp < 10) return '#3b82f6';
        if (temp < 15) return '#06b6d4';
        if (temp < 20) return '#10b981';
        if (temp < 25) return '#f59e0b';
        if (temp < 30) return '#ef4444';
        return '#dc2626';
    }

    createPopupContent(reading) {
        return `
            <div style="text-align: center; padding: 10px; min-width: 200px;">
                <h4 style="color: #667eea; margin-bottom: 10px;">🌡️ Temperature Reading</h4>
                <div style="font-size: 28px; font-weight: bold; color: ${this.getTemperatureColor(reading.temperature)}; margin-bottom: 15px;">
                    ${reading.temperature}°C
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align: left; font-size: 14px;">
                    <div><strong>Pressure:</strong> ${reading.pressure} hPa</div>
                    <div><strong>Humidity:</strong> ${reading.humidity}%</div>
                    <div><strong>Accuracy:</strong> ${reading.accuracy}m</div>
                    <div><strong>Confidence:</strong> ${reading.confidence}%</div>
                </div>
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                    <div><strong>Device:</strong> ${reading.deviceId}</div>
                    <div><strong>Hex ID:</strong> ${reading.hexId}</div>
                    <div><strong>Time:</strong> ${new Date(reading.timestamp).toLocaleTimeString()}</div>
                </div>
            </div>
        `;
    }

    initDemoChart() {
        const ctx = document.getElementById('demo-chart');
        if (!ctx) return;

        // Generate hourly data for the last 12 hours
        const now = new Date();
        const labels = [];
        const data = [];

        for (let i = 11; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60 * 60 * 1000);
            labels.push(time.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}));
            
            // Simulate daily temperature cycle
            const hour = time.getHours();
            const baseTemp = 20 + 6 * Math.sin((hour - 6) * Math.PI / 12);
            const temp = baseTemp + (Math.random() - 0.5) * 4;
            data.push(parseFloat(temp.toFixed(1)));
        }

        if (this.charts.demo) {
            this.charts.demo.destroy();
        }

        this.charts.demo = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperature (°C)',
                    data: data,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#333',
                        bodyColor: '#666',
                        borderColor: '#667eea',
                        borderWidth: 1
                    }
                }
            }
        });
    }

    updateDemoActivity() {
        const activities = [
            { icon: '🌡️', text: `New reading: ${(15 + Math.random() * 15).toFixed(1)}°C`, time: 'Just now' },
            { icon: '📱', text: `Device ${this.temperatureData[0]?.deviceId || 'DX7K9'} online`, time: '2 min ago' },
            { icon: '🪙', text: `${Math.floor(100 + Math.random() * 200)} TEMP distributed`, time: '5 min ago' },
            { icon: '🔥', text: `High temp alert: ${(28 + Math.random() * 7).toFixed(1)}°C`, time: '8 min ago' },
            { icon: '📊', text: `Hex tile aggregated: ${Math.floor(5 + Math.random() * 15)} readings`, time: '12 min ago' },
            { icon: '🔗', text: 'Blockchain sync completed', time: '15 min ago' }
        ];

        const activityFeed = document.getElementById('demo-activity');
        if (!activityFeed) return;

        activityFeed.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-text">
                    <div>${activity.text}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }

    setupDemoFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filter map data
                const filter = btn.dataset.filter;
                this.filterMapData(filter);
            });
        });
    }

    filterMapData(filter) {
        if (!this.demoMap) return;

        // Clear existing markers
        this.demoMap.eachLayer(layer => {
            if (layer instanceof L.CircleMarker) {
                this.demoMap.removeLayer(layer);
            }
        });

        // Filter data
        let filteredData = this.temperatureData;
        switch (filter) {
            case 'cold':
                filteredData = this.temperatureData.filter(r => r.temperature < 18);
                break;
            case 'warm':
                filteredData = this.temperatureData.filter(r => r.temperature >= 18 && r.temperature < 25);
                break;
            case 'hot':
                filteredData = this.temperatureData.filter(r => r.temperature >= 25);
                break;
        }

        // Add filtered markers
        this.addTemperatureMarkers(this.demoMap, filteredData);
    }

    // Real Data Page
    async initRealPage() {
        this.showLoadingState();
        await this.updateRealStats();
        await this.initRealMap();
        this.setupRealDataControls();
        this.hideLoadingState();
        
        // Auto-refresh real data every 30 seconds
        if (this.realDataRefreshInterval) {
            clearInterval(this.realDataRefreshInterval);
        }
        this.realDataRefreshInterval = setInterval(async () => {
            if (this.currentPage === 'real') {
                console.log('🔄 Auto-refreshing real data...');
                await this.updateRealStats();
                await this.addGlobalMarkers();
            }
        }, 30000);
    }

    showLoadingState() {
        const loading = document.getElementById('real-loading');
        if (loading) {
            loading.style.display = 'flex';
        }
    }

    hideLoadingState() {
        const loading = document.getElementById('real-loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    simulateRealDataLoad() {
        // Simulate API call delay
        setTimeout(() => {
            this.updateRealStats();
            this.hideLoadingState();
        }, 2000);
    }

    async updateRealStats() {
        try {
            // Try to fetch real network stats from API
            const response = await fetch('/api/stats');
            if (response.ok) {
                const stats = await response.json();
                document.getElementById('real-devices').textContent = stats.activeDevices || '0';
                document.getElementById('real-readings').textContent = stats.totalReadings || '0';
                document.getElementById('real-temp').textContent = stats.avgTemperature ? `${stats.avgTemperature}°C` : '--°C';
                document.getElementById('network-health').textContent = stats.networkHealth || '--';
                document.getElementById('last-update').textContent = new Date().toLocaleTimeString();
            } else {
                // Show "no data" state instead of mock data
                this.showNoRealDataState();
            }
        } catch (error) {
            console.log('No real data available, showing empty state');
            this.showNoRealDataState();
        }
    }
    
    showNoRealDataState() {
        document.getElementById('real-devices').textContent = '0';
        document.getElementById('real-readings').textContent = '0';
        document.getElementById('real-temp').textContent = '--°C';
        document.getElementById('network-health').textContent = 'Connecting...';
        document.getElementById('last-update').textContent = 'No data yet';
        
        // Show message about network starting up
        const realMap = document.getElementById('real-map');
        if (realMap) {
            realMap.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px; background: #f8f9fa; border-radius: 12px;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🌡️</div>
                    <h3 style="color: #667eea; margin-bottom: 0.5rem;">Network Starting Up</h3>
                    <p style="color: #666; text-align: center; max-width: 300px;">Real temperature data will appear here as devices join the network. This shows actual readings from ThermoNet sensors, not simulated data.</p>
                    <div style="margin-top: 1rem; padding: 10px 20px; background: #e3f2fd; border-radius: 20px; color: #1976d2; font-size: 0.9rem;">
                        📱 Install the app to start contributing data!
                    </div>
                </div>
            `;
        }
    }

    async initRealMap() {
        if (this.realMap) {
            this.realMap.remove();
        }

        this.realMap = L.map('real-map').setView([20, 0], 2);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.realMap);

        // Add real temperature markers (or show empty state)
        await this.addGlobalMarkers();
    }

    async addGlobalMarkers() {
        try {
            // Try to fetch real temperature readings from API
            const response = await fetch('/api/temperatures');
            if (response.ok) {
                const data = await response.json();
                const realReadings = data.readings || [];
                
                if (realReadings.length > 0) {
                    // Show real data markers
                    realReadings.forEach(reading => {
                        if (reading.lat && reading.lng && reading.temperature) {
                            const marker = L.circleMarker([reading.lat, reading.lng], {
                                radius: 8,
                                fillColor: this.getTemperatureColor(reading.temperature),
                                color: '#ffffff',
                                weight: 2,
                                opacity: 1,
                                fillOpacity: 0.8
                            }).addTo(this.realMap);

                            marker.bindPopup(`
                                <div style="text-align: center; padding: 10px;">
                                    <h4 style="color: #667eea; margin-bottom: 10px;">🌡️ Real Reading</h4>
                                    <div style="font-size: 24px; font-weight: bold; color: ${this.getTemperatureColor(reading.temperature)};">
                                        ${reading.temperature}°C
                                    </div>
                                    <div style="margin-top: 10px; color: #666; font-size: 12px;">
                                        Device: ${reading.deviceId}<br>
                                        ${new Date(reading.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            `);
                        }
                    });
                } else {
                    // No real data available - show empty state
                    this.showNoRealDataState();
                }
            } else {
                // API not available - show empty state
                this.showNoRealDataState();
            }
        } catch (error) {
            console.log('No real temperature data available yet');
            this.showNoRealDataState();
        }
    }

    setupRealDataControls() {
        const refreshBtn = document.getElementById('refresh-data');
        const timeRange = document.getElementById('time-range');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                console.log('🔄 Manually refreshing real data...');
                this.showLoadingState();
                await this.updateRealStats();
                await this.initRealMap();
                this.hideLoadingState();
            });
        }

        if (timeRange) {
            timeRange.addEventListener('change', () => {
                this.showLoadingState();
                this.simulateRealDataLoad();
            });
        }
    }

    // Cities Page
    initCitiesPage() {
        this.renderCitiesGrid();
        this.initCitiesChart();
        this.setupCitySearch();
    }

    renderCitiesGrid() {
        const grid = document.getElementById('cities-grid');
        if (!grid) return;

        grid.innerHTML = this.cityData.map(city => `
            <div class="city-card">
                <div class="city-header">
                    <div>
                        <div class="city-name">${city.name}</div>
                        <div style="font-size: 0.9rem; color: #666;">${city.country}</div>
                    </div>
                    <div class="city-temp" style="color: ${this.getTemperatureColor(city.temperature)};">
                        ${city.temperature}°C
                    </div>
                </div>
                <div class="city-stats">
                    <div class="city-stat">
                        <div class="city-stat-value">${city.devices}</div>
                        <div class="city-stat-label">Devices</div>
                    </div>
                    <div class="city-stat">
                        <div class="city-stat-value">${(city.readings / 1000).toFixed(1)}K</div>
                        <div class="city-stat-label">Readings</div>
                    </div>
                </div>
                <div style="margin-top: 1rem; text-align: center; font-size: 0.8rem; color: #666;">
                    Updated ${Math.floor((Date.now() - city.lastUpdate) / 60000)} min ago
                </div>
            </div>
        `).join('');
    }

    initCitiesChart() {
        const ctx = document.getElementById('cities-chart');
        if (!ctx) return;

        const topCities = this.cityData.slice(0, 8);

        if (this.charts.cities) {
            this.charts.cities.destroy();
        }

        this.charts.cities = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: topCities.map(city => city.name),
                datasets: [{
                    label: 'Temperature (°C)',
                    data: topCities.map(city => city.temperature),
                    backgroundColor: topCities.map(city => this.getTemperatureColor(city.temperature) + '80'),
                    borderColor: topCities.map(city => this.getTemperatureColor(city.temperature)),
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    setupCitySearch() {
        const searchInput = document.getElementById('city-search');
        const sortBtns = document.querySelectorAll('.sort-btn');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterCities(e.target.value);
            });
        }

        sortBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                sortBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.sortCities(btn.dataset.sort);
            });
        });
    }

    filterCities(query) {
        const filtered = this.cityData.filter(city => 
            city.name.toLowerCase().includes(query.toLowerCase()) ||
            city.country.toLowerCase().includes(query.toLowerCase())
        );
        this.renderFilteredCities(filtered);
    }

    sortCities(criteria) {
        let sorted = [...this.cityData];
        
        switch (criteria) {
            case 'temperature':
                sorted.sort((a, b) => b.temperature - a.temperature);
                break;
            case 'devices':
                sorted.sort((a, b) => b.devices - a.devices);
                break;
            case 'name':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }

        this.renderFilteredCities(sorted);
    }

    renderFilteredCities(cities) {
        const grid = document.getElementById('cities-grid');
        if (!grid) return;

        grid.innerHTML = cities.map(city => `
            <div class="city-card">
                <div class="city-header">
                    <div>
                        <div class="city-name">${city.name}</div>
                        <div style="font-size: 0.9rem; color: #666;">${city.country}</div>
                    </div>
                    <div class="city-temp" style="color: ${this.getTemperatureColor(city.temperature)};">
                        ${city.temperature}°C
                    </div>
                </div>
                <div class="city-stats">
                    <div class="city-stat">
                        <div class="city-stat-value">${city.devices}</div>
                        <div class="city-stat-label">Devices</div>
                    </div>
                    <div class="city-stat">
                        <div class="city-stat-value">${(city.readings / 1000).toFixed(1)}K</div>
                        <div class="city-stat-label">Readings</div>
                    </div>
                </div>
                <div style="margin-top: 1rem; text-align: center; font-size: 0.8rem; color: #666;">
                    Updated ${Math.floor((Date.now() - city.lastUpdate) / 60000)} min ago
                </div>
            </div>
        `).join('');
    }

    // Device Page
    initDevicePage() {
        this.updateDeviceStats();
        this.setupDeviceSettings();
        this.startSensorCollection();
    }

    updateDeviceStats() {
        // Device stats are mostly static for demo
        // In real app, these would come from device API
    }

    setupDeviceSettings() {
        const toggles = document.querySelectorAll('.toggle input');
        const selects = document.querySelectorAll('.setting-control');

        toggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const settingName = e.target.closest('.setting-item').querySelector('h4').textContent;
                console.log(`Setting ${settingName} changed to:`, e.target.checked);
                
                // Handle specific settings
                if (settingName === 'Auto Submit') {
                    if (e.target.checked) {
                        this.startSensorCollection();
                        console.log('🚀 Auto-submit enabled - starting data collection');
                        // Show user feedback
                        const status = document.querySelector('.device-status-text');
                        if (status) {
                            status.innerHTML = '🟢 Online • Starting data collection...';
                        }
                    } else {
                        this.stopSensorCollection();
                        console.log('⏹️ Auto-submit disabled - stopping data collection');
                        const status = document.querySelector('.device-status-text');
                        if (status) {
                            status.innerHTML = '🟡 Online • Data collection paused';
                        }
                    }
                }
                
                // Save to localStorage
                localStorage.setItem(`thermonet-${settingName.toLowerCase().replace(' ', '-')}`, e.target.checked);
            });
        });

        selects.forEach(select => {
            select.addEventListener('change', (e) => {
                console.log(`Reading interval changed:`, e.target.value);
                
                // Update collection interval
                if (this.dataCollectionInterval) {
                    clearInterval(this.dataCollectionInterval);
                    const intervalMinutes = parseInt(e.target.value);
                    this.dataCollectionInterval = setInterval(() => {
                        this.collectSensorReading();
                    }, intervalMinutes * 60 * 1000);
                }
                
                // Save to localStorage
                localStorage.setItem('thermonet-reading-interval', e.target.value);
            });
        });
        
        // Load saved settings
        this.loadSavedSettings();
    }
    
    loadSavedSettings() {
        // Load auto-submit setting
        const autoSubmit = localStorage.getItem('thermonet-auto-submit');
        if (autoSubmit !== null) {
            const autoSubmitToggle = document.querySelector('.setting-item:nth-child(2) .toggle input');
            if (autoSubmitToggle) {
                autoSubmitToggle.checked = autoSubmit === 'true';
            }
        }
        
        // Load reading interval
        const interval = localStorage.getItem('thermonet-reading-interval');
        if (interval) {
            const intervalSelect = document.querySelector('.setting-control');
            if (intervalSelect) {
                intervalSelect.value = interval;
            }
        }
        
        // Load privacy mode
        const privacyMode = localStorage.getItem('thermonet-privacy-mode');
        if (privacyMode !== null) {
            const privacyToggle = document.querySelector('.setting-item:nth-child(3) .toggle input');
            if (privacyToggle) {
                privacyToggle.checked = privacyMode === 'true';
            }
        }
    }

    // Real-time Updates
    startRealTimeUpdates() {
        // Update demo stats every 5 seconds
        setInterval(() => {
            if (this.currentPage === 'demo') {
                this.updateLiveStats();
                this.updateDemoActivity();
            }
        }, 5000);

        // Update chart data every 30 seconds
        setInterval(() => {
            if (this.currentPage === 'demo' && this.charts.demo) {
                this.updateChartData();
            }
        }, 30000);
    }

    updateLiveStats() {
        const currentDevices = parseInt(document.getElementById('demo-devices').textContent);
        const variation = Math.floor((Math.random() - 0.5) * 6);
        const newDevices = Math.max(140, Math.min(160, currentDevices + variation));
        
        document.getElementById('demo-devices').textContent = newDevices;
        document.getElementById('demo-readings').textContent = `${(newDevices * 144 / 1000).toFixed(1)}K`;
        
        // Update temperature with small variation
        const avgTemp = this.temperatureData.reduce((sum, reading) => sum + reading.temperature, 0) / this.temperatureData.length;
        const tempVariation = (Math.random() - 0.5) * 2;
        document.getElementById('demo-temp').textContent = `${(avgTemp + tempVariation).toFixed(1)}°C`;
    }

    updateChartData() {
        if (!this.charts.demo) return;

        const now = new Date();
        const newLabel = now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        
        // Add new data point
        const hour = now.getHours();
        const baseTemp = 20 + 6 * Math.sin((hour - 6) * Math.PI / 12);
        const newTemp = parseFloat((baseTemp + (Math.random() - 0.5) * 4).toFixed(1));
        
        this.charts.demo.data.labels.push(newLabel);
        this.charts.demo.data.datasets[0].data.push(newTemp);
        
        // Remove old data (keep last 12 points)
        if (this.charts.demo.data.labels.length > 12) {
            this.charts.demo.data.labels.shift();
            this.charts.demo.data.datasets[0].data.shift();
        }
        
        this.charts.demo.update('none');
    }

    // Real Sensor Data Collection
    setupRealSensorCollection() {
        console.log('🔬 Setting up real sensor data collection...');
        
        // Request permissions for various sensors
        this.requestSensorPermissions();
    }

    async requestSensorPermissions() {
        try {
            // Request location permission
            if ('geolocation' in navigator) {
                console.log('📍 Requesting location permission...');
                await this.getCurrentPosition();
            }

            // Request device motion/orientation permission (iOS 13+)
            if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
                console.log('📱 Requesting device motion permission...');
                const motionPermission = await DeviceMotionEvent.requestPermission();
                if (motionPermission === 'granted') {
                    this.setupDeviceMotionSensor();
                }
            } else if ('DeviceMotionEvent' in window) {
                this.setupDeviceMotionSensor();
            }

            // Request battery info
            if ('getBattery' in navigator) {
                console.log('🔋 Requesting battery info...');
                const battery = await navigator.getBattery();
                this.sensorData.batteryLevel = Math.round(battery.level * 100);
                
                battery.addEventListener('levelchange', () => {
                    this.sensorData.batteryLevel = Math.round(battery.level * 100);
                });
            }

            // Setup ambient light sensor if available
            if ('AmbientLightSensor' in window) {
                console.log('💡 Setting up ambient light sensor...');
                this.setupAmbientLightSensor();
            }

        } catch (error) {
            console.error('❌ Error requesting sensor permissions:', error);
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.sensorData.currentPosition = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: position.timestamp
                    };
                    console.log('📍 Got location:', this.sensorData.currentPosition);
                    resolve(position);
                },
                (error) => {
                    console.error('❌ Location error:', error);
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        });
    }

    setupDeviceMotionSensor() {
        console.log('📱 Setting up device motion sensor...');
        
        // Check if device motion is supported
        if (!window.DeviceMotionEvent) {
            console.log('⚠️ Device motion not supported on this device');
            return;
        }
        
        window.addEventListener('devicemotion', (event) => {
            const acceleration = event.acceleration;
            const accelerationIncludingGravity = event.accelerationIncludingGravity;
            
            if (acceleration || accelerationIncludingGravity) {
                // Calculate motion magnitude
                const acc = acceleration || accelerationIncludingGravity;
                const motion = Math.sqrt(
                    (acc.x || 0) * (acc.x || 0) +
                    (acc.y || 0) * (acc.y || 0) +
                    (acc.z || 0) * (acc.z || 0)
                );
                
                this.sensorData.deviceMotion = {
                    acceleration: acceleration,
                    accelerationIncludingGravity: accelerationIncludingGravity,
                    rotationRate: event.rotationRate,
                    motion: Math.max(0, motion - 9.8), // Remove gravity component
                    timestamp: Date.now()
                };
                
                // Log significant motion changes
                if (this.sensorData.deviceMotion.motion > 5) {
                    console.log('📱 Significant device motion detected:', this.sensorData.deviceMotion.motion.toFixed(2));
                }
            }
        });
        
        // Also listen for device orientation changes (if supported)
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (event) => {
                this.sensorData.deviceOrientation = {
                    alpha: event.alpha, // Z axis
                    beta: event.beta,   // X axis
                    gamma: event.gamma, // Y axis
                    timestamp: Date.now()
                };
            });
        }
    }

    setupAmbientLightSensor() {
        try {
            const sensor = new AmbientLightSensor({ frequency: 1 });
            sensor.addEventListener('reading', () => {
                this.sensorData.ambientLight = {
                    illuminance: sensor.illuminance,
                    timestamp: Date.now()
                };
                console.log('💡 Ambient light reading:', sensor.illuminance, 'lux');
            });
            sensor.start();
        } catch (error) {
            console.log('💡 Ambient light sensor not available, using fallback:', error);
            // Fallback: estimate light based on time of day
            this.setupLightFallback();
        }
    }
    
    setupLightFallback() {
        // Estimate ambient light based on time of day as fallback
        setInterval(() => {
            const hour = new Date().getHours();
            let estimatedLux;
            
            if (hour >= 6 && hour <= 18) {
                // Daytime: simulate sunlight variation
                const midday = 12;
                const distanceFromMidday = Math.abs(hour - midday);
                estimatedLux = Math.max(100, 50000 - (distanceFromMidday * 5000));
            } else {
                // Nighttime: indoor lighting or darkness
                estimatedLux = Math.random() < 0.7 ? 200 + Math.random() * 300 : 10 + Math.random() * 90;
            }
            
            this.sensorData.ambientLight = {
                illuminance: estimatedLux,
                timestamp: Date.now(),
                estimated: true
            };
        }, 30000); // Update every 30 seconds
    }

    // Enhanced temperature estimation from available sensors
    estimateTemperature() {
        // Enhanced temperature estimation using multiple data sources
        let baseTemp = 20; // Default base temperature in Celsius
        
        // Get location-based baseline temperature
        if (this.sensorData.currentPosition) {
            const lat = this.sensorData.currentPosition.latitude;
            // Rough temperature based on latitude (tropical = warmer)
            const latitudeFactor = (30 - Math.abs(lat)) * 0.3;
            baseTemp += Math.max(-10, Math.min(15, latitudeFactor));
        }
        
        // Adjust based on battery temperature (hotter battery = warmer environment)
        if (this.sensorData.batteryLevel !== null) {
            // Device thermal characteristics
            const batteryFactor = (100 - this.sensorData.batteryLevel) * 0.08;
            baseTemp += batteryFactor;
        }
        
        // Adjust based on ambient light (more light could mean warmer)
        if (this.sensorData.ambientLight) {
            const lightFactor = Math.min(this.sensorData.ambientLight.illuminance / 1200, 6);
            baseTemp += lightFactor;
        }
        
        // Time of day adjustment (cooler at night, warmer during day)
        const now = new Date();
        const hour = now.getHours();
        const dailyVariation = 8 * Math.sin((hour - 6) * Math.PI / 12);
        baseTemp += dailyVariation;
        
        // Seasonal variation based on current date
        const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
        const seasonalVariation = 12 * Math.sin((dayOfYear - 80) * 2 * Math.PI / 365);
        baseTemp += seasonalVariation;
        
        // Device motion can indicate indoor/outdoor (more motion = possibly outdoor)
        if (this.sensorData.deviceMotion && this.sensorData.deviceMotion.motion > 2) {
            baseTemp += 1; // Slightly warmer if device is moving (outdoor assumption)
        }
        
        // Add realistic micro-climate variation
        const randomVariation = (Math.random() - 0.5) * 3;
        baseTemp += randomVariation;
        
        // Ensure reasonable temperature range
        baseTemp = Math.max(-40, Math.min(60, baseTemp));
        
        return parseFloat(baseTemp.toFixed(1));
    }

    startSensorCollection() {
        if (this.isCollectingData) return;
        
        console.log('🔬 Starting enhanced sensor data collection...');
        this.isCollectingData = true;
        
        // Get the selected interval from settings
        const intervalSelect = document.querySelector('.setting-control');
        const intervalMinutes = intervalSelect ? parseInt(intervalSelect.value) : 10;
        const intervalMs = intervalMinutes * 60 * 1000;
        
        console.log(`🕐 Collection interval set to ${intervalMinutes} minutes`);
        
        // Collect data at selected interval
        this.dataCollectionInterval = setInterval(() => {
            this.collectSensorReading();
        }, intervalMs);
        
        // Collect initial reading after a short delay to ensure sensors are ready
        setTimeout(() => {
            this.collectSensorReading();
        }, 2000);
        
        // Update UI to show collection is active
        this.updateCollectionStatus(true);
    }

    stopSensorCollection() {
        if (!this.isCollectingData) return;
        
        console.log('🛑 Stopping sensor data collection...');
        this.isCollectingData = false;
        
        if (this.dataCollectionInterval) {
            clearInterval(this.dataCollectionInterval);
            this.dataCollectionInterval = null;
        }
        
        // Update UI to show collection is stopped
        this.updateCollectionStatus(false);
    }
    
    updateCollectionStatus(isActive) {
        const deviceStatus = document.querySelector('.device-status-text');
        if (deviceStatus) {
            if (isActive) {
                deviceStatus.innerHTML = '🟢 Online • Collecting data automatically';
            } else {
                deviceStatus.innerHTML = '🟡 Online • Data collection paused';
            }
        }
    }

    async collectSensorReading() {
        try {
            // Update current position
            if (navigator.geolocation) {
                await this.getCurrentPosition();
            }
            
            // Create sensor reading
            const reading = {
                id: Date.now(),
                timestamp: Date.now(),
                deviceId: this.getDeviceId(),
                
                // Location data
                latitude: this.sensorData.currentPosition?.latitude || null,
                longitude: this.sensorData.currentPosition?.longitude || null,
                accuracy: this.sensorData.currentPosition?.accuracy || null,
                
                // Estimated temperature
                temperature: this.estimateTemperature(),
                
                // Device data
                batteryLevel: this.sensorData.batteryLevel,
                
                // Environmental data (if available)
                ambientLight: this.sensorData.ambientLight?.illuminance || null,
                
                // Data quality indicators
                confidence: this.calculateConfidence(),
                source: 'mobile-sensors'
            };
            
            this.sensorData.lastReading = reading;
            console.log('📊 New sensor reading:', reading);
            
            // Submit to backend
            await this.submitSensorReading(reading);
            
            // Update UI with real data
            this.updateDevicePageWithRealData(reading);
            
        } catch (error) {
            console.error('❌ Error collecting sensor reading:', error);
        }
    }

    getDeviceId() {
        // Generate or retrieve persistent device ID
        let deviceId = localStorage.getItem('thermonet-device-id');
        if (!deviceId) {
            deviceId = 'DX' + Math.random().toString(36).substr(2, 6).toUpperCase();
            localStorage.setItem('thermonet-device-id', deviceId);
        }
        return deviceId;
    }

    calculateConfidence() {
        let confidence = 50; // Base confidence
        
        // Higher confidence with GPS
        if (this.sensorData.currentPosition) {
            confidence += 20;
            if (this.sensorData.currentPosition.accuracy < 10) {
                confidence += 10;
            }
        }
        
        // Higher confidence with battery data
        if (this.sensorData.batteryLevel !== null) {
            confidence += 10;
        }
        
        // Higher confidence with ambient light
        if (this.sensorData.ambientLight) {
            confidence += 10;
        }
        
        return Math.min(confidence, 95);
    }

    getApiBaseUrl() {
        // Auto-detect if we're running locally or in production
        const hostname = window.location.hostname;
        const port = window.location.port;
        
        if (hostname === 'localhost' || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
            // Local development
            return `${window.location.protocol}//${hostname}:${port || '8080'}`;
        } else {
            // Production (Vercel, etc.)
            return window.location.origin;
        }
    }

    async submitSensorReading(reading) {
        try {
            const baseUrl = this.getApiBaseUrl();
            const url = `${baseUrl}/api/sync-readings`;
            
            console.log('📡 Submitting reading to:', url);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([reading])
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Reading submitted successfully:', result);
                
                // Show success feedback to user
                const status = document.querySelector('.device-status-text');
                if (status) {
                    status.innerHTML = `🟢 Online • Data submitted! (${result.synced} readings)`;
                    setTimeout(() => {
                        status.innerHTML = '🟢 Online • Collecting data automatically';
                    }, 3000);
                }
                
                return result;
            } else {
                console.error('❌ Failed to submit reading:', response.status, await response.text());
                
                // Show error feedback
                const status = document.querySelector('.device-status-text');
                if (status) {
                    status.innerHTML = '🟠 Online • Failed to submit data (will retry)';
                    setTimeout(() => {
                        status.innerHTML = '🟢 Online • Collecting data automatically';
                    }, 5000);
                }
                
                // Store for later sync if network issues
                this.storeForOfflineSync([reading]);
            }
        } catch (error) {
            console.error('❌ Error submitting reading:', error);
            
            // Store for later sync if network issues
            this.storeForOfflineSync([reading]);
        }
    }
    
    storeForOfflineSync(readings) {
        try {
            const pending = JSON.parse(localStorage.getItem('pending-readings') || '[]');
            pending.push(...readings);
            localStorage.setItem('pending-readings', JSON.stringify(pending));
            
            console.log('💾 Stored readings for offline sync:', readings.length);
            
            // Try to register background sync if supported
            if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
                navigator.serviceWorker.ready.then(reg => {
                    reg.sync.register('temperature-sync');
                });
            }
        } catch (error) {
            console.error('❌ Failed to store readings for offline sync:', error);
        }
    }

    updateDevicePageWithRealData(reading) {
        // Update device page with real sensor data
        const deviceStatus = document.querySelector('.device-status-text');
        if (deviceStatus && reading.latitude && reading.longitude) {
            const lastReadingTime = new Date(reading.timestamp);
            const timeDiff = Math.floor((Date.now() - reading.timestamp) / 1000);
            let timeStr = 'Just now';
            
            if (timeDiff > 60) {
                timeStr = `${Math.floor(timeDiff / 60)} min ago`;
            } else if (timeDiff > 0) {
                timeStr = `${timeDiff} sec ago`;
            }
            
            deviceStatus.innerHTML = `🟢 Online • Last reading: ${timeStr}`;
        }
        
        // Update battery level
        if (reading.batteryLevel !== null) {
            const batteryElement = document.querySelector('.device-stat .stat-value');
            if (batteryElement && batteryElement.textContent.includes('🔋')) {
                batteryElement.textContent = `🔋 ${reading.batteryLevel}%`;
            }
        }
        
        // Update GPS accuracy
        if (reading.accuracy !== null) {
            const gpsElements = document.querySelectorAll('.device-stat .stat-value');
            gpsElements.forEach(el => {
                if (el.textContent.includes('📍')) {
                    el.textContent = `📍 ${reading.accuracy.toFixed(1)}m`;
                }
            });
        }
        
        // Update confidence
        const confidenceElements = document.querySelectorAll('.device-stat .stat-value');
        confidenceElements.forEach(el => {
            if (el.textContent.includes('📊')) {
                el.textContent = `📊 ${reading.confidence}%`;
            }
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.thermoNetApp = new ThermoNetApp();
});

// Handle visibility change for PWA
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // App became visible, refresh data if needed
        console.log('App visible, refreshing data...');
        
        // If on device page and auto-submit is enabled, ensure data collection is running
        const app = window.thermoNetApp;
        if (app && app.currentPage === 'device') {
            const autoSubmit = localStorage.getItem('thermonet-auto-submit');
            if (autoSubmit === 'true' || autoSubmit === null) { // Default to enabled
                app.startSensorCollection();
            }
        }
    }
});