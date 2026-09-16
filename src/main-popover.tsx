import React from 'react';
import ReactDOM from 'react-dom/client';
import { Popover } from './popover/Popover';
import './theme.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <style>{`html, body, #root { background: transparent !important; }`}</style>
    <Popover />
  </React.StrictMode>,
);
