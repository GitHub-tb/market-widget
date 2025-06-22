import React, { useEffect, useState } from 'react';
import { Layout, Menu, Button, Space, Typography, Spin, message } from 'antd';
import {
    HomeOutlined,
    PlusOutlined,
    SettingOutlined,
    ReloadOutlined,
    CloseOutlined,
    MinusOutlined,
    FullscreenOutlined,
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchQuotes } from '../store/slices/quoteSlice';
import QuoteTable from '../components/QuoteTable';
import WatchlistPanel from '../components/WatchlistPanel';
import SettingsPanel from '../components/SettingsPanel';
import '../styles/MainWindow.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainWindow: React.FC = () => {
    const dispatch = useDispatch();
    const { theme, isLoading, error } = useAppSelector(state => state.app);
    const { quotes, subscribedSymbols } = useAppSelector(state => state.quote);
    const [selectedMenu, setSelectedMenu] = useState('home');
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        // 加载默认股票数据
        const defaultSymbols = ['000001', '000002', '000858', '600000', '600036'];
        dispatch(fetchQuotes(defaultSymbols));
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            message.error(error);
        }
    }, [error]);

    const handleRefresh = () => {
        if (subscribedSymbols.length > 0) {
            dispatch(fetchQuotes(subscribedSymbols));
        }
    };

    const handleCreateWidget = async () => {
        try {
            if (window.electronAPI) {
                await window.electronAPI.createWidget({
                    type: 'quote',
                    title: '股票行情',
                    symbols: ['000001', '000002'],
                });
                message.success('挂件创建成功');
            }
        } catch (error) {
            message.error('创建挂件失败');
        }
    };

    const handleWindowControl = (action: 'minimize' | 'maximize' | 'close') => {
        if (window.electronAPI) {
            switch (action) {
                case 'minimize':
                    window.electronAPI.minimizeWindow();
                    break;
                case 'maximize':
                    window.electronAPI.maximizeWindow();
                    break;
                case 'close':
                    window.electronAPI.closeWindow();
                    break;
            }
        }
    };

    const renderContent = () => {
        switch (selectedMenu) {
            case 'home':
                return <QuoteTable />;
            case 'watchlist':
                return <WatchlistPanel />;
            case 'settings':
                return <SettingsPanel />;
            default:
                return <QuoteTable />;
        }
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <Spin size="large" />
                <p>正在初始化应用...</p>
            </div>
        );
    }

    return (
        <Layout className={`main-window ${theme}`}>
            <Header className="main-header">
                <div className="header-left">
                    <Title level={4} className="app-title">
                        Market Widget
                    </Title>
                </div>
                <div className="header-center">
                    <Space>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreateWidget}
                        >
                            新建挂件
                        </Button>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={handleRefresh}
                            loading={isLoading}
                        >
                            刷新
                        </Button>
                    </Space>
                </div>
                <div className="header-right">
                    <Space>
                        <Button
                            icon={<MinusOutlined />}
                            onClick={() => handleWindowControl('minimize')}
                            type="text"
                        />
                        <Button
                            icon={<FullscreenOutlined />}
                            onClick={() => handleWindowControl('maximize')}
                            type="text"
                        />
                        <Button
                            icon={<CloseOutlined />}
                            onClick={() => handleWindowControl('close')}
                            type="text"
                            danger
                        />
                    </Space>
                </div>
            </Header>

            <Layout>
                <Sider
                    width={200}
                    collapsible
                    collapsed={collapsed}
                    onCollapse={setCollapsed}
                    className="main-sider"
                >
                    <Menu
                        mode="inline"
                        selectedKeys={[selectedMenu]}
                        onSelect={({ key }) => setSelectedMenu(key)}
                        className="main-menu"
                    >
                        <Menu.Item key="home" icon={<HomeOutlined />}>
                            行情概览
                        </Menu.Item>
                        <Menu.Item key="watchlist" icon={<HomeOutlined />}>
                            自选股
                        </Menu.Item>
                        <Menu.Item key="settings" icon={<SettingOutlined />}>
                            设置
                        </Menu.Item>
                    </Menu>
                </Sider>

                <Content className="main-content">
                    <div className="content-wrapper">
                        {renderContent()}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainWindow; 