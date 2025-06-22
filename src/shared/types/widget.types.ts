export interface WidgetConfig {
    id: string;
    type: 'quote';
    symbols: string[];
    config?: Record<string, any>;
} 