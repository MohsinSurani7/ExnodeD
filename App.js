import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { View, Text, StyleSheet } from 'react-native';

import { store, persistor } from './src/store';
import HomeScreen from './src/screens/HomeScreen';
import DownloadsScreen from './src/screens/DownloadsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>Loading ExNode...</Text>
  </View>
);

function AppNavigator() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Downloads') {
              iconName = focused ? 'download' : 'download-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#E5E5EA',
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'ExNode',
            headerTitle: 'Video Downloader',
          }}
        />
        <Tab.Screen 
          name="Downloads" 
          component={DownloadsScreen}
          options={{
            title: 'Downloads',
            headerTitle: 'My Downloads',
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            title: 'Settings',
            headerTitle: 'Settings',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <SafeAreaProvider>
          <AppNavigator />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});

