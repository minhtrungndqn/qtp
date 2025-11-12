// src/components/TaskList.jsx
// (PHIÊN BẢN HOÀN CHỈNH - 2 Dropdown Đơn vị -> Người nhận)

// 1. Import 'useMemo' để lọc danh sách
import { useState, useEffect, useMemo } from 'react';
import '../App.css'; 

function TaskList({ token }) {
  
  // --- PHẦN 1: STATE QUẢN LÝ ---
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]); 
  const [departments, setDepartments] = useState([]); // <-- MỚI: State cho Đơn vị
  const [loading, setLoading] = useState(true);
  
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState(''); // <-- MỚI: State cho Dropdown Đơn vị
  const [formAssigneeId, setFormAssigneeId] = useState(''); 
  const [formDueDate, setFormDueDate] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); 

  // --- PHẦN 2: HÀM GỌI API ---

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
      // (Hàm này giữ nguyên)
      try {
        const response = await fetch('http://localhost:3000/api/tasks', {
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
      // (Hàm này giữ nguyên - NHƯNG CHÚNG TA ĐÃ LẤY 'department_id' TRONG API)
        try {
          const response = await fetch('http://localhost:3000/api/users', {
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
    
    // <-- MỚI: Hàm 3: Lấy danh sách Đơn vị -->
    async function fetchDepartments() {
        try {
          const response = await fetch('http://localhost:3000/api/departments', {
            method: 'GET',
            headers: authHeaderOnly
          });
          const data = await response.json();
          if (data.success) {
            setDepartments(data.data); // Lưu danh sách Đơn vị vào state
          }
        } catch (error) {
          console.error("Lỗi! Không thể tải đơn vị:", error);
        }
    }

    async function loadInitialData() {
        setLoading(true);
        // <-- MỚI: Chạy cả 3 hàm song song -->
        await Promise.all([ 
            fetchTasks(),
            fetchUsers(),
            fetchDepartments() // <-- THÊM MỚI
        ]);
        setLoading(false);
    }
    
    loadInitialData();

  }, [token]); // Chạy lại nếu token thay đổi

  
  // <-- MỚI: PHẦN 3: LỌC DANH SÁCH NGƯỜI DÙNG THEO ĐƠN VỊ -->
  // 'useMemo' sẽ tự động chạy lại khi 'selectedDeptId' hoặc 'users' thay đổi
  const filteredUsers = useMemo(() => {
    if (!selectedDeptId) {
      return []; // Nếu chưa chọn Đơn vị, trả về mảng rỗng
    }
    // Lọc mảng 'users'
    return users.filter(user => 
      user.department_id === parseInt(selectedDeptId, 10)
    );
  }, [selectedDeptId, users]); // Biến phụ thuộc


  // (Các hàm handleSubmit, handleCompleteTask, handleDeleteTask giữ nguyên)
  
  // TẠO (Create) công việc mới
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    // Cập nhật kiểm tra (thêm !selectedDeptId)
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
      
      const response = await fetch('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: authHeaders, 
        body: JSON.stringify(taskData), 
      });
      const result = await response.json();
      if (result.success) {
        setTasks((prevTasks) => [...prevTasks, result.task]);
        // Cập nhật reset (thêm setSelectedDeptId)
        setFormTitle('');
        setFormDescription('');
        setSelectedDeptId(''); // <-- THÊM MỚI
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

  // (Hàm handleCompleteTask, handleDeleteTask giữ nguyên)
  const handleCompleteTask = async (taskId) => { /* ... (Giữ nguyên) ... */ };
  const handleDeleteTask = async (taskId) => { /* ... (Giữ nguyên) ... */ };
  const getUserNameById = (userId) => { /* ... (Giữ nguyên) ... */ };


  // --- PHẦN 3: GIAO DIỆN (JSX) ---
  return (
    <>
      {/* Bỏ <header> vì nó đã nằm trong MainLayout.jsx */}
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

            {/* <-- MỚI: Hàng chứa 2 Dropdown (Đơn vị & Người nhận) --> */}
            <div className="form-row">
              {/* Dropdown 1: Đơn vị */}
              <div className="form-group">
                <label>Đơn vị (Bắt buộc)</label>
                <select
                    value={selectedDeptId}
                    onChange={(e) => {
                        setSelectedDeptId(e.target.value); // Cập nhật Đơn vị
                        setFormAssigneeId(''); // Reset Người nhận khi đổi Đơn vị
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
                    // Tắt đi nếu chưa chọn Đơn vị
                    disabled={isSubmitting || !selectedDeptId} 
                >
                    <option value="">-- Chọn Người nhận --</option>
                    {/* Chỉ lặp qua 'filteredUsers' (đã lọc) */}
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
        {/* (Phần này giữ nguyên y hệt) */}
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