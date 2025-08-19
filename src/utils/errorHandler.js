import { Alert } from 'react-native';

export class ErrorHandler {
  static errors = [];
  static listeners = new Set();

  static addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  static notifyListeners(error) {
    this.listeners.forEach(callback => callback(error));
  }

  static logError(error, context = '') {
    const errorInfo = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      message: error.message || 'Unknown error',
      stack: error.stack || '',
      context,
      type: this.getErrorType(error),
    };

    this.errors.push(errorInfo);
    
    // Keep only last 100 errors
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100);
    }

    console.error(`[${context}]`, error);
    this.notifyListeners(errorInfo);

    return errorInfo;
  }

  static getErrorType(error) {
    if (error.name) {
      return error.name;
    }
    
    if (error.message) {
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return 'NetworkError';
      }
      if (error.message.includes('permission')) {
        return 'PermissionError';
      }
      if (error.message.includes('storage') || error.message.includes('file')) {
        return 'StorageError';
      }
      if (error.message.includes('download')) {
        return 'DownloadError';
      }
    }

    return 'UnknownError';
  }

  static handleNetworkError(error, context = 'Network') {
    const errorInfo = this.logError(error, context);
    
    const userMessage = this.getNetworkErrorMessage(error);
    
    Alert.alert(
      'Network Error',
      userMessage,
      [
        { text: 'OK', style: 'default' },
        { text: 'Retry', onPress: () => this.notifyListeners({ ...errorInfo, action: 'retry' }) },
      ]
    );

    return errorInfo;
  }

  static handleDownloadError(error, videoTitle, context = 'Download') {
    const errorInfo = this.logError(error, context);
    
    const userMessage = this.getDownloadErrorMessage(error);
    
    Alert.alert(
      'Download Error',
      `Failed to download "${videoTitle}": ${userMessage}`,
      [
        { text: 'OK', style: 'default' },
        { text: 'Retry', onPress: () => this.notifyListeners({ ...errorInfo, action: 'retry', videoTitle }) },
      ]
    );

    return errorInfo;
  }

  static handlePermissionError(error, permissionType, context = 'Permission') {
    const errorInfo = this.logError(error, context);
    
    const userMessage = this.getPermissionErrorMessage(permissionType);
    
    Alert.alert(
      'Permission Required',
      userMessage,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Settings', onPress: () => this.notifyListeners({ ...errorInfo, action: 'settings' }) },
      ]
    );

    return errorInfo;
  }

  static handleStorageError(error, context = 'Storage') {
    const errorInfo = this.logError(error, context);
    
    const userMessage = this.getStorageErrorMessage(error);
    
    Alert.alert(
      'Storage Error',
      userMessage,
      [{ text: 'OK', style: 'default' }]
    );

    return errorInfo;
  }

  static getNetworkErrorMessage(error) {
    if (error.message.includes('timeout')) {
      return 'The request timed out. Please check your internet connection and try again.';
    }
    if (error.message.includes('offline') || error.message.includes('network')) {
      return 'No internet connection. Please check your network settings and try again.';
    }
    if (error.message.includes('404')) {
      return 'The video could not be found. It may have been removed or the URL is incorrect.';
    }
    if (error.message.includes('403') || error.message.includes('unauthorized')) {
      return 'Access denied. This video may be private or restricted.';
    }
    if (error.message.includes('rate limit')) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    
    return 'A network error occurred. Please check your connection and try again.';
  }

  static getDownloadErrorMessage(error) {
    if (error.message.includes('space') || error.message.includes('storage')) {
      return 'Not enough storage space available.';
    }
    if (error.message.includes('permission')) {
      return 'Permission denied. Please check app permissions.';
    }
    if (error.message.includes('format') || error.message.includes('quality')) {
      return 'The selected quality is not available for this video.';
    }
    if (error.message.includes('platform')) {
      return 'This platform is not supported or the video format is incompatible.';
    }
    
    return 'An error occurred during download. Please try again.';
  }

  static getPermissionErrorMessage(permissionType) {
    switch (permissionType) {
      case 'mediaLibrary':
        return 'ExNode needs access to your media library to save downloaded videos. Please grant permission in Settings.';
      case 'notifications':
        return 'ExNode needs notification permission to inform you when downloads complete. Please grant permission in Settings.';
      case 'storage':
        return 'ExNode needs storage access to download and save videos. Please grant permission in Settings.';
      default:
        return 'ExNode needs additional permissions to function properly. Please grant the required permissions in Settings.';
    }
  }

  static getStorageErrorMessage(error) {
    if (error.message.includes('space') || error.message.includes('full')) {
      return 'Not enough storage space available. Please free up some space and try again.';
    }
    if (error.message.includes('read') || error.message.includes('write')) {
      return 'Unable to access storage. Please check app permissions.';
    }
    
    return 'A storage error occurred. Please check available space and permissions.';
  }

  static getErrors() {
    return [...this.errors];
  }

  static clearErrors() {
    this.errors = [];
    this.notifyListeners({ action: 'clear' });
  }

  static getErrorStats() {
    const errorTypes = {};
    this.errors.forEach(error => {
      errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
    });

    return {
      total: this.errors.length,
      types: errorTypes,
      recent: this.errors.slice(-10),
    };
  }

  // Global error handler for unhandled promise rejections
  static setupGlobalErrorHandler() {
    // This would be called in your app's entry point
    const originalHandler = ErrorUtils.getGlobalHandler();
    
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      this.logError(error, 'Global');
      
      if (isFatal) {
        Alert.alert(
          'Unexpected Error',
          'An unexpected error occurred. The app will restart.',
          [{ text: 'OK', onPress: () => {} }]
        );
      }
      
      originalHandler(error, isFatal);
    });
  }
}

