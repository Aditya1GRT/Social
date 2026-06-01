import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import {
  createStateSyncMiddleware,
  initMessageListener,
} from "redux-state-sync";
import storage from "redux-persist/lib/storage";
import postSlice from "./postSlice";
import userSlice from "./userSlice";
import conversationSlice from "./conversationSlice";
import profileSlice from "./profileSlice";

const persistconfig = {
  key: "root",
  version: 1,
  storage,
};

const rootReducer = combineReducers({
  user: userSlice,
  posts: postSlice,
  conversations: conversationSlice,
  profile: profileSlice,
});

const persistedReducer = persistReducer(persistconfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      createStateSyncMiddleware({
        blacklist: ["persist/PERSIST", "persist/REHYDRATE"],
      })
    ),
  // middleware: [
  //   applyMiddleware(

  //   ),
  // ],
});
initMessageListener(store);
export let persistor = persistStore(store);
