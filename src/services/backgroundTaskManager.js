import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';

const BACKGROUND_FETCH_TASK = 'background-fetch';

export class BackgroundTaskManager {
  static isRegistered = false;

  static async initialize() {
    try {
      // Configure notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      // Register background task
      await this.registerBackgroundFetch();
      
      return true;
    } catch (error) {
      console.error('Error initializing background tasks:', error);
      return false;
    }
  }

  static async registerBackgroundFetch() {
    try {
      // Define the background task
      TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
        try {
          // This would check for pending downloads and continue them
          console.log('Background fetch executed');
          
          // In a real implementation, you would:
          // 1. Check for pending downloads
          // 2. Continue downloads if network is available
          // 3. Update download progress
          // 4. Send notifications for completed downloads
          
          return BackgroundFetch.BackgroundFetchResult.NewData;
        } catch (error) {
          console.error('Background fetch error:', error);
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }
      });

      // Register the task
      const status = await BackgroundFetch.getStatusAsync();
      if (status === BackgroundFetch.BackgroundFetchStatus.Available) {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
          minimumInterval: 15 * 60, // 15 minutes
          stopOnTerminate: false,
          startOnBoot: true,
        });
        this.isRegistered = true;
        console.log('Background fetch registered successfully');
      } else {
        console.warn('Background fetch not available');
      }
    } catch (error) {
      console.error('Error registering background fetch:', error);
    }
  }

  static async unregisterBackgroundFetch() {
    try {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
      this.isRegistered = false;
      console.log('Background fetch unregistered');
    } catch (error) {
      console.error('Error unregistering background fetch:', error);
    }
  }

  static async sendNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  static async sendDownloadCompleteNotification(videoTitle, quality) {
    await this.sendNotification(
      'Download Complete',
      `"${videoTitle}" (${quality}) has been downloaded successfully.`,
      { type: 'download_complete', videoTitle, quality }
    );
  }

  static async sendDownloadFailedNotification(videoTitle, error) {
    await this.sendNotification(
      'Download Failed',
      `Failed to download "${videoTitle}": ${error}`,
      { type: 'download_failed', videoTitle, error }
    );
  }

  static async sendDownloadStartedNotification(videoTitle, quality) {
    await this.sendNotification(
      'Download Started',
      `Started downloading "${videoTitle}" in ${quality}.`,
      { type: 'download_started', videoTitle, quality }
    );
  }

  static async getBackgroundFetchStatus() {
    try {
      const status = await BackgroundFetch.getStatusAsync();
      const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
      
      return {
        status,
        isRegistered: isTaskRegistered,
        statusText: this.getStatusText(status),
      };
    } catch (error) {
      console.error('Error getting background fetch status:', error);
      return {
        status: BackgroundFetch.BackgroundFetchStatus.Denied,
        isRegistered: false,
        statusText: 'Unknown',
      };
    }
  }

  static getStatusText(status) {
    switch (status) {
      case BackgroundFetch.BackgroundFetchStatus.Available:
        return 'Available';
      case BackgroundFetch.BackgroundFetchStatus.Denied:
        return 'Denied';
      case BackgroundFetch.BackgroundFetchStatus.Restricted:
        return 'Restricted';
      default:
        return 'Unknown';
    }
  }

  static async requestBackgroundPermissions() {
    try {
      // Request notification permissions
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('Notification permission not granted');
        return false;
      }

      // Background fetch permissions are handled automatically by the system
      return true;
    } catch (error) {
      console.error('Error requesting background permissions:', error);
      return false;
    }
  }

  // Simulate background download continuation
  static async continueDownloadsInBackground() {
    try {
      // This would be called by the background task
      // In a real implementation, you would:
      // 1. Get active downloads from storage
      // 2. Check network connectivity
      // 3. Resume paused downloads
      // 4. Update progress
      // 5. Handle completion/errors
      
      console.log('Continuing downloads in background...');
      return true;
    } catch (error) {
      console.error('Error continuing downloads in background:', error);
      return false;
    }
  }
}

