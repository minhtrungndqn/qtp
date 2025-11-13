// src/components/LoginPage.jsx
// (PHIÊN BẢN HOÀN CHỈNH - Đã kết nối với API Production)

import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import hook điều hướng

function LoginPage({ onLoginSuccess }) {
  // Lấy URL API từ file .env
  const API_URL = import.meta.env.VITE_API_URL;

  // State riêng của trang Login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Để hiển thị lỗi
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate(); // Hook để chuyển trang

  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn form tải lại trang
    setError(''); // Xóa lỗi cũ
    setIsLoading(true);

    if (!username || !password) {
      setError('Vui lòng nhập Tên đăng nhập và Mật khẩu.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. SỬA URL: Gọi API Production
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      // 2. Phân tích kết quả
      if (data.success) {
        // THÀNH CÔNG!
        // Gọi hàm prop onLoginSuccess (từ App.jsx) và đưa 'token' lên
        onLoginSuccess(data.token);
        // Tự động điều hướng đến trang công việc
        navigate('/tasks'); 
      } else {
        // THẤT BẠI (Sai mật khẩu, vv)
        setError(data.message || 'Đăng nhập thất bại.');
      }
    } catch (err) {
      // Lỗi (Mất mạng, backend sập, vv)
      console.error('Lỗi khi đăng nhập:', err);
      setError('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
    } finally {
      setIsLoading(false); // Dừng loading
    }
  };

  // 3. Đây là giao diện (JSX) của trang đăng nhập
  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Ứng dụng Thư ký QTP</h2>
        <div className="form-group">
          <label>Tên đăng nhập</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label>Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        {/* Hiển thị lỗi nếu có */}
        {error && <p className="error-message">{error}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;