import React, { useEffect, useState } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";
import { FaUserAlt, FaRegClock, FaUserCheck, FaCalendarCheck, FaBan } from "react-icons/fa";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [userFilter, setUserFilter] = useState("ALL");

  const [userPage, setUserPage] = useState(1);
  const [userPerPage] = useState(5);
  const [attendancePage, setAttendancePage] = useState(1);
  const [attendancePerPage] = useState(5);

  const normalUsers = users.filter((u) => u.role && u.role.toLowerCase() !== "admin");
  const totalNormalUsers = normalUsers.length;

  const summary = {
    totalClockIn: attendance.filter((a) => a.clockIn).length,
    totalClockOut: attendance.filter((a) => a.clockOut).length,
    totalLeave: leaves.filter((l) => l.status === "APPROVED").length,
  };
  const rejectedCount = leaves.filter((l) => l.status === "REJECTED").length;

  useEffect(() => {
    fetchUsers();
    fetchLeaves();
    fetchAttendance();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch users");
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await API.get("/admin/leave/all");
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch leave requests");
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await API.get("/admin/attendance/all");
      setAttendance(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch attendance records");
    }
  };

  const approve = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await API.put(`/admin/leave/${id}/approve`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLeaves();
    } catch (err) {
      console.error(err);
      alert("Failed to approve leave");
    }
  };

  const reject = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await API.put(`/admin/leave/${id}/reject`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLeaves();
    } catch (err) {
      console.error(err);
      alert("Failed to reject leave");
    }
  };

  const startEdit = (user) => setEditingUser({ ...user });

  const saveEdit = async () => {
    if (!editingUser || !editingUser.username.trim()) return;
    try {
      const token = localStorage.getItem("token");
      await API.put(
        `/admin/users/${editingUser.id}`,
        { username: editingUser.username },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingUser(null);
      fetchUsers();
      alert("User updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update user");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      alert("User deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    const d = new Date(dateValue);
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) return "-";
    const d = new Date(dateValue);
    return isNaN(d.getTime()) ? "-" : d.toLocaleString();
  };

  const filteredUsers = users.filter((u) =>
    userFilter === "ALL" ? true : u.role.toUpperCase() === userFilter
  );
  const pendingLeaves = leaves.filter((l) => l.status === "PENDING");

  const indexOfLastUser = userPage * userPerPage;
  const indexOfFirstUser = indexOfLastUser - userPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalUserPages = Math.ceil(filteredUsers.length / userPerPage);

  const indexOfLastAttendance = attendancePage * attendancePerPage;
  const indexOfFirstAttendance = indexOfLastAttendance - attendancePerPage;
  const currentAttendance = attendance.slice(indexOfFirstAttendance, indexOfLastAttendance);
  const totalAttendancePages = Math.ceil(attendance.length / attendancePerPage);

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "on time":
        return <span className="badge bg-success text-white">{status}</span>;
      case "late":
        return <span className="badge bg-danger text-white">{status}</span>;
      case "absent":
        return <span className="badge bg-secondary text-white">{status}</span>;
      default:
        return <span className="badge bg-info text-white">{status}</span>;
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container py-5">

        {/* Summary Cards */}
        <div className="d-flex justify-content-center mb-5 flex-wrap gap-4">
          {[
            { title: "Total Users", value: totalNormalUsers, icon: <FaUserAlt /> },
            { title: "Clock In", value: summary.totalClockIn, icon: <FaRegClock /> },
            { title: "Clock Out", value: summary.totalClockOut, icon: <FaUserCheck /> },
            { title: "Leave", value: summary.totalLeave, icon: <FaCalendarCheck /> },
            { title: "Rejected Leave", value: rejectedCount, icon: <FaBan /> },
          ].map((card, i) => (
            <div
              key={i}
              className="card text-center shadow border-0 text-white"
              style={{
                background: "linear-gradient(to bottom, #9b6bff, #a593e6)",
                width: "200px",
                borderRadius: "1rem",
              }}
            >
              <div className="card-body">
                <div className="fs-2 mb-2">{card.icon}</div>
                <h6>{card.title}</h6>
                <h3 className="fw-bold">{card.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Pending Leave Requests */}
        <div className="card shadow-lg mb-5 border-0" style={{ borderRadius: "1rem" }}>
          <div className="card-header text-white fw-bold"
               style={{ background: "linear-gradient(to right,#a593e6, #ffb6c1)" }}>
            Pending Leave Requests
          </div>
          <div className="card-body p-0">
            <table className="table table-hover align-middle mb-0 text-center">
              <thead className="table-light">
                <tr>
                  <th>User</th>
                  <th>Reason</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Requested At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaves.length ? (
                  pendingLeaves.map((l) => (
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
                    <td colSpan="6" className="py-3 text-muted">No pending requests</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filter by Role */}
        <div className="mb-3 d-flex align-items-center gap-2">
          <span>Filter by role:</span>
          <select
            className="form-select w-auto"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="card mb-5 shadow-lg" style={{ borderRadius: "1rem" }}>
          <div className="card-header text-white" style={{ background: "linear-gradient(to right,#a593e6, #ffb6c1)" }}>
            All Users
          </div>
          <div className="card-body p-0">
            <table className="table mb-0 align-middle text-center">
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((u) => (
                    <tr key={u.id} style={{ backgroundColor: u.role === "USER" ? "#e0f7fa" : "#d4edda" }}>
                      <td className="d-flex align-items-center justify-content-between">
                        <div style={{ flex: 1, textAlign: "left" }}>
                          {editingUser?.id === u.id ? (
                            <input className="form-control" value={editingUser.username}
                                   onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })} />
                          ) : (
                            u.username
                          )}
                        </div>
                        <div style={{ flex: 1, textAlign: "center", color: u.role === "ADMIN" ? "#00bcd4" : "#28a745" }}>
                          {u.role}
                        </div>
                        <div style={{ flex: 1, textAlign: "right" }}>
                          {editingUser?.id === u.id ? (
                            <button className="btn btn-sm btn-success me-2" onClick={saveEdit} disabled={!editingUser.username.trim()}>Save</button>
                          ) : (
                            <button className="btn btn-sm btn-light me-2" onClick={() => startEdit(u)}>Edit</button>
                          )}
                          <button className="btn btn-sm btn-danger" onClick={() => deleteUser(u.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* User Pagination */}
            <nav aria-label="User pagination" className="my-3">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${userPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setUserPage(userPage - 1)}>Prev</button>
                </li>
                {Array.from({ length: totalUserPages }, (_, i) => (
                  <li key={i} className={`page-item ${userPage === i + 1 ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setUserPage(i + 1)}>{i + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${userPage === totalUserPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setUserPage(userPage + 1)}>Next</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="card mb-5 shadow-lg" style={{ borderRadius: "1rem" }}>
          <div className="card-header text-white" style={{ background: "linear-gradient(to right,#a593e6, #ffb6c1)" }}>
            Attendance Records
          </div>
          <div className="card-body p-0">
            <table className="table mb-0 text-center">
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
                {currentAttendance.length > 0 ? (
                  currentAttendance.map((a) => (
                    <tr key={a.id} style={{ backgroundColor: a.status.toLowerCase() === "late" ? "#ffe5e5" : "#e9f7ef" }}>
                      <td>{a.username}</td>
                      <td>{formatDate(a.date)}</td>
                      <td>{formatDateTime(a.clockIn)}</td>
                      <td>{formatDateTime(a.clockOut)}</td>
                      <td>{getStatusBadge(a.status)}</td>
                      <td>{a.method}</td>
                      <td>{a.location}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-3 text-muted">No attendance records</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Attendance Pagination */}
            <nav aria-label="Attendance pagination" className="my-3">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${attendancePage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setAttendancePage(attendancePage - 1)}>Prev</button>
                </li>
                {Array.from({ length: totalAttendancePages }, (_, i) => (
                  <li key={i} className={`page-item ${attendancePage === i + 1 ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setAttendancePage(i + 1)}>{i + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${attendancePage === totalAttendancePages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setAttendancePage(attendancePage + 1)}>Next</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
