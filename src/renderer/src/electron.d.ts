import { Quote } from '../../shared/types/market.types';
import { WidgetConfig } from '../../shared/types/widget.types';

export interface IElectronAPI {
    createWidget: (config: { type: string; symbols: string[] }) => Promise<void>;
    minimizeWindow: () => void;
    maximizeWindow: () => void;
    closeWindow: () => void;
    getWidgets: () => Promise<WidgetConfig[]>;
    getQuote: (symbol: string) => Promise<Quote>;
    getQuotes: (symbols: string[]) => Promise<Quote[]>;
}

declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
} 