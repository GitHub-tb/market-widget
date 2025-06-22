import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Quote, MarketType } from '@/shared/types/market.types';

export interface QuoteState {
    quotes: Record<string, Quote>;
    isLoading: boolean;
    error: string | null;
    lastUpdate: number;
    subscribedSymbols: string[];
}

const initialState: QuoteState = {
    quotes: {},
    isLoading: false,
    error: null,
    lastUpdate: 0,
    subscribedSymbols: [],
};

// 异步thunk
export const fetchQuote = createAsyncThunk(
    'quote/fetchQuote',
    async (symbol: string, { rejectWithValue }) => {
        try {
            if (window.electronAPI) {
                const quote = await window.electronAPI.getQuote(symbol);
                return quote;
            } else {
                // 模拟数据
                return {
                    symbol,
                    name: `股票${symbol}`,
                    price: Math.random() * 100 + 10,
                    change: (Math.random() - 0.5) * 10,
                    changePercent: (Math.random() - 0.5) * 20,
                    open: Math.random() * 100 + 10,
                    high: Math.random() * 100 + 10,
                    low: Math.random() * 100 + 10,
                    prevClose: Math.random() * 100 + 10,
                    volume: Math.floor(Math.random() * 1000000),
                    amount: Math.random() * 10000000,
                    timestamp: Date.now(),
                    market: 'SH' as MarketType,
                };
            }
        } catch (error) {
            return rejectWithValue(`获取股票行情失败: ${symbol}`);
        }
    }
);

export const fetchQuotes = createAsyncThunk(
    'quote/fetchQuotes',
    async (symbols: string[], { rejectWithValue }) => {
        try {
            if (window.electronAPI) {
                const quotes = await window.electronAPI.getQuotes(symbols);
                return quotes;
            } else {
                // 模拟数据
                return symbols.map(symbol => ({
                    symbol,
                    name: `股票${symbol}`,
                    price: Math.random() * 100 + 10,
                    change: (Math.random() - 0.5) * 10,
                    changePercent: (Math.random() - 0.5) * 20,
                    open: Math.random() * 100 + 10,
                    high: Math.random() * 100 + 10,
                    low: Math.random() * 100 + 10,
                    prevClose: Math.random() * 100 + 10,
                    volume: Math.floor(Math.random() * 1000000),
                    amount: Math.random() * 10000000,
                    timestamp: Date.now(),
                    market: 'SH' as MarketType,
                }));
            }
        } catch (error) {
            return rejectWithValue('批量获取股票行情失败');
        }
    }
);

const quoteSlice = createSlice({
    name: 'quote',
    initialState,
    reducers: {
        updateQuote: (state, action: PayloadAction<Quote>) => {
            const quote = action.payload;
            state.quotes[quote.symbol] = quote;
            state.lastUpdate = Date.now();
        },
        updateQuotes: (state, action: PayloadAction<Quote[]>) => {
            action.payload.forEach(quote => {
                state.quotes[quote.symbol] = quote;
            });
            state.lastUpdate = Date.now();
        },
        removeQuote: (state, action: PayloadAction<string>) => {
            delete state.quotes[action.payload];
        },
        clearQuotes: (state) => {
            state.quotes = {};
        },
        addSubscribedSymbol: (state, action: PayloadAction<string>) => {
            if (!state.subscribedSymbols.includes(action.payload)) {
                state.subscribedSymbols.push(action.payload);
            }
        },
        removeSubscribedSymbol: (state, action: PayloadAction<string>) => {
            state.subscribedSymbols = state.subscribedSymbols.filter(
                symbol => symbol !== action.payload
            );
        },
        setSubscribedSymbols: (state, action: PayloadAction<string[]>) => {
            state.subscribedSymbols = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchQuote.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchQuote.fulfilled, (state, action) => {
                state.isLoading = false;
                state.quotes[action.payload.symbol] = action.payload;
                state.lastUpdate = Date.now();
            })
            .addCase(fetchQuote.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch quote';
            })
            .addCase(fetchQuotes.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchQuotes.fulfilled, (state, action: PayloadAction<Quote[]>) => {
                action.payload.forEach((quote: Quote) => {
                    state.quotes[quote.symbol] = quote;
                });
                state.lastUpdate = Date.now();
                state.isLoading = false;
            })
            .addCase(fetchQuotes.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    updateQuote,
    updateQuotes,
    removeQuote,
    clearQuotes,
    addSubscribedSymbol,
    removeSubscribedSymbol,
    setSubscribedSymbols,
    setError,
    clearError,
} = quoteSlice.actions;

export default quoteSlice.reducer; 