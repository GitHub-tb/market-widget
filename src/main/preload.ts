import { contextBridge, ipcRenderer } from 'electron';

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
    // 行情数据相关
    getQuote: (symbol: string) => ipcRenderer.invoke('get-quote', symbol),
    getQuotes: (symbols: string[]) => ipcRenderer.invoke('get-quotes', symbols),
    getKline: (symbol: string, period: string) => ipcRenderer.invoke('get-kline', symbol, period),

    // 挂件管理相关
    createWidget: (config: any) => ipcRenderer.invoke('create-widget', config),
    getWidgets: () => ipcRenderer.invoke('get-widgets'),
    saveWidgetConfig: (widgetId: string, config: any) =>
        ipcRenderer.invoke('save-widget-config', widgetId, config),

    // 窗口控制相关
    minimizeWindow: () => ipcRenderer.send('minimize-window'),
    maximizeWindow: () => ipcRenderer.send('maximize-window'),
    closeWindow: () => ipcRenderer.send('close-window'),

    // 监听事件
    onQuoteUpdate: (callback: (data: any) => void) => {
        ipcRenderer.on('quote-update', (event, data) => callback(data));
    },

    onWidgetUpdate: (callback: (data: any) => void) => {
        ipcRenderer.on('widget-update', (event, data) => callback(data));
    },

    // 移除监听器
    removeAllListeners: (channel: string) => {
        ipcRenderer.removeAllListeners(channel);
    },
});

// 类型声明
declare global {
    interface Window {
        electronAPI: {
            getQuote: (symbol: string) => Promise<any>;
            getQuotes: (symbols: string[]) => Promise<any[]>;
            getKline: (symbol: string, period: string) => Promise<any>;
            createWidget: (config: any) => Promise<any>;
            getWidgets: () => Promise<any[]>;
            saveWidgetConfig: (widgetId: string, config: any) => Promise<boolean>;
            minimizeWindow: () => void;
            maximizeWindow: () => void;
            closeWindow: () => void;
            onQuoteUpdate: (callback: (data: any) => void) => void;
            onWidgetUpdate: (callback: (data: any) => void) => void;
            removeAllListeners: (channel: string) => void;
        };
    }
} 