// ThermoNet Service Worker for PWA functionality

const CACHE_NAME = 'thermonet-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache installation failed:', error);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        // Clone the request because it's a stream
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response because it's a stream
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(() => {
          // If network fails, return offline page or cached content
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for temperature data
self.addEventListener('sync', (event) => {
  if (event.tag === 'temperature-sync') {
    event.waitUntil(syncTemperatureData());
  }
});

// Push notifications for temperature alerts
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New temperature alert!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 'temperature-alert'
    },
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-icon.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('ThermoNet Alert', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    // Open the app and navigate to temperature details
    event.waitUntil(
      clients.openWindow('/?page=real&alert=true')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background function to sync temperature data
async function syncTemperatureData() {
  try {
    // In a real app, this would sync pending temperature readings
    console.log('Syncing temperature data in background...');
    
    // Simulate API call
    const response = await fetch('/api/sync-readings', {
      method: 'POST',
      body: JSON.stringify(getPendingReadings()),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      clearPendingReadings();
      console.log('Temperature data synced successfully');
    }
  } catch (error) {
    console.log('Failed to sync temperature data:', error);
  }
}

// Helper functions for background sync
function getPendingReadings() {
  // In a real app, get pending readings from IndexedDB
  return [];
}

function clearPendingReadings() {
  // In a real app, clear synced readings from IndexedDB
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'temperature-update') {
    event.waitUntil(updateTemperatureCache());
  }
});

async function updateTemperatureCache() {
  try {
    // Fetch latest temperature data and update cache
    const response = await fetch('/api/temperatures');
    const data = await response.json();
    
    const cache = await caches.open(CACHE_NAME);
    await cache.put('/api/temperatures', new Response(JSON.stringify(data)));
    
    console.log('Temperature cache updated');
  } catch (error) {
    console.log('Failed to update temperature cache:', error);
  }
}