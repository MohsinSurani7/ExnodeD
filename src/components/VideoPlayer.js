import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const VideoPlayer = ({ download, onClose }) => {
  const [status, setStatus] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef(null);

  const togglePlayPause = async () => {
    if (status.isLoaded) {
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (isFullscreen) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
        setIsFullscreen(false);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        setIsFullscreen(true);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  const handleSeek = async (position) => {
    if (status.isLoaded && status.durationMillis) {
      const seekPosition = position * status.durationMillis;
      await videoRef.current.setPositionAsync(seekPosition);
    }
  };

  const formatTime = (milliseconds) => {
    if (!milliseconds) return '0:00';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleControls = () => {
    setShowControls(!showControls);
    
    // Auto-hide controls after 3 seconds
    if (!showControls) {
      setTimeout(() => setShowControls(false), 3000);
    }
  };

  // Mock video source - in real app, this would be the actual downloaded file
  const videoSource = {
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  };

  return (
    <View style={[styles.container, isFullscreen && styles.fullscreenContainer]}>
      <View style={[styles.videoContainer, isFullscreen && styles.fullscreenVideo]}>
        <TouchableOpacity 
          style={styles.videoTouchable}
          onPress={toggleControls}
          activeOpacity={1}
        >
          <Video
            ref={videoRef}
            source={videoSource}
            style={styles.video}
            useNativeControls={false}
            resizeMode="contain"
            shouldPlay={false}
            isLooping={false}
            onPlaybackStatusUpdate={setStatus}
            onError={(error) => {
              console.error('Video playback error:', error);
              Alert.alert('Playback Error', 'Unable to play this video file.');
            }}
          />
          
          {showControls && (
            <View style={styles.controls}>
              <View style={styles.topControls}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
                
                <Text style={styles.videoTitle} numberOfLines={1}>
                  {download.videoMetadata.title}
                </Text>
                
                <TouchableOpacity style={styles.fullscreenButton} onPress={toggleFullscreen}>
                  <Ionicons 
                    name={isFullscreen ? "contract" : "expand"} 
                    size={24} 
                    color="#fff" 
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.centerControls}>
                <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
                  <Ionicons 
                    name={status.isPlaying ? "pause" : "play"} 
                    size={48} 
                    color="#fff" 
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.bottomControls}>
                <Text style={styles.timeText}>
                  {formatTime(status.positionMillis)}
                </Text>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressTrack}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: `${status.durationMillis ? 
                            (status.positionMillis / status.durationMillis) * 100 : 0}%` 
                        }
                      ]} 
                    />
                  </View>
                </View>
                
                <Text style={styles.timeText}>
                  {formatTime(status.durationMillis)}
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      {!isFullscreen && (
        <View style={styles.videoInfo}>
          <Text style={styles.infoTitle}>{download.videoMetadata.title}</Text>
          <Text style={styles.infoSubtitle}>
            {download.quality} • {download.videoMetadata.platform} • {download.videoMetadata.duration}
          </Text>
          <Text style={styles.infoAuthor}>by {download.videoMetadata.author}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  videoContainer: {
    width: screenWidth,
    height: screenWidth * (9/16), // 16:9 aspect ratio
    backgroundColor: '#000',
  },
  fullscreenVideo: {
    width: screenHeight,
    height: screenWidth,
  },
  videoTouchable: {
    flex: 1,
  },
  video: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  videoTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  fullscreenButton: {
    padding: 8,
  },
  centerControls: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'center',
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  videoInfo: {
    padding: 16,
    backgroundColor: '#fff',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoAuthor: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default VideoPlayer;

