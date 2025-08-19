import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export class StorageManager {
  static KEYS = {
    DOWNLOADS: 'downloads',
    SETTINGS: 'settings',
    DOWNLOAD_HISTORY: 'download_history',
  };

  // AsyncStorage operations
  static async saveData(key, data) {
    try {
      const jsonData = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonData);
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  }

  static async loadData(key, defaultValue = null) {
    try {
      const jsonData = await AsyncStorage.getItem(key);
      return jsonData ? JSON.parse(jsonData) : defaultValue;
    } catch (error) {
      console.error('Error loading data:', error);
      return defaultValue;
    }
  }

  static async removeData(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
      throw error;
    }
  }

  static async clearAllData() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  // Download-specific operations
  static async saveDownloads(downloads) {
    await this.saveData(this.KEYS.DOWNLOADS, downloads);
  }

  static async loadDownloads() {
    return await this.loadData(this.KEYS.DOWNLOADS, []);
  }

  static async saveSettings(settings) {
    await this.saveData(this.KEYS.SETTINGS, settings);
  }

  static async loadSettings() {
    const defaultSettings = {
      theme: 'auto',
      notifications: true,
      autoDownload: false,
      downloadQuality: '720p',
      downloadLocation: 'app',
      backgroundDownload: true,
    };
    return await this.loadData(this.KEYS.SETTINGS, defaultSettings);
  }

  // File system operations
  static async getStorageInfo() {
    try {
      const freeSpace = await FileSystem.getFreeDiskStorageAsync();
      const totalSpace = await FileSystem.getTotalDiskCapacityAsync();
      const usedSpace = totalSpace - freeSpace;

      return {
        freeSpace,
        totalSpace,
        usedSpace,
        freeSpaceFormatted: this.formatBytes(freeSpace),
        totalSpaceFormatted: this.formatBytes(totalSpace),
        usedSpaceFormatted: this.formatBytes(usedSpace),
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return null;
    }
  }

  static async getDownloadsFolderSize() {
    try {
      const downloadDir = FileSystem.documentDirectory;
      const files = await FileSystem.readDirectoryAsync(downloadDir);
      
      let totalSize = 0;
      for (const file of files) {
        const fileUri = `${downloadDir}${file}`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists && !fileInfo.isDirectory) {
          totalSize += fileInfo.size || 0;
        }
      }
      
      return {
        totalSize,
        totalSizeFormatted: this.formatBytes(totalSize),
        fileCount: files.length,
      };
    } catch (error) {
      console.error('Error getting downloads folder size:', error);
      return {
        totalSize: 0,
        totalSizeFormatted: '0 B',
        fileCount: 0,
      };
    }
  }

  static async clearDownloadsFolder() {
    try {
      const downloadDir = FileSystem.documentDirectory;
      const files = await FileSystem.readDirectoryAsync(downloadDir);
      
      for (const file of files) {
        const fileUri = `${downloadDir}${file}`;
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
      }
      
      return true;
    } catch (error) {
      console.error('Error clearing downloads folder:', error);
      return false;
    }
  }

  static formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Cache management
  static async clearCache() {
    try {
      // Clear AsyncStorage cache
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
      
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  // Export/Import functionality
  static async exportData() {
    try {
      const downloads = await this.loadDownloads();
      const settings = await this.loadSettings();
      
      const exportData = {
        downloads,
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };
      
      return exportData;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  static async importData(importData) {
    try {
      if (importData.downloads) {
        await this.saveDownloads(importData.downloads);
      }
      
      if (importData.settings) {
        await this.saveSettings(importData.settings);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }
}

