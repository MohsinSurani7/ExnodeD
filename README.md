# ExNode - Universal Video Downloader

ExNode is a powerful React Native mobile application that allows users to download videos from multiple platforms including YouTube, Instagram, TikTok, Facebook, Twitter (X), Vimeo, Dailymotion, and other popular video sites. The app features a clean, modern interface with comprehensive download management, offline viewing capabilities, and advanced features like QR code scanning.

## Features

### Core Functionality
- **Multi-Platform Support**: Download videos from YouTube, Instagram, TikTok, Facebook, Twitter, Vimeo, Dailymotion, and more
- **Automatic Platform Detection**: Automatically detects the video platform from URLs
- **Video Quality Selection**: Choose from available qualities (360p, 480p, 720p, 1080p)
- **Video Metadata Display**: Shows thumbnail, title, duration, author, and file size before downloading
- **Download Management**: Queue, pause, resume, and cancel downloads
- **Progress Tracking**: Real-time download progress with detailed statistics

### User Interface
- **Clean Modern Design**: iOS-style interface with intuitive navigation
- **Bottom Tab Navigation**: Three main screens - Home, Downloads, and Settings
- **Responsive Design**: Optimized for both phones and tablets
- **Dark/Light Theme**: Automatic theme switching based on system preferences
- **Accessibility Support**: Screen reader compatible with proper contrast ratios

### Advanced Features
- **Background Downloads**: Continue downloads when app is in background
- **Offline Video Player**: Built-in video player for downloaded content
- **QR Code Scanner**: Scan QR codes containing video URLs
- **Clipboard Integration**: Paste URLs directly from clipboard
- **Storage Management**: Monitor storage usage and clear cache
- **Download History**: Keep track of all downloaded videos
- **Error Handling**: Comprehensive error handling with user-friendly messages

### Technical Features
- **State Management**: Redux Toolkit for efficient state management
- **Data Persistence**: Automatic saving of downloads and settings
- **Permission Management**: Proper handling of storage, camera, and notification permissions
- **Network Awareness**: Adapts behavior based on connection type and quality
- **Security**: Secure API key handling and data encryption
- **Compliance**: GDPR, CCPA, and app store guidelines compliance

## Screenshots

*Screenshots would be added here in a real project*

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ExNode.git
   cd ExNode
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file and add your API keys (see API Configuration section below).

4. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Run on device/simulator**
   - For iOS: Press `i` in the terminal or scan the QR code with Expo Go
   - For Android: Press `a` in the terminal or scan the QR code with Expo Go

## API Configuration

ExNode uses various APIs to fetch video metadata and download content. While the app includes fallback mechanisms, configuring API keys will provide better reliability and access to enhanced features.

### Required API Keys

#### YouTube API (Recommended)
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create credentials (API Key)
5. Add the key to your `.env` file:
   ```
   YOUTUBE_API_KEY=your_youtube_api_key_here
   ```

#### Twitter API (Optional)
1. Apply for a Twitter Developer account at [developer.twitter.com](https://developer.twitter.com/)
2. Create a new app and generate a Bearer Token
3. Add to your `.env` file:
   ```
   TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here
   ```

#### Vimeo API (Optional)
1. Create a Vimeo Developer account at [developer.vimeo.com](https://developer.vimeo.com/)
2. Register a new app and generate an access token
3. Add to your `.env` file:
   ```
   VIMEO_ACCESS_TOKEN=your_vimeo_access_token_here
   ```

### Platform-Specific Notes

- **Instagram**: Uses web scraping techniques (no official API for video downloads)
- **TikTok**: Uses web scraping techniques (official API has limitations)
- **Facebook**: Uses web scraping techniques (official API restrictions)
- **Dailymotion**: Uses web scraping techniques

### Fallback Mechanisms

If API keys are not configured, ExNode will:
- Use web scraping techniques where possible
- Display mock data for demonstration purposes
- Show appropriate error messages for unsupported content

## Project Structure

```
ExNode/
├── App.js                          # Main app component with Redux provider
├── package.json                    # Dependencies and scripts
├── .env.example                    # Environment variables template
├── assets/                         # Static assets
│   └── placeholder.png            # Placeholder images
├── src/
│   ├── components/                 # Reusable UI components
│   │   ├── DownloadItem.js        # Individual download item
│   │   ├── ProgressBar.js         # Download progress indicator
│   │   ├── QRScanner.js           # QR code scanner component
│   │   ├── SettingItem.js         # Settings list item
│   │   ├── VideoCard.js           # Video preview card
│   │   └── VideoPlayer.js         # In-app video player
│   ├── config/                     # Configuration files
│   │   ├── compliance.js          # App store compliance settings
│   │   └── security.js            # Security configuration
│   ├── screens/                    # Main app screens
│   │   ├── DownloadsScreen.js     # Downloads management screen
│   │   ├── HomeScreen.js          # Main URL input and analysis screen
│   │   └── SettingsScreen.js      # App settings and preferences
│   ├── services/                   # Business logic services
│   │   ├── backgroundTaskManager.js  # Background task handling
│   │   ├── downloadManager.js     # Download queue and management
│   │   ├── notificationManager.js # Push notifications
│   │   ├── offlineManager.js      # Offline functionality
│   │   ├── permissionManager.js   # Device permissions
│   │   └── videoService.js        # Video metadata fetching
│   ├── store/                      # Redux state management
│   │   ├── index.js               # Store configuration
│   │   ├── hooks.js               # Typed Redux hooks
│   │   └── slices/                # Redux slices
│   │       ├── appSlice.js        # App-wide state
│   │       ├── downloadsSlice.js  # Downloads state
│   │       └── settingsSlice.js   # Settings state
│   └── utils/                      # Utility functions
│       ├── errorHandler.js        # Error handling and logging
│       ├── networkManager.js      # Network state management
│       ├── platformDetector.js    # Video platform detection
│       ├── privacy.js             # Privacy and GDPR compliance
│       └── storage.js             # Local storage management
```

## Dependencies

### Core Dependencies
- **React Native**: Cross-platform mobile development framework
- **Expo**: Development platform and runtime
- **React Navigation**: Navigation library for React Native
- **Redux Toolkit**: State management
- **React Redux**: React bindings for Redux

### UI Components
- **React Native Paper**: Material Design components
- **React Native Vector Icons**: Icon library
- **React Native Progress**: Progress indicators
- **React Native Reanimated**: Animation library

### Media & File Handling
- **Expo AV**: Audio and video playback
- **Expo File System**: File system access
- **Expo Media Library**: Device media library access
- **React Native Video**: Video player component

### Device Features
- **Expo Camera**: Camera access for QR scanning
- **Expo Barcode Scanner**: QR code scanning
- **Expo Notifications**: Push notifications
- **Expo Clipboard**: Clipboard access

### Networking & APIs
- **Axios**: HTTP client
- **ytdl-core**: YouTube video information extraction
- **Various platform-specific libraries**: For different video platforms

## Usage

### Downloading Videos

1. **Enter URL**: Paste or type a video URL in the Home screen
2. **Analyze**: Tap "Analyze" to fetch video information
3. **Select Quality**: Choose your preferred video quality
4. **Download**: Tap "Download Video" to start the download
5. **Monitor Progress**: Switch to Downloads tab to monitor progress

### QR Code Scanning

1. Go to Home screen
2. Tap the QR code icon (if available)
3. Point camera at QR code containing video URL
4. App will automatically analyze the scanned URL

### Managing Downloads

1. Go to Downloads screen
2. Use filter buttons to view All, Active, or Completed downloads
3. Tap on download items to pause/resume or play videos
4. Use "Clear All" to remove all downloads

### Settings Configuration

1. Go to Settings screen
2. Configure theme, notifications, and download preferences
3. Manage storage and clear cache as needed
4. Review privacy settings and data usage

## Troubleshooting

### Common Issues

#### Downloads Not Starting
- Check internet connection
- Verify the video URL is valid and accessible
- Ensure sufficient storage space
- Check if the platform is supported

#### Permission Errors
- Grant necessary permissions in device settings
- Restart the app after granting permissions
- Check if permissions are properly requested in the app

#### Video Playback Issues
- Ensure the video file was downloaded completely
- Check if the video format is supported
- Try re-downloading the video

#### API Key Issues
- Verify API keys are correctly configured in `.env` file
- Check if API keys have proper permissions
- Ensure API quotas haven't been exceeded

### Debug Mode

Enable debug mode by setting `DEBUG_MODE=true` in your `.env` file. This will:
- Show detailed error messages
- Log API requests and responses
- Display additional debugging information

## Legal Considerations

### Copyright and Fair Use
- ExNode is intended for downloading videos that you have permission to download
- Users are responsible for complying with copyright laws and platform terms of service
- The app includes content filtering and DMCA compliance mechanisms

### Privacy and Data Protection
- ExNode does not collect personal information without consent
- All data is stored locally on the device
- The app complies with GDPR, CCPA, and other privacy regulations
- Users can export or delete their data at any time

### Platform Terms of Service
- Users must comply with the terms of service of video platforms
- Some platforms may prohibit downloading content
- ExNode provides tools but users are responsible for lawful use

## Contributing

We welcome contributions to ExNode! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/new-feature`
3. **Make your changes** and add tests if applicable
4. **Follow the existing code style** and conventions
5. **Commit your changes**: `git commit -m "Add new feature"`
6. **Push to your branch**: `git push origin feature/new-feature`
7. **Create a Pull Request**

### Development Guidelines
- Follow React Native and Expo best practices
- Write clear, commented code
- Add proper error handling
- Update documentation for new features
- Test on both iOS and Android platforms

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

ExNode is provided as-is for educational and personal use. Users are responsible for ensuring their use complies with applicable laws and platform terms of service. The developers are not responsible for any misuse of the application.

## Support

For support, bug reports, or feature requests:
- Create an issue on GitHub
- Contact the development team
- Check the documentation and troubleshooting guide

## Acknowledgments

- Thanks to the React Native and Expo communities
- Video platform APIs and documentation
- Open source libraries and contributors
- Beta testers and early users

---

**ExNode** - Download videos, enjoy offline. Made with ❤️ for video enthusiasts.

# ExnodeD
