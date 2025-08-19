import AsyncStorage from '@react-native-async-storage/async-storage';
import { SecurityConfig } from '../config/security';

export class PrivacyManager {
  static PRIVACY_KEYS = {
    CONSENT: 'privacy_consent',
    ANALYTICS_CONSENT: 'analytics_consent',
    DATA_SHARING_CONSENT: 'data_sharing_consent',
    LAST_PRIVACY_UPDATE: 'last_privacy_update',
  };

  // Check if user has given privacy consent
  static async hasPrivacyConsent() {
    try {
      const consent = await AsyncStorage.getItem(this.PRIVACY_KEYS.CONSENT);
      return consent === 'true';
    } catch (error) {
      console.error('Error checking privacy consent:', error);
      return false;
    }
  }

  // Set privacy consent
  static async setPrivacyConsent(consent) {
    try {
      await AsyncStorage.setItem(this.PRIVACY_KEYS.CONSENT, consent.toString());
      await AsyncStorage.setItem(this.PRIVACY_KEYS.LAST_PRIVACY_UPDATE, Date.now().toString());
    } catch (error) {
      console.error('Error setting privacy consent:', error);
    }
  }

  // Check analytics consent
  static async hasAnalyticsConsent() {
    try {
      const consent = await AsyncStorage.getItem(this.PRIVACY_KEYS.ANALYTICS_CONSENT);
      return consent === 'true';
    } catch (error) {
      console.error('Error checking analytics consent:', error);
      return false;
    }
  }

  // Set analytics consent
  static async setAnalyticsConsent(consent) {
    try {
      await AsyncStorage.setItem(this.PRIVACY_KEYS.ANALYTICS_CONSENT, consent.toString());
    } catch (error) {
      console.error('Error setting analytics consent:', error);
    }
  }

  // Check data sharing consent
  static async hasDataSharingConsent() {
    try {
      const consent = await AsyncStorage.getItem(this.PRIVACY_KEYS.DATA_SHARING_CONSENT);
      return consent === 'true';
    } catch (error) {
      console.error('Error checking data sharing consent:', error);
      return false;
    }
  }

  // Set data sharing consent
  static async setDataSharingConsent(consent) {
    try {
      await AsyncStorage.setItem(this.PRIVACY_KEYS.DATA_SHARING_CONSENT, consent.toString());
    } catch (error) {
      console.error('Error setting data sharing consent:', error);
    }
  }

  // Sanitize URL for logging (remove sensitive parameters)
  static sanitizeUrl(url) {
    try {
      const urlObj = new URL(url);
      
      // Remove sensitive query parameters
      const sensitiveParams = ['token', 'key', 'password', 'secret', 'auth'];
      sensitiveParams.forEach(param => {
        urlObj.searchParams.delete(param);
      });

      return urlObj.toString();
    } catch (error) {
      // If URL parsing fails, return a generic placeholder
      return '[URL]';
    }
  }

  // Sanitize data for logging
  static sanitizeData(data) {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = { ...data };
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'auth', 'email', 'phone'];

    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  // Clear all user data (for GDPR compliance)
  static async clearAllUserData() {
    try {
      // Get all AsyncStorage keys
      const keys = await AsyncStorage.getAllKeys();
      
      // Remove all app-specific data
      const appKeys = keys.filter(key => 
        key.startsWith('downloads') || 
        key.startsWith('settings') || 
        key.startsWith('cache_') ||
        key.startsWith('privacy_')
      );

      await AsyncStorage.multiRemove(appKeys);
      
      return true;
    } catch (error) {
      console.error('Error clearing user data:', error);
      return false;
    }
  }

  // Export user data (for GDPR compliance)
  static async exportUserData() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter(key => 
        key.startsWith('downloads') || 
        key.startsWith('settings') ||
        key.startsWith('privacy_')
      );

      const userData = {};
      for (const key of appKeys) {
        const value = await AsyncStorage.getItem(key);
        userData[key] = value;
      }

      return {
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0',
        data: userData,
      };
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }

  // Check if privacy policy needs to be shown
  static async shouldShowPrivacyPolicy() {
    try {
      const hasConsent = await this.hasPrivacyConsent();
      const lastUpdate = await AsyncStorage.getItem(this.PRIVACY_KEYS.LAST_PRIVACY_UPDATE);
      
      // Show if no consent or if privacy policy was updated recently
      const policyUpdateTime = new Date('2024-01-01').getTime(); // Update this when policy changes
      const lastUpdateTime = lastUpdate ? parseInt(lastUpdate) : 0;
      
      return !hasConsent || lastUpdateTime < policyUpdateTime;
    } catch (error) {
      console.error('Error checking privacy policy status:', error);
      return true; // Show by default if there's an error
    }
  }

  // Log user action (only if consent given)
  static async logUserAction(action, data = {}) {
    try {
      const hasConsent = await this.hasAnalyticsConsent();
      
      if (!hasConsent || !SecurityConfig.privacy.logUserActions) {
        return;
      }

      const logEntry = {
        timestamp: Date.now(),
        action,
        data: this.sanitizeData(data),
      };

      // In a real app, you would send this to your analytics service
      console.log('User Action:', logEntry);
    } catch (error) {
      console.error('Error logging user action:', error);
    }
  }

  // Get privacy settings summary
  static async getPrivacySettings() {
    try {
      const [
        privacyConsent,
        analyticsConsent,
        dataSharingConsent,
        lastUpdate
      ] = await Promise.all([
        this.hasPrivacyConsent(),
        this.hasAnalyticsConsent(),
        this.hasDataSharingConsent(),
        AsyncStorage.getItem(this.PRIVACY_KEYS.LAST_PRIVACY_UPDATE)
      ]);

      return {
        privacyConsent,
        analyticsConsent,
        dataSharingConsent,
        lastUpdate: lastUpdate ? new Date(parseInt(lastUpdate)) : null,
      };
    } catch (error) {
      console.error('Error getting privacy settings:', error);
      return {
        privacyConsent: false,
        analyticsConsent: false,
        dataSharingConsent: false,
        lastUpdate: null,
      };
    }
  }
}

