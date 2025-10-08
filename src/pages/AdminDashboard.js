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


  const normalUsers = users.filter((u) => u.role && u.role.toLowerCase() !== "admin");
  const totalNormalUsers = normalUsers.length;

  const summary = {
    totalClockIn: attendance.filter((a) => a.clockIn).length,
    totalClockOut: attendance.filter((a) => a.clockOut).length,
    totalLeave: attendance.filter((a) => a.status === "Leave").length,
  };

  const rejectedCount = leaves.filter((l) => l.status === "Rejected").length;

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
      const res = await API.get("/admin/leave/pending");
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
      await API.put(`/admin/leave/${id}/approve`);
      fetchLeaves();
    } catch (err) {
      console.error(err);
      alert("Failed to approve leave");
    }
  };

  const reject = async (id) => {
    try {
      await API.put(`/admin/leave/${id}/reject`);
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
      await API.put(`/admin/users/${editingUser.id}`, { username: editingUser.username });
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
      await API.delete(`/admin/users/${id}`);
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

  const filteredUsers = users.filter((u) => (userFilter === "ALL" ? true : u.role === userFilter));

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
              style={{ background: "linear-gradient(to bottom, #9b6bff, #a593e6)", width: "200px", borderRadius: "1rem" }}
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
        <div className="card shadow-lg mb-5 border-0">
          <div className="card-header text-white fw-bold" style={{ background: "linear-gradient(to right,#a593e6, #ffb6c1)" }}>
            Pending Leave Requests
          </div>
          <div className="card-body p-0">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-center">
                <tr>
                  <th>User</th>
                  <th>Reason</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Requested At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {leaves.length ? (
                  leaves.map((l) => (
                    <tr key={l.id}>
                      <td>{l.username}</td>
                      <td>{l.reason}</td>
                      <td>{formatDate(l.startDate)}</td>
                      <td>{formatDate(l.endDate)}</td>
                      <td>{formatDateTime(l.createdAt)}</td>
                      <td>
                        <button className="btn btn-success btn-sm me-2" onClick={() => approve(l.id)}>
                          Approve
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => reject(l.id)}>
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-3 text-muted">
                      No pending requests
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filter by Role */}
        <div className="mb-3 d-flex align-items-center gap-2">
          <span>Filter by role:</span>
          <select className="form-select w-auto" value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
            <option value="ALL">All</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {/* All Users */}
        <div className="card mb-5 shadow-lg">
          <div className="card-header text-white" style={{ background: "linear-gradient(to right,#a593e6, #ffb6c1)" }}>
            All Users
          </div>
          <div className="card-body p-0">
            <table className="table mb-0 align-middle">
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u.id} style={{ backgroundColor: u.role === "USER" ? "#e0f7fa" : "#d4edda" }}>
                      <td className="d-flex align-items-center justify-content-between">
                        <div style={{ flex: 1, textAlign: "left" }}>
                          {editingUser?.id === u.id ? (
                            <input
                              className="form-control"
                              value={editingUser.username}
                              onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                            />
                          ) : (
                            u.username
                          )}
                        </div>
                        <div style={{ flex: 1, textAlign: "center", color: u.role === "ADMIN" ? "#00bcd4" : "#28a745" }}>
                          {u.role}
                        </div>
                        <div style={{ flex: 1, textAlign: "right" }}>
                          {editingUser?.id === u.id ? (
                            <button className="btn btn-sm btn-success me-2" onClick={saveEdit} disabled={!editingUser.username.trim()}>
                              Save
                            </button>
                          ) : (
                            <button className="btn btn-sm btn-light me-2" onClick={() => startEdit(u)}>
                              Edit
                            </button>
                          )}
                          <button className="btn btn-sm btn-danger" onClick={() => deleteUser(u.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="text-center">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="card mb-5 shadow-lg">
          <div
            className="card-header text-white"
            style={{ background: "linear-gradient(to right,#a593e6, #ffb6c1)" }}
          >
            Attendance Records
          </div>
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
                      <td style={{ color: a.status.toLowerCase() === "late" ? "red" : "inherit" }}>
                        {a.status}
                      </td>
                      <td>{a.method}</td>
                      <td>{a.location}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No attendance records
                    </td>
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
