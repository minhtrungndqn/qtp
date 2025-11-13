// src/components/ReportPage.jsx
// (PHIÊN BẢN HOÀN CHỈNH - Đã kết nối với API Production)

import React, { useState, useEffect } from 'react';
// Import thư viện Chart.js
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Đăng ký các thành phần của Biểu đồ
ChartJS.register(ArcElement, Tooltip, Legend);

function ReportPage({ token, onLogout }) {
  // Lấy URL API từ file .env
  const API_URL = import.meta.env.VITE_API_URL;

  // --- STATE CŨ ---
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- STATE MỚI CHO MODAL EMAIL ---
  const [showEmailModal, setShowEmailModal] = useState(false); 
  const [recipientEmail, setRecipientEmail] = useState(''); 
  const [emailStatus, setEmailStatus] = useState(''); 
  const [emailMessage, setEmailMessage] = useState(''); 

  // --- HÀM 1: LẤY DỮ LIỆU TÓM TẮT ---
  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        setError('');
        
        // SỬA URL:
        const response = await fetch(`${API_URL}/api/reports/summary`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        // Xử lý lỗi Token hết hạn
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
  }, [token, onLogout, API_URL]); // Thêm API_URL vào dependencies

  
  // --- HÀM 2: XỬ LÝ XUẤT FILE CSV ---
  const handleExportCSV = async () => {
    try {
      // SỬA URL:
      const response = await fetch(`${API_URL}/api/reports/export`, {
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

  // --- HÀM 3: XỬ LÝ GỬI EMAIL ---
  const handleSendEmail = async (e) => {
    e.preventDefault(); 
    
    setEmailStatus('sending'); 
    setEmailMessage('');

    try {
      // SỬA URL:
      const response = await fetch(`${API_URL}/api/reports/email`, {
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
        setEmailMessage(result.message); 
        setRecipientEmail(''); 
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailStatus('');
          setEmailMessage('');
        }, 2000);
      } else {
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
  const newTasks = summary?.status_counts?.NEW || 0;
  const inProgressTasks = summary?.status_counts?.IN_PROGRESS || 0;
  const completedTasks = summary?.status_counts?.COMPLETED || 0;
  const overdueTasks = summary?.overdue_count || 0;
  const totalTasks = newTasks + inProgressTasks + completedTasks;
  const notCompletedTasks = newTasks + inProgressTasks;

  // Dữ liệu cho Biểu đồ tròn
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
            {/* Nút Gửi Email */}
            <button
              onClick={() => setShowEmailModal(true)}
              className="button-email"
              disabled={loading}
            >
              Gửi Email
            </button>
            
            {/* Nút Xuất CSV */}
            <button 
              onClick={handleExportCSV}
              className="button-export"
              disabled={loading} 
            >
              Xuất Báo cáo (CSV)
            </button>

            {/* Nút In */}
            <button
              onClick={() => window.print()}
              className="button-print"
              disabled={loading}
            >
              In Báo cáo (PDF)
            </button>
          </div>

        </div>

        {/* Các thẻ Thống kê và Biểu đồ */}
        {loading && <p>Đang tải dữ liệu báo cáo...</p>}
        {error && <p className="error-message">{error}</p>}
        {summary && (
          <div className="summary-grid">
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

      {/* === MODAL GỬI EMAIL === */}
      {showEmailModal && (
        <div className="modal-overlay"> 
          <div className="modal-content">
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
                  disabled={emailStatus === 'sending'}
                />
              </div>
              
              <button 
                type="submit" 
                className="button-email-submit" 
                disabled={emailStatus === 'sending'}
              >
                {emailStatus === 'sending' ? 'Đang gửi...' : 'Gửi'}
              </button>

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