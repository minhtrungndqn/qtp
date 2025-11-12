// src/components/MainLayout.jsx
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

// 1. Nhận hàm 'onLogout' từ App.jsx
function MainLayout({ onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout(); // Gọi hàm xóa token (từ App.jsx)
    navigate('/login'); // Điều hướng về trang đăng nhập
  };

  return (
    <>
      <header>
        <h1>Ứng dụng Thư ký QTP</h1>
        
        {/* Thanh Điều hướng (Navigation) */}
{/* Thanh Điều hướng (Navigation) */}
<nav className="main-nav">
  <NavLink to="/tasks">Quản lý Công việc</NavLink>
  <NavLink to="/reports">Báo cáo</NavLink>

  {/* === NÚT AI MỚI (ĐƠN GIẢN) === */}
  <a 
    href="https://gemini.google.com/" 
    target="_blank" 
    rel="noopener noreferrer"
    className="ai-link-button"
  >
    ⚡ AI Hỗ trợ (Gemini)
  </a>
  {/* === KẾT THÚC NÚT AI === */}
</nav>        <button onClick={handleLogoutClick} className="button-logout">
          Đăng xuất
        </button>
      </header>
      
      {/* Đây là nơi các trang con (TaskList, ReportPage) sẽ được render */}
      <Outlet /> 
    </>
  );
}

export default MainLayout;