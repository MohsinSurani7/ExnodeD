import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DownloadManager } from '../../services/downloadManager';
import { VideoService } from '../../services/videoService';

// Async thunks
export const startDownload = createAsyncThunk(
  'downloads/startDownload',
  async ({ videoMetadata, quality }, { rejectWithValue }) => {
    try {
      const downloadId = await DownloadManager.startDownload(videoMetadata, quality);
      return { downloadId, videoMetadata, quality };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchVideoMetadata = createAsyncThunk(
  'downloads/fetchVideoMetadata',
  async ({ url, platform }, { rejectWithValue }) => {
    try {
      const metadata = await VideoService.getVideoMetadata(url, platform);
      return metadata;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const downloadsSlice = createSlice({
  name: 'downloads',
  initialState: {
    downloads: [],
    currentVideo: null,
    loading: false,
    error: null,
    filter: 'all', // all, downloading, completed
  },
  reducers: {
    updateDownload: (state, action) => {
      const { downloadId, updates } = action.payload;
      const index = state.downloads.findIndex(d => d.id === downloadId);
      if (index !== -1) {
        state.downloads[index] = { ...state.downloads[index], ...updates };
      }
    },
    addDownload: (state, action) => {
      state.downloads.push(action.payload);
    },
    removeDownload: (state, action) => {
      const downloadId = action.payload;
      state.downloads = state.downloads.filter(d => d.id !== downloadId);
    },
    clearAllDownloads: (state) => {
      state.downloads = [];
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setCurrentVideo: (state, action) => {
      state.currentVideo = action.payload;
    },
    clearCurrentVideo: (state) => {
      state.currentVideo = null;
    },
    updateDownloads: (state, action) => {
      state.downloads = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Start download
      .addCase(startDownload.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startDownload.fulfilled, (state, action) => {
        state.loading = false;
        // Download will be added via updateDownloads when DownloadManager notifies
      })
      .addCase(startDownload.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch video metadata
      .addCase(fetchVideoMetadata.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentVideo = null;
      })
      .addCase(fetchVideoMetadata.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVideo = action.payload;
      })
      .addCase(fetchVideoMetadata.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentVideo = null;
      });
  },
});

export const {
  updateDownload,
  addDownload,
  removeDownload,
  clearAllDownloads,
  setFilter,
  setCurrentVideo,
  clearCurrentVideo,
  updateDownloads,
} = downloadsSlice.actions;

// Selectors
export const selectDownloads = (state) => state.downloads.downloads;
export const selectCurrentVideo = (state) => state.downloads.currentVideo;
export const selectDownloadsLoading = (state) => state.downloads.loading;
export const selectDownloadsError = (state) => state.downloads.error;
export const selectDownloadsFilter = (state) => state.downloads.filter;

export const selectFilteredDownloads = (state) => {
  const { downloads, filter } = state.downloads;
  
  switch (filter) {
    case 'downloading':
      return downloads.filter(d => 
        d.status === 'downloading' || d.status === 'paused' || d.status === 'pending'
      );
    case 'completed':
      return downloads.filter(d => d.status === 'completed');
    default:
      return downloads;
  }
};

export const selectDownloadCounts = (state) => {
  const downloads = state.downloads.downloads;
  return {
    all: downloads.length,
    downloading: downloads.filter(d => 
      d.status === 'downloading' || d.status === 'paused' || d.status === 'pending'
    ).length,
    completed: downloads.filter(d => d.status === 'completed').length,
  };
};

export const selectActiveDownloads = (state) => {
  return state.downloads.downloads.filter(d => 
    d.status === 'downloading' || d.status === 'pending'
  );
};

export const selectCompletedDownloads = (state) => {
  return state.downloads.downloads.filter(d => d.status === 'completed');
};

export default downloadsSlice.reducer;

