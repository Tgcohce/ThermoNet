import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.thermonet.app',
  appName: 'ThermoNet',
  webDir: 'public',
  server: {
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  plugins: {
    Geolocation: {
      permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"]
    },
    Device: {
      permissions: ["BATTERY_STATS"]
    },
    Network: {
      permissions: ["ACCESS_NETWORK_STATE", "ACCESS_WIFI_STATE"]
    }
  }
};

export default config;