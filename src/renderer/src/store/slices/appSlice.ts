import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface AppState {
    theme: 'light' | 'dark';
    language: 'zh-CN' | 'en-US';
    isInitialized: boolean;
    isLoading: boolean;
    error: string | null;
    settings: {
        autoHide: boolean;
        alwaysOnTop: boolean;
        opacity: number;
        refreshInterval: number;
    };
}

const initialState: AppState = {
    theme: 'light',
    language: 'zh-CN',
    isInitialized: false,
    isLoading: false,
    error: null,
    settings: {
        autoHide: true,
        alwaysOnTop: false,
        opacity: 0.9,
        refreshInterval: 5000,
    },
};

// 异步thunk
export const initializeApp = createAsyncThunk(
    'app/initialize',
    async (_, { rejectWithValue }) => {
        try {
            // 从本地存储或数据库加载设置
            const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
            const savedLanguage = localStorage.getItem('language') as 'zh-CN' | 'en-US' || 'zh-CN';

            // 模拟初始化延迟
            await new Promise(resolve => setTimeout(resolve, 1000));

            return {
                theme: savedTheme,
                language: savedLanguage,
            };
        } catch (error) {
            return rejectWithValue('应用初始化失败');
        }
    }
);

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload;
            localStorage.setItem('theme', action.payload);
        },
        setLanguage: (state, action: PayloadAction<'zh-CN' | 'en-US'>) => {
            state.language = action.payload;
            localStorage.setItem('language', action.payload);
        },
        setSettings: (state, action: PayloadAction<Partial<AppState['settings']>>) => {
            state.settings = { ...state.settings, ...action.payload };
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
            .addCase(initializeApp.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(initializeApp.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isInitialized = true;
                state.theme = action.payload.theme;
                state.language = action.payload.language;
            })
            .addCase(initializeApp.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    setTheme,
    setLanguage,
    setSettings,
    setError,
    clearError,
} = appSlice.actions;

export default appSlice.reducer;
