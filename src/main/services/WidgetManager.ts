import { BrowserWindow, screen } from 'electron';
import * as path from 'path';
import { WidgetConfig } from '@/shared/types/widget.types';
import DatabaseService from './DatabaseService';
import { app } from 'electron';

export class WidgetManager {
    private widgets: Map<string, BrowserWindow> = new Map();
    private configs: Map<string, WidgetConfig> = new Map();
    private isInitialized = false;
    private dbService: DatabaseService;

    constructor() {
        const dbPath = path.join(app.getPath('userData'), 'market-data.db');
        this.dbService = new DatabaseService(dbPath);
        this.loadWidgetConfigs();
    }

    private loadWidgetConfigs(): void {
        // 从数据库或配置文件加载挂件配置
        // 这里先使用默认配置
        const defaultConfigs: WidgetConfig[] = [
            {
                id: 'default-quote',
                type: 'quote',
                title: '股票行情',
                symbols: ['000001', '000002', '000858'],
                position: { x: 100, y: 100 },
                size: { width: 400, height: 300 },
                settings: {
                    showVolume: true,
                    showChange: true,
                    refreshInterval: 5000,
                },
                alwaysOnTop: false,
                opacity: 0.9,
            },
        ];

        defaultConfigs.forEach(config => {
            this.configs.set(config.id, config);
        });
    }

    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        try {
            // 恢复之前保存的挂件
            for (const config of this.configs.values()) {
                await this.createWidget(config);
            }

            this.isInitialized = true;
            console.log('挂件管理器初始化完成');
        } catch (error) {
            console.error('挂件管理器初始化失败:', error);
            throw error;
        }
    }

    public async createWidget(config?: Partial<WidgetConfig>): Promise<string> {
        const widgetId = config?.id || `widget-${Date.now()}`;

        const defaultConfig: WidgetConfig = {
            id: widgetId,
            type: 'quote',
            title: '股票行情',
            symbols: ['000001'],
            position: { x: 100, y: 100 },
            size: { width: 400, height: 300 },
            settings: {
                showVolume: true,
                showChange: true,
                refreshInterval: 5000,
            },
            alwaysOnTop: false,
            opacity: 0.9,
        };

        const finalConfig = { ...defaultConfig, ...config };
        this.configs.set(widgetId, finalConfig);

        const window = new BrowserWindow({
            width: finalConfig.size.width,
            height: finalConfig.size.height,
            x: finalConfig.position.x,
            y: finalConfig.position.y,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js'),
            },
            show: false,
            titleBarStyle: 'hidden',
            frame: false,
            transparent: true,
            resizable: true,
            minimizable: true,
            maximizable: false,
            alwaysOnTop: finalConfig.alwaysOnTop,
            opacity: finalConfig.opacity,
            skipTaskbar: true,
        });

        // 开发环境加载本地服务器
        if (process.env.NODE_ENV === 'development') {
            window.loadURL(`http://localhost:3000/widget/${widgetId}`);
        } else {
            window.loadFile(path.join(__dirname, '../renderer/index.html'), {
                hash: `/widget/${widgetId}`,
            });
        }

        window.once('ready-to-show', () => {
            window.show();
        });

        window.on('closed', () => {
            this.widgets.delete(widgetId);
        });

        // 保存窗口位置和大小
        window.on('moved', () => {
            const [x, y] = window.getPosition();
            const config = this.configs.get(widgetId);
            if (config) {
                config.position = { x, y };
                this.saveWidgetConfig(widgetId, config);
            }
        });

        window.on('resized', () => {
            const [width, height] = window.getSize();
            const config = this.configs.get(widgetId);
            if (config) {
                config.size = { width, height };
                this.saveWidgetConfig(widgetId, config);
            }
        });

        this.widgets.set(widgetId, window);
        return widgetId;
    }

    public getWidgets(): WidgetConfig[] {
        return Array.from(this.configs.values());
    }

    public getWidget(id: string): BrowserWindow | undefined {
        return this.widgets.get(id);
    }

    public async saveWidgetConfig(widgetId: string, config: WidgetConfig): Promise<boolean> {
        try {
            this.configs.set(widgetId, config);

            // 更新窗口属性
            const window = this.widgets.get(widgetId);
            if (window) {
                window.setAlwaysOnTop(config.alwaysOnTop);
                window.setOpacity(config.opacity);
            }

            // 保存到数据库或配置文件
            // await this.saveToDatabase(config);

            return true;
        } catch (error) {
            console.error('保存挂件配置失败:', error);
            return false;
        }
    }

    public closeWidget(widgetId: string): boolean {
        const window = this.widgets.get(widgetId);
        if (window) {
            window.close();
            return true;
        }
        return false;
    }

    public closeAllWidgets(): void {
        for (const window of this.widgets.values()) {
            window.close();
        }
        this.widgets.clear();
    }

    public showWidget(widgetId: string): boolean {
        const window = this.widgets.get(widgetId);
        if (window) {
            window.show();
            return true;
        }
        return false;
    }

    public hideWidget(widgetId: string): boolean {
        const window = this.widgets.get(widgetId);
        if (window) {
            window.hide();
            return true;
        }
        return false;
    }

    public setWidgetAlwaysOnTop(widgetId: string, alwaysOnTop: boolean): boolean {
        const window = this.widgets.get(widgetId);
        if (window) {
            window.setAlwaysOnTop(alwaysOnTop);
            const config = this.configs.get(widgetId);
            if (config) {
                config.alwaysOnTop = alwaysOnTop;
                this.saveWidgetConfig(widgetId, config);
            }
            return true;
        }
        return false;
    }

    public setWidgetOpacity(widgetId: string, opacity: number): boolean {
        const window = this.widgets.get(widgetId);
        if (window) {
            window.setOpacity(opacity);
            const config = this.configs.get(widgetId);
            if (config) {
                config.opacity = opacity;
                this.saveWidgetConfig(widgetId, config);
            }
            return true;
        }
        return false;
    }

    public getWidgetCount(): number {
        return this.widgets.size;
    }

    public isWidgetExists(widgetId: string): boolean {
        return this.widgets.has(widgetId);
    }

    // 获取屏幕信息，用于智能定位
    public getScreenInfo(): { width: number; height: number } {
        const primaryDisplay = screen.getPrimaryDisplay();
        return {
            width: primaryDisplay.size.width,
            height: primaryDisplay.size.height,
        };
    }

    // 智能定位挂件，避免重叠
    public getSmartPosition(size: { width: number; height: number }): { x: number; y: number } {
        const screenInfo = this.getScreenInfo();
        const padding = 20;

        // 简单的网格定位算法
        const gridSize = 50;
        const maxX = Math.floor((screenInfo.width - size.width) / gridSize);
        const maxY = Math.floor((screenInfo.height - size.height) / gridSize);

        // 找到第一个可用的位置
        for (let x = 0; x <= maxX; x++) {
            for (let y = 0; y <= maxY; y++) {
                const posX = x * gridSize + padding;
                const posY = y * gridSize + padding;

                // 检查是否与现有挂件重叠
                let isOverlap = false;
                for (const config of this.configs.values()) {
                    const existingWindow = this.widgets.get(config.id);
                    if (existingWindow) {
                        const [ex, ey] = existingWindow.getPosition();
                        const [ew, eh] = existingWindow.getSize();

                        if (
                            posX < ex + ew &&
                            posX + size.width > ex &&
                            posY < ey + eh &&
                            posY + size.height > ey
                        ) {
                            isOverlap = true;
                            break;
                        }
                    }
                }

                if (!isOverlap) {
                    return { x: posX, y: posY };
                }
            }
        }

        // 如果找不到合适位置，返回默认位置
        return { x: padding, y: padding };
    }
} 