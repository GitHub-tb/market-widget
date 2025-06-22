export interface WidgetConfig {
    id: string;
    type: 'quote';
    title: string;
    symbols: string[];
    position: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
    alwaysOnTop: boolean;
    opacity: number;
    config?: Record<string, any>;
} 