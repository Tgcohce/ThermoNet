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
        
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupPWA();
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
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.switchPage(page);
                
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

    switchPage(pageId) {
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
        this.initializePage();
    }

    initializePage() {
        switch (this.currentPage) {
            case 'demo':
                this.initDemoPage();
                break;
            case 'real':
                this.initRealPage();
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
    initRealPage() {
        this.showLoadingState();
        this.simulateRealDataLoad();
        this.initRealMap();
        this.setupRealDataControls();
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

    updateRealStats() {
        // Simulate real network stats (would come from actual API)
        document.getElementById('real-devices').textContent = '1,247';
        document.getElementById('real-readings').textContent = '179K';
        document.getElementById('real-temp').textContent = '21.4°C';
        document.getElementById('network-health').textContent = '99.7%';
        document.getElementById('last-update').textContent = new Date().toLocaleTimeString();
    }

    initRealMap() {
        if (this.realMap) {
            this.realMap.remove();
        }

        this.realMap = L.map('real-map').setView([20, 0], 2);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.realMap);

        // Add global temperature markers (simulated)
        this.addGlobalMarkers();
    }

    addGlobalMarkers() {
        const globalCities = [
            { name: 'San Francisco', lat: 37.7749, lng: -122.4194, temp: 18.5 },
            { name: 'New York', lat: 40.7128, lng: -74.0060, temp: 15.2 },
            { name: 'London', lat: 51.5074, lng: -0.1278, temp: 12.8 },
            { name: 'Tokyo', lat: 35.6762, lng: 139.6503, temp: 16.4 },
            { name: 'Sydney', lat: -33.8688, lng: 151.2093, temp: 22.1 }
        ];

        globalCities.forEach(city => {
            const marker = L.circleMarker([city.lat, city.lng], {
                radius: 12,
                fillColor: this.getTemperatureColor(city.temp),
                color: '#ffffff',
                weight: 3,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(this.realMap);

            marker.bindPopup(`
                <div style="text-align: center; padding: 10px;">
                    <h4 style="color: #667eea; margin-bottom: 10px;">${city.name}</h4>
                    <div style="font-size: 24px; font-weight: bold; color: ${this.getTemperatureColor(city.temp)};">
                        ${city.temp}°C
                    </div>
                    <div style="margin-top: 10px; color: #666; font-size: 12px;">
                        Real network data
                    </div>
                </div>
            `);
        });
    }

    setupRealDataControls() {
        const refreshBtn = document.getElementById('refresh-data');
        const timeRange = document.getElementById('time-range');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.showLoadingState();
                this.simulateRealDataLoad();
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
                console.log(`Setting ${e.target.closest('.setting-item').querySelector('h4').textContent} changed to:`, e.target.checked);
                // In real app, save to device settings
            });
        });

        selects.forEach(select => {
            select.addEventListener('change', (e) => {
                console.log(`Setting changed:`, e.target.value);
                // In real app, save to device settings
            });
        });
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
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThermoNetApp();
});

// Handle visibility change for PWA
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // App became visible, refresh data if needed
        console.log('App visible, refreshing data...');
    }
});