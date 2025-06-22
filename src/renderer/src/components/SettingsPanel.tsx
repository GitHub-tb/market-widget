import React from 'react';
import { Card, Form, Switch, Slider, Select, Space, Typography } from 'antd';

const { Title } = Typography;
const { Option } = Select;

const SettingsPanel: React.FC = () => {
    return (
        <div className="settings-panel">
            <Card title="应用设置">
                <Form layout="vertical">
                    <Form.Item label="主题" name="theme">
                        <Select defaultValue="light">
                            <Option value="light">浅色主题</Option>
                            <Option value="dark">深色主题</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="语言" name="language">
                        <Select defaultValue="zh-CN">
                            <Option value="zh-CN">中文</Option>
                            <Option value="en-US">English</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="自动隐藏" name="autoHide" valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <Form.Item label="始终置顶" name="alwaysOnTop" valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <Form.Item label="透明度" name="opacity">
                        <Slider min={0.1} max={1} step={0.1} defaultValue={0.9} />
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default SettingsPanel; 