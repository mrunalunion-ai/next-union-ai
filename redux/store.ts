import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import posterReducer from "./modules/common/reducers/posterReducer";
import uiReducer from "./modules/common/reducers/uiReducer";
import { userDataReducers } from "./modules/common/user_data";
import mainReducer from "./modules/main/reducer";
import { checkinReducer } from "./modules/checkin";
import { tasksReducer } from "./modules/tasks";
import { insightsReducer } from "./modules/insights";
import { notificationsReducer } from "./modules/notifications";
import { accountReducer } from "./modules/account";

const combinedReducer = combineReducers({
  user_data: userDataReducers,
  usePosterReducers: posterReducer,
  uiReducer: uiReducer,
  mainReducer: mainReducer,
  checkin: checkinReducer,
  tasks: tasksReducer,
  insights: insightsReducer,
  notifications: notificationsReducer,
  account: accountReducer,
});

const BUILD_ID =
  process.env.NEXT_PUBLIC_BUILD_ID ||
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  'dev';
const BUILD_KEY = 'unionai_build_id';

if (typeof window !== 'undefined') {
  const lastBuild = window.localStorage.getItem(BUILD_KEY);
  if (lastBuild !== BUILD_ID) {
    window.localStorage.setItem(BUILD_KEY, BUILD_ID);
    window.localStorage.removeItem(`persist:chathub-store`);
  }
}

const rootReducer = combineReducers({
  combinedReducer: persistReducer(
    { key: "chathub-store", storage, blacklist: ["uiReducer"] },
    combinedReducer
  ),
});

export function makeStore() {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // serializableCheck: {
        //   ignoredActions: ["persist/PERSIST"], // Ignore serializability check for specific actions
        // },
        serializableCheck: false,
        immutableCheck: false,
      }),
  });

  const persistor = persistStore(store);
  return { store, persistor };
}

const { store, persistor } = makeStore();
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { persistor, store };

