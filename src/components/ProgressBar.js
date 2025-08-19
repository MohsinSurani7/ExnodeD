import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Progress } from 'react-native-progress';

const ProgressBar = ({ progress, status, fileName }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'downloading':
        return '#007AFF';
      case 'completed':
        return '#34C759';
      case 'paused':
        return '#FF9500';
      case 'error':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.fileName} numberOfLines={1}>
        {fileName}
      </Text>
      <View style={styles.progressContainer}>
        <Progress.Bar
          progress={progress / 100}
          width={null}
          height={6}
          color={getStatusColor()}
          unfilledColor="#E5E5EA"
          borderWidth={0}
          style={styles.progressBar}
        />
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {status === 'downloading' ? `${Math.round(progress)}%` : status}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    marginRight: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 60,
    textAlign: 'right',
  },
});

export default ProgressBar;

