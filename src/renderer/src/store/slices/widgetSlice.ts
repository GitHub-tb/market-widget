import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WidgetState {
    widgets: any[];
    activeWidgetId: string | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: WidgetState = {
    widgets: [],
    activeWidgetId: null,
    isLoading: false,
    error: null,
};

const widgetSlice = createSlice({
    name: 'widget',
    initialState,
    reducers: {
        setWidgets: (state, action: PayloadAction<any[]>) => {
            state.widgets = action.payload;
        },
        addWidget: (state, action: PayloadAction<any>) => {
            state.widgets.push(action.payload);
        },
        removeWidget: (state, action: PayloadAction<string>) => {
            state.widgets = state.widgets.filter(widget => widget.id !== action.payload);
        },
        updateWidget: (state, action: PayloadAction<{ id: string; config: any }>) => {
            const index = state.widgets.findIndex(widget => widget.id === action.payload.id);
            if (index !== -1) {
                state.widgets[index] = { ...state.widgets[index], ...action.payload.config };
            }
        },
        setActiveWidget: (state, action: PayloadAction<string | null>) => {
            state.activeWidgetId = action.payload;
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
    setWidgets,
    addWidget,
    removeWidget,
    updateWidget,
    setActiveWidget,
    setLoading,
    setError,
} = widgetSlice.actions;

export default widgetSlice.reducer; 