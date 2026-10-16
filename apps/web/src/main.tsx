import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initMonitoring, MonitoringBoundary } from './services/monitoring';

initMonitoring();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MonitoringBoundary>
      <App />
    </MonitoringBoundary>
  </React.StrictMode>,
);
