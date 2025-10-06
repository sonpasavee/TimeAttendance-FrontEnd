import React, { useEffect, useState } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  // โหลดข้อมูลตอน mount
  useEffect(() => {
    fetchUsers();
    fetchLeaves();
    fetchAttendance();
  }, []);

  // ดึง user ทั้งหมด
  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch users");
    }
  };

  // ดึง leave requests ที่รอดำเนินการ
  const fetchLeaves = async () => {
    try {
      const res = await API.get("/admin/leave/pending");
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch leave requests");
    }
  };

  // ดึง attendance ของทุกคน
  const fetchAttendance = async () => {
    try {
      const res = await API.get("/admin/attendance/all"); // ต้องสร้าง endpoint ใน backend
      setAttendance(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch attendance records");
    }
  };

  // Approve leave
  const approve = async (id) => {
    try {
      await API.put(`/admin/leave/${id}/approve`);
      fetchLeaves();
    } catch (err) {
      console.error(err);
      alert("Failed to approve leave");
    }
  };

  // Reject leave
  const reject = async (id) => {
    try {
      await API.put(`/admin/leave/${id}/reject`);
      fetchLeaves();
    } catch (err) {
      console.error(err);
      alert("Failed to reject leave");
    }
  };

  // เริ่มแก้ไข username
  const startEdit = (user) => {
    setEditingUser({ ...user });
  };

  // บันทึก username
  const saveEdit = async () => {
    if (!editingUser || !editingUser.username.trim()) return;

    try {
      await API.put(`/admin/users/${editingUser.id}`, { username: editingUser.username });
      setEditingUser(null);
      fetchUsers();
      alert("User updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update user");
    }
  };

  // ลบ user
  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await API.delete(`/admin/users/${id}`);
      fetchUsers();
      alert("User deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  };

  // แปลงวันที่
  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    const d = new Date(dateValue);
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
  };

  // แปลงเวลาสำหรับแสดง
  const formatDateTime = (dateValue) => {
    if (!dateValue) return "-";
    const d = new Date(dateValue);
    return isNaN(d.getTime()) ? "-" : d.toLocaleString();
  };

  return (
    <div>
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">Admin Dashboard</h2>

        {/* Pending Leave Requests */}
        <div className="card mb-5">
          <div className="card-header bg-primary text-white">Pending Leave Requests</div>
          <div className="card-body p-0">
            <table className="table mb-0">
              <thead className="table-light">
                <tr>
                  <th>User</th>
                  <th>Reason</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length > 0 ? (
                  leaves.map((l) => (
                    <tr key={l.id}>
                      <td>{l.username}</td>
                      <td>{l.reason}</td>
                      <td>{formatDate(l.startDate)}</td>
                      <td>{formatDate(l.endDate)}</td>
                      <td>{formatDateTime(l.createdAt)}</td>
                      <td>
                        <button className="btn btn-success btn-sm me-2" onClick={() => approve(l.id)}>Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => reject(l.id)}>Reject</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">No pending requests</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Users */}
        <div className="card mb-5">
          <div className="card-header bg-secondary text-white">All Users</div>
          <ul className="list-group list-group-flush">
            {users.length > 0 ? (
              users.map((u) => (
                <li key={u.id} className="list-group-item d-flex justify-content-between align-items-center">
                  {editingUser?.id === u.id ? (
                    <input
                      className="form-control me-2"
                      value={editingUser.username}
                      onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    />
                  ) : (
                    <span>{u.username} ({u.role})</span>
                  )}

                  <div>
                    {editingUser?.id === u.id ? (
                      <button className="btn btn-sm btn-success me-2" onClick={saveEdit} disabled={!editingUser.username.trim()}>Save</button>
                    ) : (
                      <button className="btn btn-sm btn-primary me-2" onClick={() => startEdit(u)}>Edit</button>
                    )}
                    <button className="btn btn-sm btn-danger" onClick={() => deleteUser(u.id)}>Delete</button>
                  </div>
                </li>
              ))
            ) : (
              <li className="list-group-item text-center">No users found</li>
            )}
          </ul>
        </div>

        {/* All Attendance Records */}
        <div className="card">
          <div className="card-header bg-info text-white">Attendance Records</div>
          <div className="card-body p-0">
            <table className="table mb-0">
              <thead className="table-light">
                <tr>
                  <th>User</th>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Status</th>
                  <th>Method</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length > 0 ? (
                  attendance.map((a) => (
                    <tr key={a.id}>
                      <td>{a.username}</td>
                      <td>{formatDate(a.date)}</td>
                      <td>{formatDateTime(a.clockIn)}</td>
                      <td>{formatDateTime(a.clockOut)}</td>
                      <td>{a.status}</td>
                      <td>{a.method}</td>
                      <td>{a.location}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">No attendance records</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
