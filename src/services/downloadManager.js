import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { v4 as uuidv4 } from 'uuid';

export class DownloadManager {
  static downloads = new Map();
  static listeners = new Set();

  static addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  static notifyListeners() {
    this.listeners.forEach(callback => callback(Array.from(this.downloads.values())));
  }

  static async startDownload(videoMetadata, quality) {
    const downloadId = uuidv4();
    const fileName = this.generateFileName(videoMetadata, quality);
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    const downloadItem = {
      id: downloadId,
      videoMetadata,
      quality,
      fileName,
      fileUri,
      status: 'pending',
      progress: 0,
      downloadedBytes: 0,
      totalBytes: 0,
      startTime: Date.now(),
      resumeData: null,
      error: null,
    };

    this.downloads.set(downloadId, downloadItem);
    this.notifyListeners();

    // Start the download process
    this.processDownload(downloadId);

    return downloadId;
  }

  static async processDownload(downloadId) {
    const download = this.downloads.get(downloadId);
    if (!download) return;

    try {
      // Update status to downloading
      download.status = 'downloading';
      this.downloads.set(downloadId, download);
      this.notifyListeners();

      // Simulate download process with mock data
      await this.simulateDownload(downloadId);

    } catch (error) {
      download.status = 'error';
      download.error = error.message;
      this.downloads.set(downloadId, download);
      this.notifyListeners();
    }
  }

  static async simulateDownload(downloadId) {
    const download = this.downloads.get(downloadId);
    if (!download) return;

    // Simulate file size based on quality
    const fileSizes = {
      '360p': 15 * 1024 * 1024,  // 15MB
      '480p': 25 * 1024 * 1024,  // 25MB
      '720p': 50 * 1024 * 1024,  // 50MB
      '1080p': 100 * 1024 * 1024, // 100MB
    };

    const totalBytes = fileSizes[download.quality] || 25 * 1024 * 1024;
    download.totalBytes = totalBytes;

    // Simulate progressive download
    const chunkSize = totalBytes / 100; // 1% chunks
    let downloadedBytes = 0;

    while (downloadedBytes < totalBytes && download.status === 'downloading') {
      // Check if download was paused
      const currentDownload = this.downloads.get(downloadId);
      if (currentDownload.status === 'paused') {
        return;
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 50));

      downloadedBytes += chunkSize;
      const progress = Math.min((downloadedBytes / totalBytes) * 100, 100);

      download.progress = progress;
      download.downloadedBytes = downloadedBytes;
      this.downloads.set(downloadId, download);
      this.notifyListeners();
    }

    // Complete the download
    if (download.status === 'downloading') {
      download.status = 'completed';
      download.progress = 100;
      download.downloadedBytes = totalBytes;
      
      // Create a mock file
      await this.createMockFile(download);
      
      this.downloads.set(downloadId, download);
      this.notifyListeners();
    }
  }

  static async createMockFile(download) {
    try {
      // Create a simple text file as a placeholder
      const content = `Mock video file for: ${download.videoMetadata.title}\nQuality: ${download.quality}\nPlatform: ${download.videoMetadata.platform}`;
      await FileSystem.writeAsStringAsync(download.fileUri, content);
    } catch (error) {
      console.error('Error creating mock file:', error);
    }
  }

  static pauseDownload(downloadId) {
    const download = this.downloads.get(downloadId);
    if (download && download.status === 'downloading') {
      download.status = 'paused';
      this.downloads.set(downloadId, download);
      this.notifyListeners();
    }
  }

  static resumeDownload(downloadId) {
    const download = this.downloads.get(downloadId);
    if (download && download.status === 'paused') {
      download.status = 'downloading';
      this.downloads.set(downloadId, download);
      this.notifyListeners();
      
      // Resume the download process
      this.processDownload(downloadId);
    }
  }

  static cancelDownload(downloadId) {
    const download = this.downloads.get(downloadId);
    if (download) {
      download.status = 'cancelled';
      this.downloads.set(downloadId, download);
      this.notifyListeners();

      // Clean up the file if it exists
      this.cleanupFile(download.fileUri);
    }
  }

  static deleteDownload(downloadId) {
    const download = this.downloads.get(downloadId);
    if (download) {
      // Clean up the file
      this.cleanupFile(download.fileUri);
      
      // Remove from downloads map
      this.downloads.delete(downloadId);
      this.notifyListeners();
    }
  }

  static async cleanupFile(fileUri) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(fileUri);
      }
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  }

  static generateFileName(videoMetadata, quality) {
    // Sanitize title for filename
    const sanitizedTitle = videoMetadata.title
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
    
    const timestamp = Date.now();
    const extension = this.getFileExtension(videoMetadata.platform);
    
    return `${sanitizedTitle}_${quality}_${timestamp}.${extension}`;
  }

  static getFileExtension(platform) {
    // Return appropriate file extension based on platform
    switch (platform) {
      case 'youtube':
        return 'mp4';
      case 'instagram':
        return 'mp4';
      case 'tiktok':
        return 'mp4';
      case 'facebook':
        return 'mp4';
      case 'twitter':
        return 'mp4';
      case 'vimeo':
        return 'mp4';
      case 'dailymotion':
        return 'mp4';
      default:
        return 'mp4';
    }
  }

  static getDownloads() {
    return Array.from(this.downloads.values());
  }

  static getDownload(downloadId) {
    return this.downloads.get(downloadId);
  }

  static getActiveDownloads() {
    return Array.from(this.downloads.values()).filter(
      download => download.status === 'downloading' || download.status === 'pending'
    );
  }

  static getCompletedDownloads() {
    return Array.from(this.downloads.values()).filter(
      download => download.status === 'completed'
    );
  }

  static async clearAllDownloads() {
    const downloads = Array.from(this.downloads.values());
    
    // Cancel active downloads and clean up files
    for (const download of downloads) {
      if (download.status === 'downloading' || download.status === 'pending') {
        this.cancelDownload(download.id);
      } else {
        await this.cleanupFile(download.fileUri);
      }
    }
    
    this.downloads.clear();
    this.notifyListeners();
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

