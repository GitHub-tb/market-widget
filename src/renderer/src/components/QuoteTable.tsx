import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Button, Input, message } from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchQuote, addSubscribedSymbol, removeSubscribedSymbol } from '../store/slices/quoteSlice';
import { Quote, MarketType } from '@/shared/types/market.types';
import '../styles/QuoteTable.css';
import {
    setSubscribedSymbols,
    setWatchlist,
} from "../store/slices/watchlistSlice";

const { Search } = Input;

const QuoteTable: React.FC = () => {
    const dispatch = useAppDispatch();
    const { quotes, subscribedSymbols, isLoading } = useAppSelector(state => state.quote);
    const [searchText, setSearchText] = useState('');
    const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);

    useEffect(() => {
        // 过滤和排序股票数据
        const quotesArray = Object.values(quotes);
        const filtered = quotesArray.filter(quote =>
            quote.symbol.toLowerCase().includes(searchText.toLowerCase()) ||
            quote.name.toLowerCase().includes(searchText.toLowerCase())
        );

        // 按涨跌幅排序
        const sorted = filtered.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
        setFilteredQuotes(sorted);
    }, [quotes, searchText]);

    const handleSearch = (value: string) => {
        setSearchText(value);
    };

    const handleAddSymbol = async (symbol: string) => {
        try {
            await dispatch(fetchQuote(symbol));
            dispatch(addSubscribedSymbol(symbol));
            message.success(`已添加 ${symbol} 到监控列表`);
        } catch (error) {
            message.error(`添加股票失败: ${symbol}`);
        }
    };

    const handleRemoveSymbol = (symbol: string) => {
        dispatch(removeSubscribedSymbol(symbol));
        message.success(`已从监控列表移除 ${symbol}`);
    };

    const formatPrice = (price: number) => {
        return price.toFixed(2);
    };

    const formatChange = (change: number) => {
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(2)}`;
    };

    const formatChangePercent = (changePercent: number) => {
        const sign = changePercent >= 0 ? '+' : '';
        return `${sign}${changePercent.toFixed(2)}%`;
    };

    const formatVolume = (volume: number) => {
        if (volume >= 100000000) {
            return `${(volume / 100000000).toFixed(2)}亿`;
        } else if (volume >= 10000) {
            return `${(volume / 10000).toFixed(2)}万`;
        }
        return volume.toString();
    };

    const getMarketTag = (market: MarketType) => {
        const marketMap = {
            [MarketType.A_SHARE]: { color: 'blue', text: 'A股' },
            [MarketType.H_SHARE]: { color: 'green', text: '港股' },
            [MarketType.US_STOCK]: { color: 'red', text: '美股' },
            [MarketType.FUTURES]: { color: 'orange', text: '期货' },
            [MarketType.FOREX]: { color: 'purple', text: '外汇' },
            [MarketType.CRYPTO]: { color: 'gold', text: '加密货币' },
        };

        const config = marketMap[market];
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const columns = [
        {
            title: '代码',
            dataIndex: 'symbol',
            key: 'symbol',
            width: 100,
            render: (symbol: string) => (
                <span className="symbol-cell">
                    <strong>{symbol}</strong>
                </span>
            ),
        },
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
            width: 120,
            render: (name: string) => (
                <span className="name-cell">{name}</span>
            ),
        },
        {
            title: '市场',
            dataIndex: 'market',
            key: 'market',
            width: 80,
            render: (market: MarketType) => getMarketTag(market),
        },
        {
            title: '最新价',
            dataIndex: 'price',
            key: 'price',
            width: 100,
            render: (price: number) => (
                <span className="price-cell">{formatPrice(price)}</span>
            ),
        },
        {
            title: '涨跌额',
            dataIndex: 'change',
            key: 'change',
            width: 100,
            render: (change: number) => (
                <span className={`change-cell ${change >= 0 ? 'positive' : 'negative'}`}>
                    {formatChange(change)}
                </span>
            ),
        },
        {
            title: '涨跌幅',
            dataIndex: 'changePercent',
            key: 'changePercent',
            width: 100,
            render: (changePercent: number) => (
                <span className={`change-percent-cell ${changePercent >= 0 ? 'positive' : 'negative'}`}>
                    {formatChangePercent(changePercent)}
                </span>
            ),
        },
        {
            title: '开盘',
            dataIndex: 'open',
            key: 'open',
            width: 90,
            render: (open: number) => formatPrice(open),
        },
        {
            title: '最高',
            dataIndex: 'high',
            key: 'high',
            width: 90,
            render: (high: number) => formatPrice(high),
        },
        {
            title: '最低',
            dataIndex: 'low',
            key: 'low',
            width: 90,
            render: (low: number) => formatPrice(low),
        },
        {
            title: '成交量',
            dataIndex: 'volume',
            key: 'volume',
            width: 100,
            render: (volume: number) => formatVolume(volume),
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            render: (_: any, record: Quote) => {
                const isSubscribed = subscribedSymbols.includes(record.symbol);
                return (
                    <Space size="small">
                        {isSubscribed ? (
                            <Button
                                size="small"
                                danger
                                onClick={() => handleRemoveSymbol(record.symbol)}
                            >
                                移除
                            </Button>
                        ) : (
                            <Button
                                size="small"
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => handleAddSymbol(record.symbol)}
                            >
                                添加
                            </Button>
                        )}
                    </Space>
                );
            },
        },
    ];

    return (
        <div className="quote-table-container">
            <div className="table-header">
                <div className="header-left">
                    <h3>股票行情</h3>
                    <span className="quote-count">共 {filteredQuotes.length} 只股票</span>
                </div>
                <div className="header-right">
                    <Space>
                        <Search
                            placeholder="搜索股票代码或名称"
                            allowClear
                            onSearch={handleSearch}
                            style={{ width: 250 }}
                            prefix={<SearchOutlined />}
                        />
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => {
                                if (subscribedSymbols.length > 0) {
                                    subscribedSymbols.forEach(symbol => dispatch(fetchQuote(symbol)));
                                }
                            }}
                            loading={isLoading}
                        >
                            刷新
                        </Button>
                    </Space>
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={filteredQuotes}
                rowKey="symbol"
                pagination={{
                    pageSize: 20,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                        `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                }}
                scroll={{ x: 1200, y: 500 }}
                loading={isLoading}
                size="small"
                className="quote-table"
            />
        </div>
    );
};

export default QuoteTable; 