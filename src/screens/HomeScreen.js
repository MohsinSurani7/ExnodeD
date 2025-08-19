import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { detectPlatform, getPlatformIcon, getPlatformColor, validateUrl } from '../utils/platformDetector';
import { VideoService } from '../services/videoService';
import { DownloadManager } from '../services/downloadManager';

const HomeScreen = () => {
  const [url, setUrl] = useState('');
  const [videoMetadata, setVideoMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('');

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();
      if (clipboardContent) {
        setUrl(clipboardContent);
        handleAnalyzeUrl(clipboardContent);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to paste from clipboard');
    }
  };

  const handleAnalyzeUrl = async (inputUrl = url) => {
    if (!inputUrl.trim()) {
      Alert.alert('Error', 'Please enter a video URL');
      return;
    }

    if (!validateUrl(inputUrl)) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    const platform = detectPlatform(inputUrl);
    if (platform === 'unknown') {
      Alert.alert('Warning', 'Platform not recognized, but we\'ll try to download anyway');
    }

    setLoading(true);
    try {
      const metadata = await VideoService.getVideoMetadata(inputUrl, platform);
      setVideoMetadata(metadata);
      setSelectedQuality(metadata.qualities[0]); // Default to first quality
    } catch (error) {
      Alert.alert('Error', error.message);
      setVideoMetadata(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoMetadata || !selectedQuality) {
      Alert.alert('Error', 'Please select a quality first');
      return;
    }

    try {
      const downloadId = await DownloadManager.startDownload(videoMetadata, selectedQuality);
      Alert.alert(
        'Download Started',
        `Download started for "${videoMetadata.title}" in ${selectedQuality}. Check the Downloads tab to monitor progress.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', `Failed to start download: ${error.message}`);
    }
  };

  const clearAll = () => {
    setUrl('');
    setVideoMetadata(null);
    setSelectedQuality('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Enter Video URL</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Paste video URL here..."
              value={url}
              onChangeText={setUrl}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.pasteButton} onPress={handlePasteFromClipboard}>
              <Ionicons name="clipboard-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.analyzeButton]} 
              onPress={() => handleAnalyzeUrl()}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="search-outline" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Analyze</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearAll}>
              <Ionicons name="refresh-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {videoMetadata && (
          <View style={styles.videoPreview}>
            <Text style={styles.sectionTitle}>Video Preview</Text>
            
            <View style={styles.platformBadge}>
              <Ionicons 
                name={getPlatformIcon(videoMetadata.platform)} 
                size={16} 
                color={getPlatformColor(videoMetadata.platform)} 
              />
              <Text style={[styles.platformText, { color: getPlatformColor(videoMetadata.platform) }]}>
                {videoMetadata.platform.toUpperCase()}
              </Text>
            </View>

            <Image source={{ uri: videoMetadata.thumbnail }} style={styles.thumbnail} />
            
            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle}>{videoMetadata.title}</Text>
              <Text style={styles.videoAuthor}>by {videoMetadata.author}</Text>
              
              <View style={styles.videoStats}>
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.statText}>{videoMetadata.duration}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="document-outline" size={16} color="#666" />
                  <Text style={styles.statText}>{videoMetadata.fileSize}</Text>
                </View>
              </View>
            </View>

            <View style={styles.qualitySection}>
              <Text style={styles.qualityTitle}>Select Quality:</Text>
              <View style={styles.qualityOptions}>
                {videoMetadata.qualities.map((quality) => (
                  <TouchableOpacity
                    key={quality}
                    style={[
                      styles.qualityButton,
                      selectedQuality === quality && styles.selectedQuality
                    ]}
                    onPress={() => setSelectedQuality(quality)}
                  >
                    <Text style={[
                      styles.qualityText,
                      selectedQuality === quality && styles.selectedQualityText
                    ]}>
                      {quality}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
              <Ionicons name="download" size={24} color="#fff" />
              <Text style={styles.downloadButtonText}>Download Video</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    padding: 16,
  },
  inputSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
  },
  textInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pasteButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  analyzeButton: {
    backgroundColor: '#007AFF',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  videoPreview: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
    gap: 4,
  },
  platformText: {
    fontSize: 12,
    fontWeight: '600',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  videoInfo: {
    marginBottom: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  videoAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  videoStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  qualitySection: {
    marginBottom: 20,
  },
  qualityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  qualityOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  qualityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#F9F9F9',
  },
  selectedQuality: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  qualityText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedQualityText: {
    color: '#fff',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;

