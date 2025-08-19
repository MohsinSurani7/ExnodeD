import Constants from 'expo-constants';

// Security configuration for the app
export const SecurityConfig = {
  // API Keys - these should be stored securely
  apiKeys: {
    youtube: Constants.expoConfig?.extra?.youtubeApiKey || process.env.YOUTUBE_API_KEY,
    instagram: Constants.expoConfig?.extra?.instagramAccessToken || process.env.INSTAGRAM_ACCESS_TOKEN,
    tiktok: Constants.expoConfig?.extra?.tiktokApiKey || process.env.TIKTOK_API_KEY,
    facebook: Constants.expoConfig?.extra?.facebookAccessToken || process.env.FACEBOOK_ACCESS_TOKEN,
    twitter: Constants.expoConfig?.extra?.twitterBearerToken || process.env.TWITTER_BEARER_TOKEN,
    vimeo: Constants.expoConfig?.extra?.vimeoAccessToken || process.env.VIMEO_ACCESS_TOKEN,
  },

  // App configuration
  app: {
    environment: Constants.expoConfig?.extra?.appEnv || process.env.APP_ENV || 'development',
    debugMode: Constants.expoConfig?.extra?.debugMode || process.env.DEBUG_MODE === 'true',
    analyticsEnabled: Constants.expoConfig?.extra?.analyticsEnabled || process.env.ANALYTICS_ENABLED === 'true',
    adsEnabled: Constants.expoConfig?.extra?.adsEnabled || process.env.ADS_ENABLED === 'true',
  },

  // Security headers for API requests
  headers: {
    'User-Agent': 'ExNode/1.0.0 (Video Downloader App)',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },

  // Rate limiting configuration
  rateLimits: {
    youtube: { requests: 100, window: 60000 }, // 100 requests per minute
    instagram: { requests: 50, window: 60000 }, // 50 requests per minute
    tiktok: { requests: 30, window: 60000 }, // 30 requests per minute
    facebook: { requests: 50, window: 60000 }, // 50 requests per minute
    twitter: { requests: 75, window: 60000 }, // 75 requests per minute
    vimeo: { requests: 100, window: 60000 }, // 100 requests per minute
  },

  // Data retention policies
  dataRetention: {
    downloadHistory: 90, // days
    errorLogs: 30, // days
    analyticsData: 365, // days
    cacheData: 7, // days
  },

  // Privacy settings
  privacy: {
    collectAnalytics: false,
    shareUsageData: false,
    logUserActions: false,
    storePersonalData: false,
  },
};

// Validate API keys on app start
export const validateApiKeys = () => {
  const warnings = [];
  const errors = [];

  Object.entries(SecurityConfig.apiKeys).forEach(([platform, key]) => {
    if (!key) {
      warnings.push(`${platform.toUpperCase()} API key not configured`);
    } else if (key.includes('your_') || key.includes('_here')) {
      errors.push(`${platform.toUpperCase()} API key appears to be a placeholder`);
    }
  });

  if (warnings.length > 0 && SecurityConfig.app.debugMode) {
    console.warn('API Key Warnings:', warnings);
  }

  if (errors.length > 0) {
    console.error('API Key Errors:', errors);
  }

  return { warnings, errors };
};

// Secure API key getter
export const getApiKey = (platform) => {
  const key = SecurityConfig.apiKeys[platform];
  
  if (!key) {
    console.warn(`API key for ${platform} not configured`);
    return null;
  }

  if (key.includes('your_') || key.includes('_here')) {
    console.error(`API key for ${platform} appears to be a placeholder`);
    return null;
  }

  return key;
};

// Check if platform is supported based on API key availability
export const isPlatformSupported = (platform) => {
  const key = getApiKey(platform);
  return key !== null;
};

// Get secure headers for API requests
export const getSecureHeaders = (platform) => {
  const headers = { ...SecurityConfig.headers };
  const apiKey = getApiKey(platform);

  if (apiKey) {
    switch (platform) {
      case 'youtube':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      case 'twitter':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      case 'vimeo':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      default:
        // For other platforms, add API key as needed
        break;
    }
  }

  return headers;
};

