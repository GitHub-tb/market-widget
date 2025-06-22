import * as sqlite3 from 'sqlite3';
import * as path from 'path';
import { app } from 'electron';
import { WatchlistItem } from '@/shared/types/market.types';

export class DatabaseService {
    private db: sqlite3.Database | null = null;
    private dbPath: string;

    constructor() {
        const userDataPath = app.getPath('userData');
        this.dbPath = path.join(userDataPath, 'market-widget.db');
    }

    public async initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('数据库连接失败:', err);
                    reject(err);
                } else {
                    console.log('数据库连接成功');
                    this.createTables()
                        .then(() => resolve())
                        .catch(reject);
                }
            });
        });
    }

    private async createTables(): Promise<void> {
        if (!this.db) {
            throw new Error('数据库未初始化');
        }

        const createTablesSQL = `
      -- 挂件配置表
      CREATE TABLE IF NOT EXISTS widgets (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        symbols TEXT NOT NULL,
        position_x INTEGER NOT NULL,
        position_y INTEGER NOT NULL,
        size_width INTEGER NOT NULL,
        size_height INTEGER NOT NULL,
        settings TEXT NOT NULL,
        always_on_top BOOLEAN NOT NULL DEFAULT 0,
        opacity REAL NOT NULL DEFAULT 0.9,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      -- 自选股表
      CREATE TABLE IF NOT EXISTS watchlist (
        id TEXT PRIMARY KEY,
        symbol TEXT NOT NULL,
        name TEXT NOT NULL,
        market TEXT NOT NULL,
        notes TEXT,
        added_at INTEGER NOT NULL
      );

      -- 预警设置表
      CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        symbol TEXT NOT NULL,
        type TEXT NOT NULL,
        condition TEXT NOT NULL,
        value REAL NOT NULL,
        enabled BOOLEAN NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        triggered_at INTEGER
      );

      -- 历史数据表
      CREATE TABLE IF NOT EXISTS historical_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL,
        period TEXT NOT NULL,
        time INTEGER NOT NULL,
        open REAL NOT NULL,
        high REAL NOT NULL,
        low REAL NOT NULL,
        close REAL NOT NULL,
        volume INTEGER NOT NULL,
        amount REAL,
        created_at INTEGER NOT NULL
      );

      -- 应用设置表
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );

      -- 创建索引
      CREATE INDEX IF NOT EXISTS idx_watchlist_symbol ON watchlist(symbol);
      CREATE INDEX IF NOT EXISTS idx_alerts_symbol ON alerts(symbol);
      CREATE INDEX IF NOT EXISTS idx_historical_data_symbol_time ON historical_data(symbol, time);
    `;

        return new Promise((resolve, reject) => {
            this.db!.exec(createTablesSQL, (err) => {
                if (err) {
                    console.error('创建表失败:', err);
                    reject(err);
                } else {
                    console.log('数据库表创建成功');
                    resolve();
                }
            });
        });
    }

    // 挂件配置相关方法
    public async saveWidgetConfig(config: any): Promise<boolean> {
        if (!this.db) {
            throw new Error('数据库未初始化');
        }

        const sql = `
      INSERT OR REPLACE INTO widgets 
      (id, type, title, symbols, position_x, position_y, size_width, size_height, 
       settings, always_on_top, opacity, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const params = [
            config.id,
            config.type,
            config.title,
            JSON.stringify(config.symbols),
            config.position.x,
            config.position.y,
            config.size.width,
            config.size.height,
            JSON.stringify(config.settings),
            config.alwaysOnTop ? 1 : 0,
            config.opacity,
            Date.now(),
            Date.now(),
        ];

        return new Promise((resolve, reject) => {
            this.db!.run(sql, params, function (err) {
                if (err) {
                    console.error('保存挂件配置失败:', err);
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }

    public async getWidgetConfigs(): Promise<any[]> {
        if (!this.db) {
            throw new Error('数据库未初始化');
        }

        const sql = 'SELECT * FROM widgets ORDER BY created_at DESC';

        interface WidgetRow {
            id: string;
            type: string;
            title: string;
            symbols: string;
            position_x: number;
            position_y: number;
            size_width: number;
            size_height: number;
            settings: string;
            always_on_top: number;
            opacity: number;
            created_at: number;
            updated_at: number;
        }

        return new Promise((resolve, reject) => {
            this.db!.all(sql, [], (err, rows: WidgetRow[]) => {
                if (err) {
                    console.error('获取挂件配置失败:', err);
                    reject(err);
                } else {
                    const configs = rows.map(row => ({
                        id: row.id,
                        type: row.type,
                        title: row.title,
                        symbols: JSON.parse(row.symbols),
                        position: { x: row.position_x, y: row.position_y },
                        size: { width: row.size_width, height: row.size_height },
                        settings: JSON.parse(row.settings),
                        alwaysOnTop: Boolean(row.always_on_top),
                        opacity: row.opacity,
                        createdAt: row.created_at,
                        updatedAt: row.updated_at,
                    }));
                    resolve(configs);
                }
            });
        });
    }

    public async deleteWidgetConfig(widgetId: string): Promise<boolean> {
        if (!this.db) {
            throw new Error('数据库未初始化');
        }

        const sql = 'DELETE FROM widgets WHERE id = ?';

        return new Promise((resolve, reject) => {
            this.db!.run(sql, [widgetId], function (err) {
                if (err) {
                    console.error('删除挂件配置失败:', err);
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }

    // 自选股相关方法
    public async addToWatchlist(item: any): Promise<boolean> {
        if (!this.db) {
            throw new Error('数据库未初始化');
        }

        const sql = `
      INSERT OR REPLACE INTO watchlist 
      (id, symbol, name, market, notes, added_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

        const params = [
            item.id || `${item.symbol}-${Date.now()}`,
            item.symbol,
            item.name,
            item.market,
            item.notes || '',
            Date.now(),
        ];

        return new Promise((resolve, reject) => {
            this.db!.run(sql, params, function (err) {
                if (err) {
                    console.error('添加自选股失败:', err);
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }

    public async getWatchlist(): Promise<WatchlistItem[]> {
        if (!this.db) {
            throw new Error('数据库未初始化');
        }

        const sql = 'SELECT * FROM watchlist ORDER BY added_at DESC';

        interface WatchlistRow {
            id: string;
            symbol: string;
            name: string;
            market: any; // MarketType
            notes?: string;
            added_at: number;
        }

        return new Promise((resolve, reject) => {
            this.db!.all(sql, [], (err, rows: WatchlistRow[]) => {
                if (err) {
                    console.error('获取自选股失败:', err);
                    reject(err);
                } else {
                    const items: WatchlistItem[] = rows.map(row => ({
                        id: row.id,
                        symbol: row.symbol,
                        name: row.name,
                        market: row.market,
                        notes: row.notes,
                        addedAt: row.added_at,
                    }));
                    resolve(items);
                }
            });
        });
    }

    public async removeFromWatchlist(symbol: string): Promise<boolean> {
        if (!this.db) {
            throw new Error('数据库未初始化');
        }

        const sql = 'DELETE FROM watchlist WHERE symbol = ?';

        return new Promise((resolve, reject) => {
            this.db!.run(sql, [symbol], function (err) {
                if (err) {
                    console.error('删除自选股失败:', err);
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }

    // 应用设置相关方法
    public async saveSetting(key: string, value: any): Promise<boolean> {
        if (!this.db) {
            throw new Error('数据库未初始化');
        }

        const sql = `
      INSERT OR REPLACE INTO app_settings 
      (key, value, updated_at)
      VALUES (?, ?, ?)
    `;

        const params = [key, JSON.stringify(value), Date.now()];

        return new Promise((resolve, reject) => {
            this.db!.run(sql, params, function (err) {
                if (err) {
                    console.error('保存设置失败:', err);
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }

    public async getSetting(key: string): Promise<any> {
        if (!this.db) {
            throw new Error('数据库未初始化');
        }

        const sql = 'SELECT value FROM app_settings WHERE key = ?';

        interface SettingRow {
            value: string;
        }

        return new Promise((resolve, reject) => {
            this.db!.get(sql, [key], (err, row: SettingRow | undefined) => {
                if (err) {
                    console.error('获取设置失败:', err);
                    reject(err);
                } else {
                    resolve(row ? JSON.parse(row.value) : null);
                }
            });
        });
    }

    // 关闭数据库连接
    public async close(): Promise<void> {
        if (this.db) {
            return new Promise((resolve, reject) => {
                this.db!.close((err) => {
                    if (err) {
                        console.error('关闭数据库失败:', err);
                        reject(err);
                    } else {
                        console.log('数据库连接已关闭');
                        this.db = null;
                        resolve();
                    }
                });
            });
        }
    }
} 