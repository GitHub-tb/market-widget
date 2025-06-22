import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Space, Typography, Spin } from 'antd';
import { CloseOutlined, SettingOutlined, ReloadOutlined } from '@ant-design/icons';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchQuotes } from '../store/slices/quoteSlice';
import QuoteWidget from '../components/widgets/QuoteWidget';
import '../styles/WidgetWindow.css';
import {
    setWidgetConfig,
    updateWidgetConfig,
} from "../store/slices/widgetSlice";

const { Title } = Typography;

const WidgetWindow: React.FC = () => {
    const { widgetId } = useParams<{ widgetId: string }>();
    const dispatch = useAppDispatch();
    const widgetConfig = useAppSelector((state) => state.widget.config);
    const quotes = useAppSelector((state) => state.quote.quotes);
    const { isLoading } = useAppSelector(state => state.quote);

    useEffect(() => {
        // 加载挂件配置
        if (widgetId && window.electronAPI) {
            window.electronAPI.getWidgets().then((widgets: any[]) => {
                const config = widgets.find(w => w.id === widgetId);
                if (config) {
                    setWidgetConfig(config);
                    // 加载股票数据
                    if (config.symbols && config.symbols.length > 0) {
                        dispatch(fetchQuotes(config.symbols));
                    }
                }
            });
        }
    }, [widgetId, dispatch]);

    const handleClose = () => {
        if (window.electronAPI) {
            window.electronAPI.closeWindow();
        }
    };

    const handleRefresh = () => {
        if (widgetConfig?.symbols) {
            dispatch(fetchQuotes(widgetConfig.symbols));
        }
    };

    const handleSettings = () => {
        // 打开设置面板
        console.log('打开设置');
    };

    if (!widgetConfig) {
        return (
            <div className="widget-loading">
                <Spin size="large" />
                <p>加载挂件配置中...</p>
            </div>
        );
    }

    return (
        <div className="widget-window">
            <div className="widget-header">
                <div className="widget-title">
                    <Title level={5}>{widgetConfig.title}</Title>
                </div>
                <div className="widget-controls">
                    <Space>
                        <Button
                            size="small"
                            icon={<ReloadOutlined />}
                            onClick={handleRefresh}
                            loading={isLoading}
                        />
                        <Button
                            size="small"
                            icon={<SettingOutlined />}
                            onClick={handleSettings}
                        />
                        <Button
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={handleClose}
                            danger
                        />
                    </Space>
                </div>
            </div>

            <div className="widget-content">
                {widgetConfig.type === 'quote' && (
                    <QuoteWidget
                        symbols={widgetConfig.symbols}
                        settings={widgetConfig.settings}
                    />
                )}
            </div>
        </div>
    );
};

export default WidgetWindow; 