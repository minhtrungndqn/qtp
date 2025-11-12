// src/components/ReportPage.jsx
// (PHIÊN BẢN HOÀN CHỈNH - Đã có Modal Gửi Email)

import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function ReportPage({ token, onLogout }) {
  // --- STATE CŨ ---
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- 1. STATE MỚI CHO MODAL EMAIL ---
  const [showEmailModal, setShowEmailModal] = useState(false); // Ẩn/hiện modal
  const [recipientEmail, setRecipientEmail] = useState(''); // Email người nhận
  const [emailStatus, setEmailStatus] = useState(''); // Trạng thái: 'sending', 'success', 'error'
  const [emailMessage, setEmailMessage] = useState(''); // Thông báo lỗi/thành công

  // (useEffect ... fetchSummary() ... giữ nguyên)
  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch('http://localhost:3000/api/reports/summary', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
            alert(data.message); 
            onLogout(); 
            return;
        }

        if (data.success) {
          setSummary(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Không thể tải dữ liệu báo cáo.');
        console.error("Lỗi fetch Báo cáo:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [token, onLogout]);

  
  // (Hàm handleExportCSV ... giữ nguyên)
  const handleExportCSV = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/reports/export', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'bao_cao_cong_viec.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Lỗi khi xuất CSV:', err);
      alert('Đã xảy ra lỗi khi cố gắng xuất file.');
    }
  };

  // --- 2. HÀM MỚI: XỬ LÝ GỬI EMAIL ---
  const handleSendEmail = async (e) => {
    e.preventDefault(); // Ngăn form (trong modal) tải lại trang
    
    setEmailStatus('sending'); // Báo là "Đang gửi..."
    setEmailMessage('');

    try {
      const response = await fetch('http://localhost:3000/api/reports/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipient_email: recipientEmail })
      });

      const result = await response.json();

      if (result.success) {
        setEmailStatus('success');
        setEmailMessage(result.message); // Hiển thị thông báo thành công từ API
        setRecipientEmail(''); // Xóa email trong ô input
        // (Chúng ta có thể tự động đóng modal sau 2 giây)
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailStatus('');
          setEmailMessage('');
        }, 2000);
      } else {
        // Hiển thị lỗi từ API (ví dụ: email không hợp lệ)
        setEmailStatus('error');
        setEmailMessage(result.message);
      }
    } catch (err) {
      console.error('Lỗi khi gửi email:', err);
      setEmailStatus('error');
      setEmailMessage('Lỗi kết nối máy chủ. Vui lòng thử lại.');
    }
  };


  // --- TÍNH TOÁN DỮ LIỆU ---
  // (Tính toán các giá trị hiển thị cho thẻ)
  const newTasks = summary?.status_counts?.NEW || 0;
  const inProgressTasks = summary?.status_counts?.IN_PROGRESS || 0;
  const completedTasks = summary?.status_counts?.COMPLETED || 0;
  const overdueTasks = summary?.overdue_count || 0;
  const totalTasks = newTasks + inProgressTasks + completedTasks;
  const notCompletedTasks = newTasks + inProgressTasks;

  // (Dữ liệu cho Biểu đồ tròn - giữ nguyên)
  const pieChartData = {
    labels: ['Đã Hoàn thành', 'Chưa Hoàn thành'],
    datasets: [
      {
        data: [ completedTasks, notCompletedTasks ],
        backgroundColor: ['#28a745', '#dc3545'],
        borderColor: ['#ffffff', '#ffffff'],
        borderWidth: 2,
      },
    ],
  };

  
  // --- PHẦN 3: GIAO DIỆN (JSX) ---
  return (
    <main>
      <div className="report-container">
        
        {/* Tiêu đề và Nút Xuất file */}
        <div className="report-header">
          <h2>Báo cáo Tổng hợp</h2>
          
          <div className="report-actions">
            {/* Nút Gửi Email (MỚI) */}
            <button
              onClick={() => setShowEmailModal(true)} // Mở modal
              className="button-email"
              disabled={loading}
            >
              Gửi Email
            </button>
            
            {/* Nút Xuất CSV (Cũ) */}
            <button 
              onClick={handleExportCSV}
              className="button-export"
              disabled={loading} 
            >
              Xuất Báo cáo (CSV)
            </button>

            {/* Nút In (Cũ) */}
            <button
              onClick={() => window.print()}
              className="button-print"
              disabled={loading}
            >
              In Báo cáo (PDF)
            </button>
          </div>

        </div>

        {/* (Các thẻ Thống kê và Biểu đồ - giữ nguyên) */}
        {loading && <p>Đang tải dữ liệu báo cáo...</p>}
        {error && <p className="error-message">{error}</p>}
        {summary && (
          <div className="summary-grid">
            {/* (4 thẻ card) */}
            <div className="summary-card"><h3>{totalTasks}</h3><p>Tổng số Công việc</p></div>
            <div className="summary-card"><h3>{completedTasks}</h3><p>Đã Hoàn thành</p></div>
            <div className="summary-card"><h3>{notCompletedTasks}</h3><p>Chưa Hoàn thành</p></div>
            <div className="summary-card overdue"><h3>{overdueTasks}</h3><p>Công việc Quá hạn</p></div>
          </div>
        )}
        {summary && (
          <div className="chart-container">
            <h3>Tỷ lệ Hoàn thành Công việc</h3>
            <div className="chart-wrapper">
              <Pie data={pieChartData} />
            </div>
          </div>
        )}

      </div>

      {/* === MODAL GỬI EMAIL (MỚI) === */}
      {/* Chỉ hiển thị modal nếu showEmailModal === true */}
      {showEmailModal && (
        // Lớp nền mờ
        <div className="modal-overlay"> 
          <div className="modal-content">
            {/* Nút X để đóng modal */}
            <button className="modal-close" onClick={() => setShowEmailModal(false)}>×</button>
            
            <h3>Gửi Báo cáo qua Email</h3>
            
            <form onSubmit={handleSendEmail}>
              <div className="form-group">
                <label>Gửi đến địa chỉ Email:</label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="nhap_email_nguoi_nhan@gmail.com"
                  required
                  disabled={emailStatus === 'sending'} // Khóa input khi đang gửi
                />
              </div>
              
              {/* Nút Gửi (bên trong modal) */}
              <button 
                type="submit" 
                className="button-email-submit" 
                disabled={emailStatus === 'sending'}
              >
                {emailStatus === 'sending' ? 'Đang gửi...' : 'Gửi'}
              </button>

              {/* Hiển thị thông báo (Thành công / Lỗi) */}
              {emailMessage && (
                <p className={`modal-message ${emailStatus}`}>
                  {emailMessage}
                </p>
              )}
            </form>

          </div>
        </div>
      )}
      {/* === KẾT THÚC MODAL === */}

    </main>
  );
}

export default ReportPage;