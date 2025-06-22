import React from 'react';
import { Card, List, Button, Space, Typography, Empty } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Text } = Typography;

const WatchlistPanel: React.FC = () => {
    return (
        <div className="watchlist-panel">
            <Card title="自选股" extra={
                <Button type="primary" icon={<PlusOutlined />} size="small">
                    添加
                </Button>
            }>
                <Empty description="暂无自选股" />
            </Card>
        </div>
    );
};

export default WatchlistPanel; 