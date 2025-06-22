import { IDataSource, Quote, KlineData, DataSourceConfig, QuoteUpdateEvent } from '@/shared/types/market.types';
import { EventEmitter } from 'events';

export class DataSourceManager extends EventEmitter {
    private dataSources: Map<string, IDataSource> = new Map();
    private activeDataSource: IDataSource | null = null;
    private config: DataSourceConfig[] = [];
    private isInitialized = false;

    constructor() {
        super();
        this.initializeDataSources();
    }

    private initializeDataSources(): void {
        // 初始化默认数据源配置
        this.config = [
            {
                name: 'sina',
                enabled: true,
                baseUrl: 'https://hq.sinajs.cn',
                timeout: 5000,
                priority: 1,
            },
            {
                name: 'eastmoney',
                enabled: true,
                baseUrl: 'https://push2.eastmoney.com',
                timeout: 5000,
                priority: 2,
            },
            {
                name: 'yahoo',
                enabled: false,
                baseUrl: 'https://query1.finance.yahoo.com',
                timeout: 10000,
                priority: 3,
            },
        ];
    }

    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        try {
            // 创建数据源实例
            // const sinaSource = new SinaDataSource(this.config[0]);
            // const eastMoneySource = new EastMoneyDataSource(this.config[1]);
            // const yahooSource = new YahooDataSource(this.config[2]);

            // 注册数据源
            // this.dataSources.set('sina', sinaSource);
            // this.dataSources.set('eastmoney', eastMoneySource);
            // this.dataSources.set('yahoo', yahooSource);

            // 初始化启用的数据源
            for (const [name, source] of this.dataSources) {
                const config = this.config.find(c => c.name === name);
                if (config?.enabled) {
                    await source.initialize();
                }
            }

            // 设置默认数据源
            this.setActiveDataSource('sina');

            this.isInitialized = true;
            console.log('数据源管理器初始化完成');
        } catch (error) {
            console.error('数据源管理器初始化失败:', error);
            throw error;
        }
    }

    public setActiveDataSource(name: string): void {
        const source = this.dataSources.get(name);
        if (source) {
            this.activeDataSource = source;
            console.log(`切换到数据源: ${name}`);
        } else {
            console.warn(`数据源 ${name} 不存在`);
        }
    }

    public getActiveDataSource(): IDataSource | null {
        return this.activeDataSource;
    }

    public async getQuote(symbol: string): Promise<Quote> {
        if (!this.activeDataSource) {
            throw new Error('没有可用的数据源');
        }

        try {
            const quote = await this.activeDataSource.getQuote(symbol);
            this.emit('quote-update', { symbol, quote, timestamp: Date.now() });
            return quote;
        } catch (error) {
            console.error(`获取股票行情失败: ${symbol}`, error);
            throw error;
        }
    }

    public async getQuotes(symbols: string[]): Promise<Quote[]> {
        if (!this.activeDataSource) {
            throw new Error('没有可用的数据源');
        }

        try {
            const quotes = await this.activeDataSource.getQuotes(symbols);

            // 发送行情更新事件
            quotes.forEach(quote => {
                this.emit('quote-update', {
                    symbol: quote.symbol,
                    quote,
                    timestamp: Date.now()
                });
            });

            return quotes;
        } catch (error) {
            console.error('批量获取股票行情失败:', error);
            throw error;
        }
    }

    public async getKline(symbol: string, period: string): Promise<KlineData> {
        if (!this.activeDataSource) {
            throw new Error('没有可用的数据源');
        }

        try {
            return await this.activeDataSource.getKline(symbol, period);
        } catch (error) {
            console.error(`获取K线数据失败: ${symbol} ${period}`, error);
            throw error;
        }
    }

    public subscribeQuotes(symbols: string[], callback: (quotes: Quote[]) => void): void {
        if (!this.activeDataSource) {
            throw new Error('没有可用的数据源');
        }

        this.activeDataSource.subscribeQuotes(symbols, callback);
    }

    public unsubscribeQuotes(symbols: string[]): void {
        if (!this.activeDataSource) {
            return;
        }

        this.activeDataSource.unsubscribeQuotes(symbols);
    }

    public getDataSourceConfig(): DataSourceConfig[] {
        return [...this.config];
    }

    public async updateDataSourceConfig(config: DataSourceConfig): Promise<void> {
        const index = this.config.findIndex(c => c.name === config.name);
        if (index !== -1) {
            this.config[index] = config;

            // 如果数据源已存在，重新初始化
            const existingSource = this.dataSources.get(config.name);
            if (existingSource) {
                if (config.enabled) {
                    await existingSource.initialize();
                } else {
                    await existingSource.destroy();
                }
            }
        }
    }

    public async destroy(): Promise<void> {
        for (const source of this.dataSources.values()) {
            try {
                await source.destroy();
            } catch (error) {
                console.error('销毁数据源失败:', error);
            }
        }

        this.dataSources.clear();
        this.activeDataSource = null;
        this.isInitialized = false;
    }

    // 获取数据源状态
    public getDataSourceStatus(): Array<{ name: string; enabled: boolean; status: string }> {
        return this.config.map(config => ({
            name: config.name,
            enabled: config.enabled,
            status: this.dataSources.has(config.name) ? 'active' : 'inactive',
        }));
    }
} 