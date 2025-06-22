// Trigger re-compile
import { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage } from 'electron';
import path from 'path';
import DatabaseService from './services/DatabaseService';
import { DataSourceManager } from './services/DataSourceManager';
import { WidgetManager } from './services/WidgetManager';

class MarketWidgetApp {
    private mainWindow: BrowserWindow | null = null;
    private tray: Tray | null = null;
    private databaseService: DatabaseService;
    private dataSourceManager: DataSourceManager;
    private widgetManager: WidgetManager;
    private appIsQuitting = false;

    constructor() {
        const dbPath = path.join(app.getPath('userData'), 'market-data.db');
        this.databaseService = new DatabaseService(dbPath);
        this.dataSourceManager = new DataSourceManager(this.databaseService);
        this.widgetManager = new WidgetManager(this.databaseService);

        app.on('ready', this.onReady.bind(this));
        app.on('window-all-closed', this.onWindowAllClosed.bind(this));

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                this.createMainWindow();
            }
        });
    }

    private async onReady(): Promise<void> {
        this.createMainWindow();
        this.createTray();
        this.registerIpcHandlers();
    }

    private onWindowAllClosed(): void {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    }

    private createMainWindow(): void {
        this.mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
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
            maximizable: true,
        });

        // 开发环境加载本地服务器
        if (process.env.NODE_ENV === 'development') {
            this.mainWindow.loadURL('http://localhost:3000');
            this.mainWindow.webContents.openDevTools();
        } else {
            this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
        }

        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow?.show();
        });

        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
    }

    private createTray(): void {
        const iconPath = path.join(__dirname, '../assets/icon.png');
        const icon = nativeImage.createFromPath(iconPath);

        this.tray = new Tray(icon);
        this.tray.setToolTip('Market Widget');

        const contextMenu = Menu.buildFromTemplate([
            {
                label: '显示主窗口',
                click: () => {
                    this.mainWindow?.show();
                },
            },
            {
                label: '新建挂件',
                click: () => {
                    this.widgetManager.createWidget();
                },
            },
            { type: 'separator' },
            {
                label: '设置',
                click: () => {
                    // 打开设置窗口
                },
            },
            { type: 'separator' },
            {
                label: '退出',
                click: () => {
                    app.quit();
                },
            },
        ]);

        this.tray.setContextMenu(contextMenu);
    }

    private registerIpcHandlers(): void {
        // 获取股票行情数据
        ipcMain.handle('get-quote', async (event, symbol: string) => {
            return await this.dataSourceManager.getQuote(symbol);
        });

        // 批量获取股票行情
        ipcMain.handle('get-quotes', async (event, symbols: string[]) => {
            return await this.dataSourceManager.getQuotes(symbols);
        });

        // 获取K线数据
        ipcMain.handle('get-kline', async (event, symbol: string, period: string) => {
            return await this.dataSourceManager.getKline(symbol, period);
        });

        // 创建新挂件
        ipcMain.handle('create-widget', async (event, config: any) => {
            return await this.widgetManager.createWidget(config);
        });

        // 获取挂件列表
        ipcMain.handle('get-widgets', async () => {
            return await this.widgetManager.getWidgets();
        });

        // 保存挂件配置
        ipcMain.handle('save-widget-config', async (event, widgetId: string, config: any) => {
            return await this.widgetManager.saveWidgetConfig(widgetId, config);
        });

        // 窗口最小化
        ipcMain.on('minimize-window', (event) => {
            const window = BrowserWindow.fromWebContents(event.sender);
            window?.minimize();
        });

        // 窗口最大化
        ipcMain.on('maximize-window', (event) => {
            const window = BrowserWindow.fromWebContents(event.sender);
            if (window?.isMaximized()) {
                window.unmaximize();
            } else {
                window?.maximize();
            }
        });

        // 关闭窗口
        ipcMain.on('close-window', (event) => {
            const window = BrowserWindow.fromWebContents(event.sender);
            window?.close();
        });
    }
}

// 启动应用
new MarketWidgetApp(); 