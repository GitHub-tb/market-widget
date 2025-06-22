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
    setWidgets,
    updateWidget,
} from "../store/slices/widgetSlice";

const { Title } = Typography;

const WidgetWindow: React.FC = () => {
    const { widgetId } = useParams<{ widgetId: string }>();
    const dispatch = useAppDispatch();
    const widget = useAppSelector((state) =>
        state.widget.widgets.find((w) => w.id === widgetId)
    );
    const quotes = useAppSelector((state) => state.quote.quotes);
    const { isLoading } = useAppSelector((state) => state.quote);

    useEffect(() => {
        // 加载挂件配置
        if (widgetId && window.electronAPI) {
            window.electronAPI.getWidgets().then((widgets: any[]) => {
                if (widgets && widgets.length > 0) {
                    dispatch(setWidgets(widgets));
                    const currentWidget = widgets.find((w) => w.id === widgetId);
                    if (currentWidget) {
                        dispatch(fetchQuotes(currentWidget.symbols));
                    }
                }
            });
        }
    }, [widgetId, dispatch]);

    useEffect(() => {
        if (widget) {
            dispatch(fetchQuotes(widget.symbols));
        }
    }, [widget, dispatch]);

    const handleClose = () => {
        if (window.electronAPI) {
            window.electronAPI.closeWindow();
        }
    };

    const handleRefresh = () => {
        if (widget) {
            dispatch(fetchQuotes(widget.symbols));
        }
    };

    const handleSettings = () => {
        // 打开设置面板
        console.log('打开设置');
    };

    if (!widget) {
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
                    <Title level={5}>{widget.title}</Title>
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
                {widget.type === 'quote' && (
                    <QuoteWidget
                        symbols={widget.symbols}
                        settings={widget.settings}
                    />
                )}
            </div>
        </div>
    );
};

export default WidgetWindow; 