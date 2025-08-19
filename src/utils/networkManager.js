import NetInfo from '@react-native-community/netinfo';

export class NetworkManager {
  static isConnected = true;
  static connectionType = 'unknown';
  static listeners = new Set();

  static addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  static notifyListeners(networkState) {
    this.listeners.forEach(callback => callback(networkState));
  }

  static async initialize() {
    try {
      // Subscribe to network state changes
      const unsubscribe = NetInfo.addEventListener(state => {
        this.isConnected = state.isConnected;
        this.connectionType = state.type;
        
        const networkState = {
          isConnected: state.isConnected,
          type: state.type,
          isInternetReachable: state.isInternetReachable,
          details: state.details,
        };

        this.notifyListeners(networkState);
      });

      // Get initial network state
      const state = await NetInfo.fetch();
      this.isConnected = state.isConnected;
      this.connectionType = state.type;

      return unsubscribe;
    } catch (error) {
      console.error('Error initializing network manager:', error);
      return null;
    }
  }

  static async checkConnection() {
    try {
      const state = await NetInfo.fetch();
      return {
        isConnected: state.isConnected,
        type: state.type,
        isInternetReachable: state.isInternetReachable,
        details: state.details,
      };
    } catch (error) {
      console.error('Error checking network connection:', error);
      return {
        isConnected: false,
        type: 'unknown',
        isInternetReachable: false,
        details: null,
      };
    }
  }

  static isWiFiConnected() {
    return this.isConnected && this.connectionType === 'wifi';
  }

  static isCellularConnected() {
    return this.isConnected && this.connectionType === 'cellular';
  }

  static shouldAllowDownload(settings = {}) {
    if (!this.isConnected) {
      return {
        allowed: false,
        reason: 'No internet connection',
      };
    }

    // Check if user allows downloads on cellular
    if (this.connectionType === 'cellular' && settings.wifiOnly) {
      return {
        allowed: false,
        reason: 'WiFi-only downloads enabled',
      };
    }

    return {
      allowed: true,
      reason: null,
    };
  }

  static async testInternetConnection() {
    try {
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        timeout: 5000,
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  static getConnectionQuality() {
    // This is a simplified implementation
    // In a real app, you might measure actual speed
    
    if (!this.isConnected) {
      return 'none';
    }

    switch (this.connectionType) {
      case 'wifi':
        return 'excellent';
      case 'cellular':
        // You could check cellular generation (3G, 4G, 5G) here
        return 'good';
      case 'ethernet':
        return 'excellent';
      default:
        return 'unknown';
    }
  }

  static getRecommendedQuality() {
    const quality = this.getConnectionQuality();
    
    switch (quality) {
      case 'excellent':
        return '1080p';
      case 'good':
        return '720p';
      case 'fair':
        return '480p';
      case 'poor':
        return '360p';
      default:
        return '480p';
    }
  }

  static async waitForConnection(timeout = 30000) {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve(true);
        return;
      }

      const timeoutId = setTimeout(() => {
        unsubscribe();
        reject(new Error('Connection timeout'));
      }, timeout);

      const unsubscribe = this.addListener((networkState) => {
        if (networkState.isConnected) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(true);
        }
      });
    });
  }

  static getNetworkInfo() {
    return {
      isConnected: this.isConnected,
      connectionType: this.connectionType,
      quality: this.getConnectionQuality(),
      recommendedQuality: this.getRecommendedQuality(),
    };
  }
}

