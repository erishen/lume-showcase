import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { recordVisit } from './api';
import './style.css';

// 页面加载埋点（PV）；失败不影响渲染。
void recordVisit();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
