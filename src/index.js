import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';   // ✅ ใช้ Bootstrap ที่นี่

// สร้าง root element (React 18+ ใช้ createRoot)
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render App หลัก
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
