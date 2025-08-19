import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SettingItem from '../components/SettingItem';
import { StorageManager } from '../utils/storage';
import { DownloadManager } from '../services/downloadManager';

const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    theme: 'auto',
    notifications: true,
    autoDownload: false,
    downloadQuality: '720p',
    downloadLocation: 'app',
    backgroundDownload: true,
  });
  const [storageInfo, setStorageInfo] = useState(null);
  const [downloadsInfo, setDownloadsInfo] = useState(null);

  useEffect(() => {
    loadSettings();
    loadStorageInfo();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await StorageManager.loadSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadStorageInfo = async () => {
    try {
      const storage = await StorageManager.getStorageInfo();
      const downloads = await StorageManager.getDownloadsFolderSize();
      setStorageInfo(storage);
      setDownloadsInfo(downloads);
    } catch (error) {
      console.error('Error loading storage info:', error);
    }
  };

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await StorageManager.saveSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const showThemeOptions = () => {
    const options = ['Light', 'Dark', 'Auto (System)', 'Cancel'];
    const values = ['light', 'dark', 'auto'];
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 3,
          title: 'Select Theme',
        },
        (buttonIndex) => {
          if (buttonIndex < 3) {
            updateSetting('theme', values[buttonIndex]);
          }
        }
      );
    } else {
      // For Android, you could implement a modal or use a library
      Alert.alert('Theme Selection', 'Theme selection not implemented for Android in this demo');
    }
  };

  const showQualityOptions = () => {
    const options = ['360p', '480p', '720p', '1080p', 'Cancel'];
    const values = ['360p', '480p', '720p', '1080p'];
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 4,
          title: 'Default Download Quality',
        },
        (buttonIndex) => {
          if (buttonIndex < 4) {
            updateSetting('downloadQuality', values[buttonIndex]);
          }
        }
      );
    } else {
      Alert.alert('Quality Selection', 'Quality selection not implemented for Android in this demo');
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear temporary files and cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageManager.clearCache();
              Alert.alert('Success', 'Cache cleared successfully');
              loadStorageInfo();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const handleClearDownloads = () => {
    Alert.alert(
      'Clear All Downloads',
      'This will delete all downloaded videos and cancel active downloads. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await DownloadManager.clearAllDownloads();
              await StorageManager.clearDownloadsFolder();
              Alert.alert('Success', 'All downloads cleared');
              loadStorageInfo();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear downloads');
            }
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const exportData = await StorageManager.exportData();
      // In a real app, you would save this to a file or share it
      Alert.alert('Export Data', 'Data export feature would be implemented here');
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const getThemeDisplayText = () => {
    switch (settings.theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'auto':
        return 'Auto (System)';
      default:
        return 'Auto (System)';
    }
  };

  const renderSection = (title, children) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderSection('Appearance', (
          <SettingItem
            icon="color-palette-outline"
            title="Theme"
            subtitle="Choose your preferred theme"
            type="value"
            rightText={getThemeDisplayText()}
            onPress={showThemeOptions}
          />
        ))}

        {renderSection('Downloads', (
          <>
            <SettingItem
              icon="notifications-outline"
              title="Notifications"
              subtitle="Get notified when downloads complete"
              type="switch"
              value={settings.notifications}
              onValueChange={(value) => updateSetting('notifications', value)}
            />
            <SettingItem
              icon="download-outline"
              title="Auto Download"
              subtitle="Start downloads automatically after analysis"
              type="switch"
              value={settings.autoDownload}
              onValueChange={(value) => updateSetting('autoDownload', value)}
            />
            <SettingItem
              icon="videocam-outline"
              title="Default Quality"
              subtitle="Default video quality for downloads"
              type="value"
              rightText={settings.downloadQuality}
              onPress={showQualityOptions}
            />
            <SettingItem
              icon="cloud-download-outline"
              title="Background Downloads"
              subtitle="Continue downloads when app is in background"
              type="switch"
              value={settings.backgroundDownload}
              onValueChange={(value) => updateSetting('backgroundDownload', value)}
            />
          </>
        ))}

        {renderSection('Storage', (
          <>
            {storageInfo && (
              <SettingItem
                icon="phone-portrait-outline"
                title="Device Storage"
                subtitle={`${storageInfo.usedSpaceFormatted} used of ${storageInfo.totalSpaceFormatted}`}
                type="value"
                rightText={storageInfo.freeSpaceFormatted + ' free'}
              />
            )}
            {downloadsInfo && (
              <SettingItem
                icon="folder-outline"
                title="Downloads Folder"
                subtitle={`${downloadsInfo.fileCount} files`}
                type="value"
                rightText={downloadsInfo.totalSizeFormatted}
              />
            )}
            <SettingItem
              icon="trash-outline"
              title="Clear Cache"
              subtitle="Clear temporary files and cached data"
              onPress={handleClearCache}
            />
            <SettingItem
              icon="close-circle-outline"
              title="Clear All Downloads"
              subtitle="Delete all downloaded videos"
              onPress={handleClearDownloads}
            />
          </>
        ))}

        {renderSection('Data', (
          <>
            <SettingItem
              icon="share-outline"
              title="Export Data"
              subtitle="Export your downloads and settings"
              onPress={handleExportData}
            />
            <SettingItem
              icon="document-text-outline"
              title="Import Data"
              subtitle="Import previously exported data"
              onPress={() => Alert.alert('Import Data', 'Import feature would be implemented here')}
            />
          </>
        ))}

        {renderSection('About', (
          <>
            <SettingItem
              icon="information-circle-outline"
              title="App Version"
              type="value"
              rightText="1.0.0"
            />
            <SettingItem
              icon="help-circle-outline"
              title="Help & Support"
              onPress={() => Alert.alert('Help & Support', 'Help section would be implemented here')}
            />
            <SettingItem
              icon="document-outline"
              title="Privacy Policy"
              onPress={() => Alert.alert('Privacy Policy', 'Privacy policy would be displayed here')}
            />
            <SettingItem
              icon="shield-checkmark-outline"
              title="Terms of Service"
              onPress={() => Alert.alert('Terms of Service', 'Terms of service would be displayed here')}
            />
          </>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>ExNode Video Downloader</Text>
          <Text style={styles.footerSubtext}>Made with ❤️ for video enthusiasts</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default SettingsScreen;

