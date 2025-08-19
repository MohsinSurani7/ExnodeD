import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { StorageManager } from '../../utils/storage';

// Async thunks
export const loadSettings = createAsyncThunk(
  'settings/loadSettings',
  async (_, { rejectWithValue }) => {
    try {
      const settings = await StorageManager.loadSettings();
      return settings;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveSettings = createAsyncThunk(
  'settings/saveSettings',
  async (settings, { rejectWithValue }) => {
    try {
      await StorageManager.saveSettings(settings);
      return settings;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearCache = createAsyncThunk(
  'settings/clearCache',
  async (_, { rejectWithValue }) => {
    try {
      await StorageManager.clearCache();
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    theme: 'auto',
    notifications: true,
    autoDownload: false,
    downloadQuality: '720p',
    downloadLocation: 'app',
    backgroundDownload: true,
    wifiOnly: false,
    loading: false,
    error: null,
  },
  reducers: {
    updateSetting: (state, action) => {
      const { key, value } = action.payload;
      state[key] = value;
    },
    updateSettings: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetSettings: (state) => {
      return {
        ...state,
        theme: 'auto',
        notifications: true,
        autoDownload: false,
        downloadQuality: '720p',
        downloadLocation: 'app',
        backgroundDownload: true,
        wifiOnly: false,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Load settings
      .addCase(loadSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadSettings.fulfilled, (state, action) => {
        state.loading = false;
        return { ...state, ...action.payload, loading: false, error: null };
      })
      .addCase(loadSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save settings
      .addCase(saveSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        state.loading = false;
        return { ...state, ...action.payload, loading: false, error: null };
      })
      .addCase(saveSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Clear cache
      .addCase(clearCache.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCache.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(clearCache.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  updateSetting,
  updateSettings,
  resetSettings,
} = settingsSlice.actions;

// Selectors
export const selectSettings = (state) => state.settings;
export const selectTheme = (state) => state.settings.theme;
export const selectNotifications = (state) => state.settings.notifications;
export const selectAutoDownload = (state) => state.settings.autoDownload;
export const selectDownloadQuality = (state) => state.settings.downloadQuality;
export const selectDownloadLocation = (state) => state.settings.downloadLocation;
export const selectBackgroundDownload = (state) => state.settings.backgroundDownload;
export const selectWifiOnly = (state) => state.settings.wifiOnly;
export const selectSettingsLoading = (state) => state.settings.loading;
export const selectSettingsError = (state) => state.settings.error;

export default settingsSlice.reducer;

