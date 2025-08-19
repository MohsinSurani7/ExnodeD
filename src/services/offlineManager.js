import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { NetworkManager } from '../utils/networkManager';

export class OfflineManager {
  static OFFLINE_KEYS = {
    DOWNLOADED_VIDEOS: 'offline_downloaded_videos',
    CACHED_METADATA: 'offline_cached_metadata',
    OFFLINE_QUEUE: 'offline_queue',
    LAST_SYNC: 'offline_last_sync',
  };

  static listeners = new Set();

  static addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  static notifyListeners(data) {
    this.listeners.forEach(callback => callback(data));
  }

  // Initialize offline manager
  static async initialize() {
    try {
      // Check for pending offline operations
      await this.processPendingOperations();
      
      // Set up network listener for sync when back online
      NetworkManager.addListener(this.handleNetworkChange.bind(this));
      
      return true;
    } catch (error) {
      console.error('Error initializing offline manager:', error);
      return false;
    }
  }

  // Handle network state changes
  static async handleNetworkChange(networkState) {
    if (networkState.isConnected) {
      // Back online - sync pending operations
      await this.syncWhenOnline();
    }
  }

  // Get downloaded videos for offline viewing
  static async getDownloadedVideos() {
    try {
      const data = await AsyncStorage.getItem(this.OFFLINE_KEYS.DOWNLOADED_VIDEOS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting downloaded videos:', error);
      return [];
    }
  }

  // Add video to offline collection
  static async addDownloadedVideo(videoData) {
    try {
      const videos = await this.getDownloadedVideos();
      
      // Check if video already exists
      const existingIndex = videos.findIndex(v => v.id === videoData.id);
      
      if (existingIndex >= 0) {
        videos[existingIndex] = videoData;
      } else {
        videos.push(videoData);
      }
      
      await AsyncStorage.setItem(
        this.OFFLINE_KEYS.DOWNLOADED_VIDEOS,
        JSON.stringify(videos)
      );
      
      this.notifyListeners({ type: 'video_added', video: videoData });
      return true;
    } catch (error) {
      console.error('Error adding downloaded video:', error);
      return false;
    }
  }

  // Remove video from offline collection
  static async removeDownloadedVideo(videoId) {
    try {
      const videos = await this.getDownloadedVideos();
      const filteredVideos = videos.filter(v => v.id !== videoId);
      
      await AsyncStorage.setItem(
        this.OFFLINE_KEYS.DOWNLOADED_VIDEOS,
        JSON.stringify(filteredVideos)
      );
      
      this.notifyListeners({ type: 'video_removed', videoId });
      return true;
    } catch (error) {
      console.error('Error removing downloaded video:', error);
      return false;
    }
  }

  // Cache video metadata for offline access
  static async cacheVideoMetadata(url, metadata) {
    try {
      const cached = await this.getCachedMetadata();
      cached[url] = {
        ...metadata,
        cachedAt: Date.now(),
      };
      
      await AsyncStorage.setItem(
        this.OFFLINE_KEYS.CACHED_METADATA,
        JSON.stringify(cached)
      );
      
      return true;
    } catch (error) {
      console.error('Error caching video metadata:', error);
      return false;
    }
  }

  // Get cached video metadata
  static async getCachedMetadata(url = null) {
    try {
      const data = await AsyncStorage.getItem(this.OFFLINE_KEYS.CACHED_METADATA);
      const cached = data ? JSON.parse(data) : {};
      
      if (url) {
        return cached[url] || null;
      }
      
      return cached;
    } catch (error) {
      console.error('Error getting cached metadata:', error);
      return url ? null : {};
    }
  }

  // Check if video is available offline
  static async isVideoAvailableOffline(videoId) {
    try {
      const videos = await this.getDownloadedVideos();
      const video = videos.find(v => v.id === videoId);
      
      if (!video) return false;
      
      // Check if file still exists
      const fileInfo = await FileSystem.getInfoAsync(video.fileUri);
      return fileInfo.exists;
    } catch (error) {
      console.error('Error checking offline availability:', error);
      return false;
    }
  }

  // Get offline storage usage
  static async getOfflineStorageUsage() {
    try {
      const videos = await this.getDownloadedVideos();
      let totalSize = 0;
      let availableCount = 0;
      
      for (const video of videos) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(video.fileUri);
          if (fileInfo.exists) {
            totalSize += fileInfo.size || 0;
            availableCount++;
          }
        } catch (error) {
          console.warn('Error checking file:', video.fileUri, error);
        }
      }
      
      return {
        totalSize,
        availableCount,
        totalCount: videos.length,
        formattedSize: this.formatBytes(totalSize),
      };
    } catch (error) {
      console.error('Error getting offline storage usage:', error);
      return {
        totalSize: 0,
        availableCount: 0,
        totalCount: 0,
        formattedSize: '0 B',
      };
    }
  }

  // Clean up offline data
  static async cleanupOfflineData() {
    try {
      const videos = await this.getDownloadedVideos();
      const validVideos = [];
      
      for (const video of videos) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(video.fileUri);
          if (fileInfo.exists) {
            validVideos.push(video);
          }
        } catch (error) {
          console.warn('File no longer exists:', video.fileUri);
        }
      }
      
      // Update the list with only valid videos
      await AsyncStorage.setItem(
        this.OFFLINE_KEYS.DOWNLOADED_VIDEOS,
        JSON.stringify(validVideos)
      );
      
      // Clean up old cached metadata (older than 30 days)
      const cached = await this.getCachedMetadata();
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      
      Object.keys(cached).forEach(url => {
        if (cached[url].cachedAt < thirtyDaysAgo) {
          delete cached[url];
        }
      });
      
      await AsyncStorage.setItem(
        this.OFFLINE_KEYS.CACHED_METADATA,
        JSON.stringify(cached)
      );
      
      this.notifyListeners({ type: 'cleanup_completed' });
      return {
        removedVideos: videos.length - validVideos.length,
        remainingVideos: validVideos.length,
      };
    } catch (error) {
      console.error('Error cleaning up offline data:', error);
      return null;
    }
  }

  // Add operation to offline queue
  static async addToOfflineQueue(operation) {
    try {
      const queue = await this.getOfflineQueue();
      queue.push({
        ...operation,
        id: Date.now().toString(),
        timestamp: Date.now(),
      });
      
      await AsyncStorage.setItem(
        this.OFFLINE_KEYS.OFFLINE_QUEUE,
        JSON.stringify(queue)
      );
      
      return true;
    } catch (error) {
      console.error('Error adding to offline queue:', error);
      return false;
    }
  }

  // Get offline queue
  static async getOfflineQueue() {
    try {
      const data = await AsyncStorage.getItem(this.OFFLINE_KEYS.OFFLINE_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting offline queue:', error);
      return [];
    }
  }

  // Process pending operations when back online
  static async processPendingOperations() {
    try {
      const queue = await this.getOfflineQueue();
      
      if (queue.length === 0) return;
      
      const networkState = await NetworkManager.checkConnection();
      if (!networkState.isConnected) return;
      
      // Process each operation
      for (const operation of queue) {
        try {
          await this.processOfflineOperation(operation);
        } catch (error) {
          console.error('Error processing offline operation:', operation, error);
        }
      }
      
      // Clear the queue
      await AsyncStorage.setItem(this.OFFLINE_KEYS.OFFLINE_QUEUE, JSON.stringify([]));
      
      this.notifyListeners({ type: 'sync_completed', processedCount: queue.length });
    } catch (error) {
      console.error('Error processing pending operations:', error);
    }
  }

  // Process individual offline operation
  static async processOfflineOperation(operation) {
    switch (operation.type) {
      case 'analytics_event':
        // Send analytics event
        console.log('Processing analytics event:', operation.data);
        break;
      case 'error_report':
        // Send error report
        console.log('Processing error report:', operation.data);
        break;
      case 'usage_stats':
        // Send usage statistics
        console.log('Processing usage stats:', operation.data);
        break;
      default:
        console.warn('Unknown offline operation type:', operation.type);
    }
  }

  // Sync when back online
  static async syncWhenOnline() {
    try {
      await this.processPendingOperations();
      
      // Update last sync time
      await AsyncStorage.setItem(
        this.OFFLINE_KEYS.LAST_SYNC,
        Date.now().toString()
      );
      
      this.notifyListeners({ type: 'sync_completed' });
    } catch (error) {
      console.error('Error syncing when online:', error);
    }
  }

  // Get last sync time
  static async getLastSyncTime() {
    try {
      const data = await AsyncStorage.getItem(this.OFFLINE_KEYS.LAST_SYNC);
      return data ? new Date(parseInt(data)) : null;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  }

  // Format bytes to human readable format
  static formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get offline status summary
  static async getOfflineStatus() {
    try {
      const [videos, usage, lastSync, queueLength] = await Promise.all([
        this.getDownloadedVideos(),
        this.getOfflineStorageUsage(),
        this.getLastSyncTime(),
        this.getOfflineQueue().then(queue => queue.length),
      ]);
      
      return {
        videosCount: videos.length,
        storageUsage: usage,
        lastSync,
        pendingOperations: queueLength,
        isOnline: NetworkManager.isConnected,
      };
    } catch (error) {
      console.error('Error getting offline status:', error);
      return null;
    }
  }
}

