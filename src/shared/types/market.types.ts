// 股票行情数据类型
export interface Quote {
    symbol: string;           // 股票代码
    name: string;             // 股票名称
    price: number;            // 当前价格
    change: number;           // 涨跌额
    changePercent: number;    // 涨跌幅
    open: number;             // 开盘价
    high: number;             // 最高价
    low: number;              // 最低价
    prevClose: number;        // 昨收价
    volume: number;           // 成交量
    amount: number;           // 成交额
    marketCap?: number;       // 市值
    pe?: number;              // 市盈率
    pb?: number;              // 市净率
    timestamp: number;        // 时间戳
    market: MarketType;       // 市场类型
    lastUpdate: number;        // 最后更新时间
}

// 市场类型
export type MarketType = 'SH' | 'SZ' | 'HK' | 'US' | 'NASDAQ';

// K线数据类型
export interface KlineData {
    symbol: string;           // 股票代码
    period: string;           // 周期 (1m, 5m, 15m, 30m, 1h, 1d, 1w, 1M)
    data: KlineItem[];        // K线数据数组
    timestamp: number;        // 时间戳
}

// K线单条数据
export interface KlineItem {
    time: number;             // 时间戳
    open: number;             // 开盘价
    high: number;             // 最高价
    low: number;              // 最低价
    close: number;            // 收盘价
    volume: number;           // 成交量
    amount?: number;          // 成交额
}

// 技术指标类型
export interface TechnicalIndicator {
    name: string;             // 指标名称
    data: IndicatorData[];    // 指标数据
    color?: string;           // 显示颜色
    lineWidth?: number;       // 线宽
}

// 指标数据
export interface IndicatorData {
    time: number;             // 时间戳
    value: number;            // 指标值
}

// 数据源配置
export interface DataSourceConfig {
    name: string;             // 数据源名称
    enabled: boolean;         // 是否启用
    baseUrl: string;          // 基础URL
    timeout: number;          // 超时时间
    apiKey?: string;          // API密钥
    priority: number;         // 优先级
}

// 数据源接口
export interface IDataSource {
    name: string;
    initialize(): Promise<void>;
    getQuote(symbol: string): Promise<Quote>;
    getQuotes(symbols: string[]): Promise<Quote[]>;
    getKline(symbol: string, period: string): Promise<KlineData>;
    subscribeQuotes(symbols: string[], callback: (quotes: Quote[]) => void): void;
    unsubscribeQuotes(symbols: string[]): void;
    destroy(): Promise<void>;
}

// 行情数据更新事件
export interface QuoteUpdateEvent {
    symbol: string;
    quote: Quote;
    timestamp: number;
}

// 市场状态
export interface MarketStatus {
    market: MarketType;
    isOpen: boolean;          // 是否开市
    openTime: string;         // 开盘时间
    closeTime: string;        // 收盘时间
    nextOpenTime?: string;    // 下次开盘时间
}

// 自选股
export interface WatchlistItem {
    id: string;
    symbol: string;
    name: string;
    market: MarketType;
    addedAt: number;
    notes?: string;
}

// 预警设置
export interface Alert {
    id: string;
    symbol: string;
    type: AlertType;
    condition: AlertCondition;
    value: number;
    enabled: boolean;
    createdAt: number;
    triggeredAt?: number;
}

// 预警类型
export enum AlertType {
    PRICE_ABOVE = 'PRICE_ABOVE',     // 价格高于
    PRICE_BELOW = 'PRICE_BELOW',     // 价格低于
    CHANGE_ABOVE = 'CHANGE_ABOVE',   // 涨跌幅高于
    CHANGE_BELOW = 'CHANGE_BELOW',   // 涨跌幅低于
    VOLUME_ABOVE = 'VOLUME_ABOVE',   // 成交量高于
}

// 预警条件
export enum AlertCondition {
    GREATER_THAN = 'GREATER_THAN',
    LESS_THAN = 'LESS_THAN',
    EQUAL = 'EQUAL',
    PERCENT_CHANGE = 'PERCENT_CHANGE',
}

// 数据源响应格式
export interface DataSourceResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: number;
}

// 分页参数
export interface PaginationParams {
    page: number;
    pageSize: number;
    total?: number;
}

// 分页响应
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
} 