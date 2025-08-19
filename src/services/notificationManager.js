import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { BackgroundTaskManager } from './backgroundTaskManager';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationManager {
  static isInitialized = false;
  static notificationListener = null;
  static responseListener = null;

  // Initialize notification manager
  static async initialize() {
    try {
      if (this.isInitialized) return true;

      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permission not granted');
        return false;
      }

      // Configure notification categories (iOS)
      if (Platform.OS === 'ios') {
        await this.setupNotificationCategories();
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing notification manager:', error);
      return false;
    }
  }

  // Set up notification categories for iOS
  static async setupNotificationCategories() {
    try {
      await Notifications.setNotificationCategoryAsync('download', [
        {
          identifier: 'pause',
          buttonTitle: 'Pause',
          options: { opensAppToForeground: false },
        },
        {
          identifier: 'cancel',
          buttonTitle: 'Cancel',
          options: { isDestructive: true, opensAppToForeground: false },
        },
      ]);

      await Notifications.setNotificationCategoryAsync('completed', [
        {
          identifier: 'play',
          buttonTitle: 'Play',
          options: { opensAppToForeground: true },
        },
        {
          identifier: 'share',
          buttonTitle: 'Share',
          options: { opensAppToForeground: false },
        },
      ]);
    } catch (error) {
      console.error('Error setting up notification categories:', error);
    }
  }

  // Set up notification listeners
  static setupNotificationListeners() {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      this.handleNotificationReceived.bind(this)
    );

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      this.handleNotificationResponse.bind(this)
    );
  }

  // Handle notification received
  static handleNotificationReceived(notification) {
    console.log('Notification received:', notification);
    // You can add custom logic here for handling notifications while app is open
  }

  // Handle notification response (user interaction)
  static handleNotificationResponse(response) {
    const { notification, actionIdentifier } = response;
    const { data } = notification.request.content;

    console.log('Notification response:', actionIdentifier, data);

    // Handle different action types
    switch (actionIdentifier) {
      case 'pause':
        this.handlePauseAction(data);
        break;
      case 'cancel':
        this.handleCancelAction(data);
        break;
      case 'play':
        this.handlePlayAction(data);
        break;
      case 'share':
        this.handleShareAction(data);
        break;
      default:
        this.handleDefaultAction(data);
        break;
    }
  }

  // Handle pause action
  static handlePauseAction(data) {
    if (data.downloadId) {
      // Pause the download
      console.log('Pausing download:', data.downloadId);
      // You would call your download manager here
    }
  }

  // Handle cancel action
  static handleCancelAction(data) {
    if (data.downloadId) {
      // Cancel the download
      console.log('Cancelling download:', data.downloadId);
      // You would call your download manager here
    }
  }

  // Handle play action
  static handlePlayAction(data) {
    if (data.downloadId) {
      // Open the video player
      console.log('Playing video:', data.downloadId);
      // You would navigate to the video player here
    }
  }

  // Handle share action
  static handleShareAction(data) {
    if (data.downloadId) {
      // Share the video
      console.log('Sharing video:', data.downloadId);
      // You would open the share dialog here
    }
  }

  // Handle default action (tap on notification)
  static handleDefaultAction(data) {
    console.log('Default notification action:', data);
    // Navigate to appropriate screen based on notification type
  }

  // Send download started notification
  static async sendDownloadStartedNotification(videoTitle, quality, downloadId) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Download Started',
          body: `Started downloading "${videoTitle}" in ${quality}`,
          data: {
            type: 'download_started',
            downloadId,
            videoTitle,
            quality,
          },
          categoryIdentifier: 'download',
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error sending download started notification:', error);
    }
  }

  // Send download progress notification
  static async sendDownloadProgressNotification(videoTitle, progress, downloadId) {
    try {
      // Only send progress notifications at certain intervals to avoid spam
      if (progress % 25 !== 0) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Download Progress',
          body: `"${videoTitle}" - ${progress}% complete`,
          data: {
            type: 'download_progress',
            downloadId,
            videoTitle,
            progress,
          },
          categoryIdentifier: 'download',
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error sending download progress notification:', error);
    }
  }

  // Send download completed notification
  static async sendDownloadCompletedNotification(videoTitle, quality, downloadId) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Download Complete',
          body: `"${videoTitle}" (${quality}) has been downloaded successfully`,
          data: {
            type: 'download_completed',
            downloadId,
            videoTitle,
            quality,
          },
          categoryIdentifier: 'completed',
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error sending download completed notification:', error);
    }
  }

  // Send download failed notification
  static async sendDownloadFailedNotification(videoTitle, error, downloadId) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Download Failed',
          body: `Failed to download "${videoTitle}": ${error}`,
          data: {
            type: 'download_failed',
            downloadId,
            videoTitle,
            error,
          },
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error sending download failed notification:', error);
    }
  }

  // Send scheduled notification
  static async scheduleNotification(title, body, triggerDate, data = {}) {
    try {
      const trigger = triggerDate ? { date: triggerDate } : null;
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger,
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  // Cancel notification
  static async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  // Cancel all notifications
  static async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  // Get notification permissions
  static async getPermissions() {
    try {
      return await Notifications.getPermissionsAsync();
    } catch (error) {
      console.error('Error getting notification permissions:', error);
      return { status: 'undetermined' };
    }
  }

  // Request notification permissions
  static async requestPermissions() {
    try {
      return await Notifications.requestPermissionsAsync();
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return { status: 'denied' };
    }
  }

  // Get scheduled notifications
  static async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Clean up listeners
  static cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }

    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }

    this.isInitialized = false;
  }

  // Send test notification (for debugging)
  static async sendTestNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'This is a test notification from ExNode',
          data: { type: 'test' },
        },
        trigger: { seconds: 1 },
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }
}

