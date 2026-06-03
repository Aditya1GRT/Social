import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

import userReducer from './slices/userSlice';
import postReducer from './slices/postSlice';
import conversationReducer from './slices/conversationSlice';
import profileReducer from './slices/profileSlice';
import notificationReducer from './slices/notificationSlice';

const userPersistConfig = {
  key: 'user',
  storage,
};

const conversationPersistConfig = {
  key: 'conversation',
  storage,
};

const rootReducer = combineReducers({
  user: persistReducer(userPersistConfig, userReducer),
  post: postReducer,
  conversation: persistReducer(conversationPersistConfig, conversationReducer),
  profile: profileReducer,
  notifications: notificationReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['post', 'profile', 'notifications'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
