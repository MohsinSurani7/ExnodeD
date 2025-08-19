import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import DownloadItem from '../components/DownloadItem';
import VideoPlayer from '../components/VideoPlayer';
import { DownloadManager } from '../services/downloadManager';

const DownloadsScreen = () => {
  const [downloads, setDownloads] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [filter, setFilter] = useState('all'); // all, downloading, completed

  useEffect(() => {
    // Subscribe to download updates
    const unsubscribe = DownloadManager.addListener((updatedDownloads) => {
      setDownloads(updatedDownloads);
    });

    // Load initial downloads
    loadDownloads();

    return unsubscribe;
  }, []);

  const loadDownloads = () => {
    const allDownloads = DownloadManager.getDownloads();
    setDownloads(allDownloads);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    loadDownloads();
    setRefreshing(false);
  };

  const handlePlayVideo = (download) => {
    setSelectedVideo(download);
    setShowPlayer(true);
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
    setSelectedVideo(null);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Downloads',
      'Are you sure you want to clear all downloads? This will cancel active downloads and remove completed ones.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => DownloadManager.clearAllDownloads(),
        },
      ]
    );
  };

  const getFilteredDownloads = () => {
    switch (filter) {
      case 'downloading':
        return downloads.filter(d => d.status === 'downloading' || d.status === 'paused' || d.status === 'pending');
      case 'completed':
        return downloads.filter(d => d.status === 'completed');
      default:
        return downloads;
    }
  };

  const getFilterCounts = () => {
    const all = downloads.length;
    const downloading = downloads.filter(d => d.status === 'downloading' || d.status === 'paused' || d.status === 'pending').length;
    const completed = downloads.filter(d => d.status === 'completed').length;
    
    return { all, downloading, completed };
  };

  const renderDownloadItem = ({ item }) => (
    <DownloadItem
      download={item}
      onPlay={handlePlayVideo}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="download-outline" size={64} color="#C7C7CC" />
      <Text style={styles.emptyTitle}>No Downloads</Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'downloading' 
          ? 'No active downloads at the moment'
          : filter === 'completed'
          ? 'No completed downloads yet'
          : 'Start downloading videos from the Home tab'}
      </Text>
    </View>
  );

  const renderFilterButton = (filterType, label, count) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === filterType && styles.activeFilterButton
      ]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[
        styles.filterText,
        filter === filterType && styles.activeFilterText
      ]}>
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  const filteredDownloads = getFilteredDownloads();
  const counts = getFilterCounts();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.filterContainer}>
          {renderFilterButton('all', 'All', counts.all)}
          {renderFilterButton('downloading', 'Active', counts.downloading)}
          {renderFilterButton('completed', 'Completed', counts.completed)}
        </View>
        
        {downloads.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredDownloads}
        renderItem={renderDownloadItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          filteredDownloads.length === 0 && styles.emptyListContainer
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={showPlayer}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleClosePlayer}
      >
        {selectedVideo && (
          <VideoPlayer
            download={selectedVideo}
            onClose={handleClosePlayer}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFF2F2',
    gap: 4,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF3B30',
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default DownloadsScreen;

