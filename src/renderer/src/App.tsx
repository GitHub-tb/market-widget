import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { App as AntApp } from 'antd';
import MainWindow from './pages/MainWindow';
import WidgetWindow from './pages/WidgetWindow';
import { initializeApp } from '../store/slices/appSlice';
import { useAppSelector } from '../hooks/useAppSelector';
import './styles/App.css';

const App: React.FC = () => {
    const dispatch = useAppDispatch();
    const { theme } = useAppSelector(state => state.app);

    useEffect(() => {
        // 初始化应用
        dispatch(initializeApp());
    }, [dispatch]);

    return (
        <AntApp>
            <div className={`app ${theme}`}>
                <Router>
                    <Routes>
                        <Route path="/" element={<MainWindow />} />
                        <Route path="/widget/:widgetId" element={<WidgetWindow />} />
                    </Routes>
                </Router>
            </div>
        </AntApp>
    );
};

export default App; 