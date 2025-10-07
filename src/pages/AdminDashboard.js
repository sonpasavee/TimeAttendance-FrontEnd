import React, { useEffect, useState } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";
import { FaUserAlt, FaRegClock, FaUserCheck, FaCalendarCheck, FaBan } from "react-icons/fa";


export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [userFilter, setUserFilter] = useState("ALL"); // ALL, USER, ADMIN
  const normalUsers = users.filter(u => u.role && u.role.toLowerCase() !== "admin");
const totalNormalUsers = normalUsers.length;

const summary = {
  totalClockIn: attendance.filter(a => a.clockIn).length,
  totalClockOut: attendance.filter(a => a.clockOut).length,
  totalLeave: attendance.filter(a => a.status === "Leave").length,
};

const rejectedCount = leaves.filter(l => l.status === "Rejected").length;

  

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
  

  const startEdit = (user) => {
    setEditingUser({ ...user });
  };

  const saveEdit = async () => {
    if (!editingUser || !editingUser.username.trim()) return;
    try {
      await API.put(`/admin/users/${editingUser.id}`, {
        username: editingUser.username,
      });
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

  // กรอง users ตาม role
  const filteredUsers = users.filter((u) => {
    if (userFilter === "ALL") return true;
    return u.role === userFilter;
  });

  return (
    <div>
      <Navbar />
      <div className="container py-5">
     {/* ✅ Summary Cards */}
        <div className="row g-4 mb-5">
          {[
            {
              title: "Total Users",
              value: totalNormalUsers,
              icon: <FaUserAlt />,
              color: "primary",
            },
            {
              title: "Clock In",
              value: summary.totalClockIn,
              icon: <FaRegClock />,
              color: "success",
            },
            {
              title: "Clock Out",
              value: summary.totalClockOut,
              icon: <FaUserCheck />,
              color: "info",
            },
            {
              title: "Leave",
              value: summary.totalLeave,
              icon: <FaCalendarCheck />,
              color: "secondary",
            },
            {
              title: "Rejected Leave",
              value: rejectedCount,
              icon: <FaBan />,
              color: "danger",
            },
          ].map((card, i) => (
            <div key={i} className="col-md-4 col-lg-2 col-6">
              <div
                className={`card text-center shadow border-0 bg-${card.color} bg-opacity-10`}
              >
                <div className="card-body">
                  <div
                    className={`text-${card.color} fs-2 mb-2`}
                    style={{ lineHeight: "1" }}
                  >
                    {card.icon}
                  </div>
                  <h6 className="fw-semibold">{card.title}</h6>
                  <h3 className="fw-bold">{card.value}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter for Users */}
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

        {/* All Users */}
        <div className="card mb-5">
          <div
            className="card-header text-white"
            style={{ background: "linear-gradient(to right, #a593e6, #ffb6c1)" }}
          >
            All Users
          </div>
          <div className="card-body p-0">
            <table className="table mb-0 align-middle">
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      style={{
                        backgroundColor: u.role === "USER" ? "#ffe6f0" : "#e6e0ff",
                      }}
                    >
                      <td className="d-flex align-items-center">
                        {/* Username ชิดซ้าย */}
                        <div style={{ flex: 1, textAlign: "left" }}>
                          {editingUser?.id === u.id ? (
                            <input
                              className="form-control"
                              value={editingUser.username}
                              onChange={(e) =>
                                setEditingUser({
                                  ...editingUser,
                                  username: e.target.value,
                                })
                              }
                            />
                          ) : (
                            u.username
                          )}
                        </div>

                        {/* Role อยู่ตรงกลาง */}
                        <div
                          style={{
                            flex: 1,
                            textAlign: "center",
                            color: u.role === "ADMIN" ? "#1E90FF" : "#28a745",
                          }}
                        >
                          {u.role}
                        </div>

                        {/* ปุ่ม Edit/Delete ชิดขวา */}
                        <div style={{ flex: 1, textAlign: "right" }}>
                          {editingUser?.id === u.id ? (
                            <button
                              className="btn btn-sm btn-success me-2"
                              onClick={saveEdit}
                              disabled={!editingUser.username.trim()}
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-light me-2"
                              onClick={() => startEdit(u)}
                            >
                              Edit
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => deleteUser(u.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="1" className="text-center">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Attendance Records */}
        <div className="card">
          <div
            className="card-header bg-info text-white"
            style={{ background: "linear-gradient(to right, #a593e6, #ffb6c1)" }}
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
                      <td>{a.status}</td>
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
