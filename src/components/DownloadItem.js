import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Progress } from 'react-native-progress';
import { DownloadManager } from '../services/downloadManager';

const DownloadItem = ({ download, onPlay }) => {
  const getStatusColor = () => {
    switch (download.status) {
      case 'downloading':
        return '#007AFF';
      case 'completed':
        return '#34C759';
      case 'paused':
        return '#FF9500';
      case 'error':
        return '#FF3B30';
      case 'cancelled':
        return '#8E8E93';
      default:
        return '#8E8E93';
    }
  };

  const getStatusIcon = () => {
    switch (download.status) {
      case 'downloading':
        return 'pause';
      case 'completed':
        return 'play';
      case 'paused':
        return 'play';
      case 'error':
        return 'refresh';
      case 'cancelled':
        return 'trash';
      default:
        return 'download';
    }
  };

  const handleActionPress = () => {
    switch (download.status) {
      case 'downloading':
        DownloadManager.pauseDownload(download.id);
        break;
      case 'paused':
        DownloadManager.resumeDownload(download.id);
        break;
      case 'completed':
        onPlay && onPlay(download);
        break;
      case 'error':
        DownloadManager.resumeDownload(download.id);
        break;
      default:
        break;
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Download',
      'Are you sure you want to delete this download?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => DownloadManager.deleteDownload(download.id),
        },
      ]
    );
  };

  const formatProgress = () => {
    if (download.status === 'completed') {
      return '100%';
    } else if (download.status === 'downloading' || download.status === 'paused') {
      return `${Math.round(download.progress)}%`;
    } else {
      return download.status;
    }
  };

  const formatSize = () => {
    if (download.totalBytes > 0) {
      const downloaded = DownloadManager.formatFileSize(download.downloadedBytes);
      const total = DownloadManager.formatFileSize(download.totalBytes);
      return `${downloaded} / ${total}`;
    }
    return 'Calculating...';
  };

  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: download.videoMetadata.thumbnail }} 
        style={styles.thumbnail}
        defaultSource={require('../../assets/placeholder.png')}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {download.videoMetadata.title}
          </Text>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.subtitle}>
          {download.quality} • {download.videoMetadata.platform}
        </Text>
        
        <View style={styles.progressSection}>
          <Progress.Bar
            progress={download.progress / 100}
            width={null}
            height={4}
            color={getStatusColor()}
            unfilledColor="#E5E5EA"
            borderWidth={0}
            style={styles.progressBar}
          />
          
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>{formatProgress()}</Text>
            <Text style={styles.sizeText}>{formatSize()}</Text>
          </View>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: getStatusColor() }]}
            onPress={handleActionPress}
          >
            <Ionicons name={getStatusIcon()} size={16} color="#fff" />
            <Text style={styles.actionText}>
              {download.status === 'downloading' ? 'Pause' :
               download.status === 'paused' ? 'Resume' :
               download.status === 'completed' ? 'Play' :
               download.status === 'error' ? 'Retry' : 'Download'}
            </Text>
          </TouchableOpacity>
          
          {download.status === 'completed' && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              <Text style={styles.completedText}>Downloaded</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  progressSection: {
    marginBottom: 8,
  },
  progressBar: {
    marginBottom: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  sizeText: {
    fontSize: 11,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '500',
  },
});

export default DownloadItem;

