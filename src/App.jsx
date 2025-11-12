// src/App.jsx (PHIÊN BẢN MỚI CÓ ROUTER)

import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css'; 

import LoginPage from './components/LoginPage';
import TaskList from './components/TaskList';
import MainLayout from './components/MainLayout';   // <-- IMPORT MỚI
import ReportPage from './components/ReportPage'; // <-- IMPORT MỚI

function App() {
  const [token, setToken] = useState(localStorage.getItem('jwtToken'));

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
    localStorage.setItem('jwtToken', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('jwtToken');
  };

  // 4. Đây là logic render chính:
  return (
    <div className="App">
      <Routes>
        {/* TUYẾN ĐƯỜNG 1: TRANG ĐĂNG NHẬP */}
        <Route 
          path="/login" 
          element={
            !token ? (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            ) : (
              <Navigate to="/tasks" replace /> // Nếu đã đăng nhập, đá về /tasks
            )
          }
        />

        {/* TUYẾN ĐƯỜNG 2: CÁC TRANG CẦN BẢO VỆ (Tasks, Reports) */}
        {/* Chúng ta dùng một 'Layout Route' để bọc các trang cần bảo vệ */}
        <Route 
          element={
            token ? (
              <MainLayout onLogout={handleLogout} /> // Nếu CÓ token, hiển thị Layout
            ) : (
              <Navigate to="/login" replace /> // Nếu KHÔNG, đá về /login
            )
          }
        >
          {/* Đây là các trang con của MainLayout */}
          <Route path="/tasks" element={<TaskList token={token} />} />
          <Route path="/reports" element={<ReportPage token={token} onLogout={handleLogout} />} />
          
          {/* Trang mặc định (/) sẽ chuyển hướng đến /tasks */}
          <Route path="/" element={<Navigate to="/tasks" replace />} />
        </Route>

      </Routes>
    </div>
  );
}

export default App;