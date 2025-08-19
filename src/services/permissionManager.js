import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import * as FileSystem from 'expo-file-system';
import { Alert, Linking } from 'react-native';

export class PermissionManager {
  static async requestAllPermissions() {
    try {
      const results = await Promise.allSettled([
        this.requestMediaLibraryPermission(),
        this.requestNotificationPermission(),
        this.requestStoragePermission(),
      ]);

      const permissions = {
        mediaLibrary: results[0].status === 'fulfilled' ? results[0].value : false,
        notifications: results[1].status === 'fulfilled' ? results[1].value : false,
        storage: results[2].status === 'fulfilled' ? results[2].value : false,
      };

      return permissions;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return {
        mediaLibrary: false,
        notifications: false,
        storage: false,
      };
    }
  }

  static async requestMediaLibraryPermission() {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting media library permission:', error);
      return false;
    }
  }

  static async requestNotificationPermission() {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  static async requestStoragePermission() {
    try {
      // For Expo, file system access is generally available
      // In a bare React Native app, you might need additional permissions
      const documentDirectory = FileSystem.documentDirectory;
      return !!documentDirectory;
    } catch (error) {
      console.error('Error checking storage permission:', error);
      return false;
    }
  }

  static async checkPermissionStatus() {
    try {
      const [mediaLibraryStatus, notificationStatus] = await Promise.all([
        MediaLibrary.getPermissionsAsync(),
        Notifications.getPermissionsAsync(),
      ]);

      return {
        mediaLibrary: mediaLibraryStatus.status === 'granted',
        notifications: notificationStatus.status === 'granted',
        storage: true, // Assuming storage is always available in Expo
      };
    } catch (error) {
      console.error('Error checking permission status:', error);
      return {
        mediaLibrary: false,
        notifications: false,
        storage: false,
      };
    }
  }

  static showPermissionAlert(permissionType) {
    const messages = {
      mediaLibrary: {
        title: 'Media Library Access Required',
        message: 'ExNode needs access to your media library to save downloaded videos. Please grant permission in Settings.',
      },
      notifications: {
        title: 'Notification Permission Required',
        message: 'ExNode needs notification permission to inform you when downloads are complete. Please grant permission in Settings.',
      },
      storage: {
        title: 'Storage Access Required',
        message: 'ExNode needs storage access to download and save videos. Please grant permission in Settings.',
      },
    };

    const { title, message } = messages[permissionType] || messages.storage;

    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => Linking.openSettings(),
        },
      ]
    );
  }

  static async ensurePermissions() {
    const permissions = await this.checkPermissionStatus();
    const missingPermissions = [];

    if (!permissions.mediaLibrary) {
      missingPermissions.push('mediaLibrary');
    }
    if (!permissions.notifications) {
      missingPermissions.push('notifications');
    }
    if (!permissions.storage) {
      missingPermissions.push('storage');
    }

    if (missingPermissions.length > 0) {
      // Try to request missing permissions
      const newPermissions = await this.requestAllPermissions();
      
      // Check which permissions are still missing
      const stillMissing = [];
      if (!newPermissions.mediaLibrary && missingPermissions.includes('mediaLibrary')) {
        stillMissing.push('mediaLibrary');
      }
      if (!newPermissions.notifications && missingPermissions.includes('notifications')) {
        stillMissing.push('notifications');
      }
      if (!newPermissions.storage && missingPermissions.includes('storage')) {
        stillMissing.push('storage');
      }

      return {
        granted: stillMissing.length === 0,
        missing: stillMissing,
        permissions: newPermissions,
      };
    }

    return {
      granted: true,
      missing: [],
      permissions,
    };
  }

  static async saveToMediaLibrary(fileUri, filename) {
    try {
      const hasPermission = await this.requestMediaLibraryPermission();
      if (!hasPermission) {
        throw new Error('Media library permission not granted');
      }

      const asset = await MediaLibrary.createAssetAsync(fileUri);
      
      // Try to add to a custom album
      try {
        const album = await MediaLibrary.getAlbumAsync('ExNode Downloads');
        if (album == null) {
          await MediaLibrary.createAlbumAsync('ExNode Downloads', asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }
      } catch (albumError) {
        console.warn('Could not add to custom album:', albumError);
        // File is still saved to media library, just not in custom album
      }

      return asset;
    } catch (error) {
      console.error('Error saving to media library:', error);
      throw error;
    }
  }
}

