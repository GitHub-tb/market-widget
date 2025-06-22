import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WatchlistItem, MarketType } from '@/shared/types/market.types';

export interface WatchlistState {
    items: WatchlistItem[];
    isLoading: boolean;
    error: string | null;
}

const initialState: WatchlistState = {
    items: [],
    isLoading: false,
    error: null,
};

const watchlistSlice = createSlice({
    name: 'watchlist',
    initialState,
    reducers: {
        setWatchlist: (state, action: PayloadAction<WatchlistItem[]>) => {
            state.items = action.payload;
        },
        addToWatchlist: (state, action: PayloadAction<WatchlistItem>) => {
            const existingIndex = state.items.findIndex(item => item.symbol === action.payload.symbol);
            if (existingIndex === -1) {
                state.items.push(action.payload);
            } else {
                state.items[existingIndex] = action.payload;
            }
        },
        removeFromWatchlist: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(item => item.symbol !== action.payload);
        },
        updateWatchlistItem: (state, action: PayloadAction<{ symbol: string; updates: Partial<WatchlistItem> }>) => {
            const index = state.items.findIndex(item => item.symbol === action.payload.symbol);
            if (index !== -1) {
                state.items[index] = { ...state.items[index], ...action.payload.updates };
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const {
    setWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    updateWatchlistItem,
    setLoading,
    setError,
} = watchlistSlice.actions;

export default watchlistSlice.reducer; 