import { createSlice } from '@reduxjs/toolkit';

const appSlice = createSlice({
  name: 'app',
  initialState: {
    isInitialized: false,
    networkStatus: {
      isConnected: true,
      type: 'unknown',
      quality: 'unknown',
    },
    permissions: {
      mediaLibrary: false,
      notifications: false,
      storage: false,
    },
    storageInfo: {
      freeSpace: 0,
      totalSpace: 0,
      usedSpace: 0,
    },
    errors: [],
    activeTab: 'Home',
    isBackgroundTaskActive: false,
  },
  reducers: {
    setInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },
    updateNetworkStatus: (state, action) => {
      state.networkStatus = { ...state.networkStatus, ...action.payload };
    },
    updatePermissions: (state, action) => {
      state.permissions = { ...state.permissions, ...action.payload };
    },
    updateStorageInfo: (state, action) => {
      state.storageInfo = { ...state.storageInfo, ...action.payload };
    },
    addError: (state, action) => {
      state.errors.push(action.payload);
      // Keep only last 50 errors
      if (state.errors.length > 50) {
        state.errors = state.errors.slice(-50);
      }
    },
    removeError: (state, action) => {
      const errorId = action.payload;
      state.errors = state.errors.filter(error => error.id !== errorId);
    },
    clearErrors: (state) => {
      state.errors = [];
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setBackgroundTaskActive: (state, action) => {
      state.isBackgroundTaskActive = action.payload;
    },
  },
});

export const {
  setInitialized,
  updateNetworkStatus,
  updatePermissions,
  updateStorageInfo,
  addError,
  removeError,
  clearErrors,
  setActiveTab,
  setBackgroundTaskActive,
} = appSlice.actions;

// Selectors
export const selectIsInitialized = (state) => state.app.isInitialized;
export const selectNetworkStatus = (state) => state.app.networkStatus;
export const selectPermissions = (state) => state.app.permissions;
export const selectStorageInfo = (state) => state.app.storageInfo;
export const selectErrors = (state) => state.app.errors;
export const selectActiveTab = (state) => state.app.activeTab;
export const selectIsBackgroundTaskActive = (state) => state.app.isBackgroundTaskActive;

export const selectIsConnected = (state) => state.app.networkStatus.isConnected;
export const selectConnectionType = (state) => state.app.networkStatus.type;
export const selectConnectionQuality = (state) => state.app.networkStatus.quality;

export const selectHasMediaLibraryPermission = (state) => state.app.permissions.mediaLibrary;
export const selectHasNotificationPermission = (state) => state.app.permissions.notifications;
export const selectHasStoragePermission = (state) => state.app.permissions.storage;

export const selectRecentErrors = (state) => state.app.errors.slice(-10);
export const selectErrorCount = (state) => state.app.errors.length;

export default appSlice.reducer;

