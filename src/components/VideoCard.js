import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const VideoCard = ({ video, onDownload, onPlay }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: video.thumbnail }} style={styles.thumbnail} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {video.title}
        </Text>
        <Text style={styles.duration}>{video.duration}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.downloadButton} onPress={onDownload}>
            <Ionicons name="download-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Download</Text>
          </TouchableOpacity>
          {video.isDownloaded && (
            <TouchableOpacity style={styles.playButton} onPress={onPlay}>
              <Ionicons name="play-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Play</Text>
            </TouchableOpacity>
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
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  thumbnail: {
    width: 120,
    height: 80,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  duration: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 10,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default VideoCard;

