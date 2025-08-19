import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

import downloadsReducer from './slices/downloadsSlice';
import settingsReducer from './slices/settingsSlice';
import appReducer from './slices/appSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['settings', 'downloads'], // Only persist these reducers
};

const rootReducer = combineReducers({
  downloads: downloadsReducer,
  settings: settingsReducer,
  app: appReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: __DEV__,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

