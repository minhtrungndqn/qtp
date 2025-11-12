// src/components/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- IMPORT MỚI

// Chúng ta nhận một prop là onLoginSuccess, đây là hàm
// do App.jsx đưa vào để báo "Đăng nhập thành công!"
function LoginPage({ onLoginSuccess }) {
  // State riêng của trang Login
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Để hiển thị lỗi
  const [isLoading, setIsLoading] = useState(false);

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
      // 1. Gọi API /api/auth/login
      const response = await fetch('http://localhost:3000/api/auth/login', {
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
        // Gọi hàm prop onLoginSuccess và đưa 'token' lên cho App.jsx
        onLoginSuccess(data.token);
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