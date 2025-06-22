import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import appReducer from './slices/appSlice';
import quoteReducer from './slices/quoteSlice';
import widgetReducer from './slices/widgetSlice';
import watchlistReducer from './slices/watchlistSlice';

// 持久化配置
const persistConfig = {
    key: 'market-widget',
    storage,
    whitelist: ['app', 'watchlist'], // 只持久化这些reducer
};

const persistedAppReducer = persistReducer(persistConfig, appReducer);
const persistedWatchlistReducer = persistReducer(persistConfig, watchlistReducer);

export const store = configureStore({
    reducer: {
        app: persistedAppReducer,
        quote: quoteReducer,
        widget: widgetReducer,
        watchlist: persistedWatchlistReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 