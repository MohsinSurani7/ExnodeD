// Platform detection utility
export const detectPlatform = (url) => {
  if (!url) return null;
  
  const urlLower = url.toLowerCase();
  
  // YouTube
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return 'youtube';
  }
  
  // Instagram
  if (urlLower.includes('instagram.com')) {
    return 'instagram';
  }
  
  // TikTok
  if (urlLower.includes('tiktok.com')) {
    return 'tiktok';
  }
  
  // Facebook
  if (urlLower.includes('facebook.com') || urlLower.includes('fb.watch')) {
    return 'facebook';
  }
  
  // Twitter/X
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
    return 'twitter';
  }
  
  // Vimeo
  if (urlLower.includes('vimeo.com')) {
    return 'vimeo';
  }
  
  // Dailymotion
  if (urlLower.includes('dailymotion.com')) {
    return 'dailymotion';
  }
  
  return 'unknown';
};

export const getPlatformIcon = (platform) => {
  switch (platform) {
    case 'youtube':
      return 'logo-youtube';
    case 'instagram':
      return 'logo-instagram';
    case 'tiktok':
      return 'musical-notes';
    case 'facebook':
      return 'logo-facebook';
    case 'twitter':
      return 'logo-twitter';
    case 'vimeo':
      return 'videocam';
    case 'dailymotion':
      return 'play-circle';
    default:
      return 'link';
  }
};

export const getPlatformColor = (platform) => {
  switch (platform) {
    case 'youtube':
      return '#FF0000';
    case 'instagram':
      return '#E4405F';
    case 'tiktok':
      return '#000000';
    case 'facebook':
      return '#1877F2';
    case 'twitter':
      return '#1DA1F2';
    case 'vimeo':
      return '#1AB7EA';
    case 'dailymotion':
      return '#0066CC';
    default:
      return '#8E8E93';
  }
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

