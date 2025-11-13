// src/components/TaskList.jsx
// (PHIÊN BẢN HOÀN CHỈNH - Đã kết nối với API Production)

import { useState, useEffect, useMemo } from 'react';
import '../App.css'; 

// 1. Nhận 'token' từ App.jsx
function TaskList({ token }) {
  
  // --- PHẦN 1: STATE QUẢN LÝ ---
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]); 
  const [departments, setDepartments] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState(''); 
  const [formAssigneeId, setFormAssigneeId] = useState(''); 
  const [formDueDate, setFormDueDate] = useState('');
  const [formStartDate, setFormStartDate] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false); 

  // --- PHẦN 2: HÀM GỌI API ---

  // Lấy URL API từ file .env
  const API_URL = import.meta.env.VITE_API_URL;

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  const authHeaderOnly = {
    'Authorization': `Bearer ${token}`
  };

  // useEffect: Tải Tasks, Users, và Departments
  useEffect(() => {
    async function fetchTasks() {
      try {
        // SỬA URL:
        const response = await fetch(`${API_URL}/api/tasks`, {
          method: 'GET',
          headers: authHeaderOnly
        });
        const data = await response.json();
        if (data.success) {
          setTasks(data.data);
        }
      } catch (error) {
        console.error("Lỗi! Không thể tải công việc:", error);
      }
    }

    async function fetchUsers() {
        try {
          // SỬA URL:
          const response = await fetch(`${API_URL}/api/users`, {
            method: 'GET',
            headers: authHeaderOnly
          });
          const data = await response.json();
          if (data.success) {
            setUsers(data.data); 
          }
        } catch (error) {
          console.error("Lỗi! Không thể tải người dùng:", error);
        }
    }
    
    async function fetchDepartments() {
        try {
          // SỬA URL:
          const response = await fetch(`${API_URL}/api/departments`, {
            method: 'GET',
            headers: authHeaderOnly
          });
          const data = await response.json();
          if (data.success) {
            setDepartments(data.data); 
          }
        } catch (error) {
          console.error("Lỗi! Không thể tải đơn vị:", error);
        }
    }

    async function loadInitialData() {
        setLoading(true);
        await Promise.all([ 
            fetchTasks(),
            fetchUsers(),
            fetchDepartments() 
        ]);
        setLoading(false);
    }
    
    loadInitialData();

  }, [token, API_URL]); // Thêm API_URL vào dependencies

  
  // Lọc danh sách người dùng
  const filteredUsers = useMemo(() => {
    if (!selectedDeptId) {
      return []; 
    }
    return users.filter(user => 
      user.department_id === parseInt(selectedDeptId, 10)
    );
  }, [selectedDeptId, users]); 


  // (Các hàm handleSubmit, handleCompleteTask, handleDeleteTask)
  
  // TẠO (Create) công việc mới
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (!formTitle || !selectedDeptId || !formAssigneeId || !formDueDate || !formStartDate) { 
      alert("Vui lòng nhập Tiêu đề, chọn Đơn vị, Người nhận, Ngày giao và Ngày hết hạn.");
      return;
    }
    setIsSubmitting(true); 
    try {
      const taskData = {
        title: formTitle,
        description: formDescription,
        assignee_id: parseInt(formAssigneeId, 10),
        due_date: formDueDate,
        start_date: formStartDate 
      };
      
      // SỬA URL:
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: authHeaders, 
        body: JSON.stringify(taskData), 
      });
      const result = await response.json();
      if (result.success) {
        setTasks((prevTasks) => [...prevTasks, result.task]);
        setFormTitle('');
        setFormDescription('');
        setSelectedDeptId(''); 
        setFormAssigneeId(''); 
        setFormDueDate('');
        setFormStartDate(''); 
      } else {
        alert("Tạo công việc thất bại: " + result.message);
      }
    } catch (error) { 
      console.error("Lỗi khi gửi form:", error);
    } finally {
      setIsSubmitting(false); 
    }
  };

  // CẬP NHẬT (Update) - Hoàn thành
  const handleCompleteTask = async (taskId) => {
    try {
      // SỬA URL:
      const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: authHeaders, 
        body: JSON.stringify({ status: 'COMPLETED' }), 
      });
      const result = await response.json();
      if (result.success) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.task_id === taskId ? { ...task, status: 'COMPLETED' } : task
          )
        );
      } else {
        alert("Cập nhật thất bại: " + result.message);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật công việc:", error);
    }
  };

  // XÓA (Delete) công việc
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa công việc này?")) {
      return; 
    }
    try {
      // SỬA URL:
      const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: authHeaderOnly 
      });
      const result = await response.json();
      if (result.success) {
        setTasks((prevTasks) =>
          prevTasks.filter((task) => task.task_id !== taskId)
        );
      } else {
        alert("Xóa thất bại: " + result.message);
      }
    } catch (error) {
      console.error("Lỗi khi xóa công việc:", error);
    }
  };


  // HÀM TRA CỨU TÊN
  const getUserNameById = (userId) => {
    const user = users.find(u => u.user_id === userId);
    if (user) {
      return user.full_name;
    }
    return `ID: ${userId}`;
  };


  // --- PHẦN 3: GIAO DIỆN (JSX) ---
  return (
    <>
      <main>
        {/* === FORM THÊM CÔNG VIỆC === */}
        <div className="form-container">
          <h2>Nhập công việc mới</h2>
          
          <form onSubmit={handleSubmit}>
            
            <div className="form-group">
              <label>Tiêu đề công việc (Bắt buộc)</label>
              <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} disabled={isSubmitting} />
            </div>
            
            <div className="form-group">
              <label>Mô tả</label>
              <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} disabled={isSubmitting} />
            </div>

            {/* Hàng chứa Ngày giao và Hạn chót */}
            <div className="form-row">
              <div className="form-group">
                <label>Ngày giao việc (Bắt buộc)</label>
                <input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label>Ngày hết hạn (Bắt buộc)</label>
                <input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Hàng chứa 2 Dropdown (Đơn vị & Người nhận) */}
            <div className="form-row">
              {/* Dropdown 1: Đơn vị */}
              <div className="form-group">
                <label>Đơn vị (Bắt buộc)</label>
                <select
                    value={selectedDeptId}
                    onChange={(e) => {
                        setSelectedDeptId(e.target.value); 
                        setFormAssigneeId(''); 
                    }}
                    disabled={isSubmitting || departments.length === 0}
                >
                    <option value="">-- Chọn Đơn vị --</option>
                    {departments.map((dept) => (
                        <option key={dept.department_id} value={dept.department_id}>
                            {dept.name}
                        </option>
                    ))}
                </select>
              </div>

              {/* Dropdown 2: Người nhận (Đã lọc) */}
              <div className="form-group">
                <label>Người nhận (Bắt buộc)</label>
                <select
                    value={formAssigneeId}
                    onChange={(e) => setFormAssigneeId(e.target.value)}
                    disabled={isSubmitting || !selectedDeptId} 
                >
                    <option value="">-- Chọn Người nhận --</option>
                    {filteredUsers.map((user) => (
                        <option key={user.user_id} value={user.user_id}>
                            {user.full_name} ({user.username})
                        </option>
                    ))}
                </select>
              </div>
            </div>
            
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang tạo...' : 'Tạo công việc'}
            </button>
          
          </form> 
        
        </div> 


        {/* === DANH SÁCH CÔNG VIỆC === */}
        <h2>Danh sách công việc</h2>
        {loading && <p>Đang tải dữ liệu...</p>}
        {!loading && tasks.length === 0 && <p>Chưa có công việc nào.</p>}
        {!loading && tasks.length > 0 && (
          <div className="task-list"> 
            {tasks.map((task) => (
              <div key={task.task_id} className="task-item">
                <h3>{task.title}</h3>
                <p><strong>Trạng thái:</strong> {task.status}</p>
                <p><strong>Người nhận:</strong> {getUserNameById(task.assignee_id)}</p>
                <p><strong>Ngày giao:</strong> {task.start_date}</p>
                <p><strong>Hạn chót:</strong> {task.due_date}</p>
                {task.description && <p><em>Mô tả: {task.description}</em></p>}
                <p className="task-creator"><em>(Người giao việc: {getUserNameById(task.creator_id)})</em></p>
                <div className="task-actions">
                  {task.status !== 'COMPLETED' && (
                    <button
                      className="button-complete"
                      onClick={() => handleCompleteTask(task.task_id)}
                    >
                      ✓ Hoàn thành
                    </button>
                  )}
                  <button
                    className="button-delete"
                    onClick={() => handleDeleteTask(task.task_id)}
                  >
                    ✗ Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default TaskList;