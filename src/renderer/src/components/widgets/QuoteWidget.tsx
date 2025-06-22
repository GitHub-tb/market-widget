import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Space, Typography, Spin } from 'antd';
import { useAppSelector } from '../../hooks/useAppSelector';
import { Quote, MarketType } from '@/shared/types/market.types';
import '../../styles/QuoteWidget.css';

const { Text } = Typography;

interface QuoteWidgetProps {
    symbols: string[];
    settings?: {
        showVolume?: boolean;
        showChange?: boolean;
        refreshInterval?: number;
    };
}

const QuoteWidget: React.FC<QuoteWidgetProps> = ({ symbols, settings = {} }) => {
    const { quotes, isLoading } = useAppSelector(state => state.quote);
    const [displayQuotes, setDisplayQuotes] = useState<Quote[]>([]);

    useEffect(() => {
        // 过滤显示指定股票的行情
        const filteredQuotes = symbols
            .map(symbol => quotes[symbol])
            .filter(quote => quote !== undefined);
        setDisplayQuotes(filteredQuotes);
    }, [quotes, symbols]);

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
        if (!config) {
            return <Tag color="red">Invalid Config</Tag>;
        }

        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const renderQuoteItem = (quote: Quote) => (
        <List.Item className="quote-item">
            <div className="quote-header">
                <div className="quote-symbol">
                    <Text strong>{quote.symbol}</Text>
                    {getMarketTag(quote.market)}
                </div>
                <div className="quote-name">
                    <Text type="secondary">{quote.name}</Text>
                </div>
            </div>

            <div className="quote-price">
                <Text className="price-text" strong>
                    {formatPrice(quote.price)}
                </Text>
            </div>

            <div className="quote-change">
                <Space direction="vertical" size={0}>
                    <Text className={`change-text ${quote.change >= 0 ? 'positive' : 'negative'}`}>
                        {formatChange(quote.change)}
                    </Text>
                    <Text className={`change-percent-text ${quote.changePercent >= 0 ? 'positive' : 'negative'}`}>
                        {formatChangePercent(quote.changePercent)}
                    </Text>
                </Space>
            </div>

            {settings.showVolume && (
                <div className="quote-volume">
                    <Text type="secondary" className="volume-text">
                        量: {formatVolume(quote.volume)}
                    </Text>
                </div>
            )}
        </List.Item>
    );

    if (isLoading && displayQuotes.length === 0) {
        return (
            <div className="quote-widget-loading">
                <Spin size="small" />
                <Text type="secondary">加载中...</Text>
            </div>
        );
    }

    return (
        <div className="quote-widget">
            <List
                dataSource={displayQuotes}
                renderItem={renderQuoteItem}
                size="small"
                className="quote-list"
                locale={{
                    emptyText: (
                        <div className="empty-text">
                            <Text type="secondary">暂无数据</Text>
                        </div>
                    ),
                }}
            />
        </div>
    );
};

export default QuoteWidget; 