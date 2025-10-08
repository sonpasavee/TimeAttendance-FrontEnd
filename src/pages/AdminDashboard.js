import React, { useEffect, useState } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";
import {
  FaUserAlt,
  FaRegClock,
  FaUserCheck,
  FaCalendarCheck,
  FaBan,
} from "react-icons/fa";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [userFilter, setUserFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [userPage, setUserPage] = useState(1);
  const [userPerPage] = useState(5);
  const [attendancePage, setAttendancePage] = useState(1);
  const [attendancePerPage] = useState(5);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [alert, setAlert] = useState(null);

  const [leavePage, setLeavePage] = useState(1);
  const [leavePerPage] = useState(5);
  const totalLeavePages = Math.ceil(leaves.length / leavePerPage);

  const normalUsers = users.filter(
    (u) => u.role && u.role.toLowerCase() !== "admin"
  );
  const totalNormalUsers = normalUsers.length;

  const summary = {
    totalClockIn: attendance.filter((a) => a.clockIn).length,
    totalClockOut: attendance.filter((a) => a.clockOut).length,
    totalLeave: leaves.filter(
      (l) => (l.status || "").toUpperCase() === "APPROVED"
    ).length,
  };
  const rejectedCount = leaves.filter(
    (l) => (l.status || "").toUpperCase() === "REJECTED"
  ).length;

  useEffect(() => {
    fetchUsers();
    fetchLeaves();
    fetchAttendance();
  }, []);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3000);
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      showAlert("danger", "Failed to fetch users ❌");
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await API.get("/admin/leave/all");
      setLeaves(res.data || []);
    } catch (err) {
      console.error(err);
      showAlert("danger", "Failed to fetch leave requests ❌");
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await API.get("/admin/attendance/all");
      setAttendance(res.data || []);
    } catch (err) {
      console.error(err);
      showAlert("danger", "Failed to fetch attendance records ❌");
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
      showAlert("danger", "Failed to approve leave ❌");
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
      showAlert("danger", "Failed to reject leave ❌");
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
      showAlert("success", "User updated successfully ✅");
    } catch (err) {
      console.error(err);
      showAlert("danger", "Failed to update user ❌");
    }
  };

  const confirmDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const deleteUser = async () => {
    if (!userToDelete) return;
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/admin/users/${userToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      showAlert("success", "User deleted successfully ✅");
    } catch (err) {
      console.error(err);
      showAlert("danger", "Failed to delete user ❌");
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return "-";

    const utc7 = new Date(d.getTime() + 7 * 60 * 60 * 1000);
    const day = utc7.getDate().toString().padStart(2, "0");
    const month = (utc7.getMonth() + 1).toString().padStart(2, "0");
    const year = utc7.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) return "-";
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return "-";

    const utc7 = new Date(d.getTime() + 7 * 60 * 60 * 1000);

    const day = utc7.getDate().toString().padStart(2, "0");
    const month = (utc7.getMonth() + 1).toString().padStart(2, "0");
    const year = utc7.getFullYear();
    const hours = utc7.getHours().toString().padStart(2, "0");
    const minutes = utc7.getMinutes().toString().padStart(2, "0");
    const seconds = utc7.getSeconds().toString().padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const filteredUsers = users.filter((u) => {
    // Filter by role
    const roleMatch =
      userFilter === "ALL" ? true : (u.role || "").toUpperCase() === userFilter;

    // Filter by search term
    const searchMatch = searchTerm
      ? (u.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.fullname || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    return roleMatch && searchMatch;
  });

  const pendingLeaves = leaves.filter(
    (l) => (l.status || "").toUpperCase() === "PENDING"
  );

  const indexOfLastUser = userPage * userPerPage;
  const indexOfFirstUser = indexOfLastUser - userPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalUserPages = Math.ceil(filteredUsers.length / userPerPage) || 1;

  const indexOfLastAttendance = attendancePage * attendancePerPage;
  const indexOfFirstAttendance = indexOfLastAttendance - attendancePerPage;
  const currentAttendance = attendance.slice(
    indexOfFirstAttendance,
    indexOfLastAttendance
  );
  const totalAttendancePages =
    Math.ceil(attendance.length / attendancePerPage) || 1;

  const getStatusBadge = (status) => {
    switch ((status || "").toLowerCase()) {
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
        <h2
          className="fw-bold mb-4 text-center"
          style={{
            background: "linear-gradient(to right, #a593e6, #ffb6c1)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          👑 Admin Dashboard
        </h2>

        {/* Search */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-semibold">All Users</h5>
          <input
            type="text"
            className="form-control w-50 shadow-sm border-0"
            style={{ borderRadius: "2rem", padding: "0.5rem 1rem" }}
            placeholder="🔍 Search by name, username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Alert */}
        {alert && (
          <div
            className={`alert alert-${alert.type} alert-dismissible fade show`}
            role="alert"
            style={{ position: "fixed", top: 20, right: 20, zIndex: 1050 }}
          >
            {alert.message}
            <button
              type="button"
              className="btn-close"
              onClick={() => setAlert(null)}
            ></button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="d-flex justify-content-center mb-5 flex-wrap gap-4">
          {[
            {
              title: "Total Users",
              value: totalNormalUsers,
              icon: <FaUserAlt />,
            },
            {
              title: "Clock In",
              value: summary.totalClockIn,
              icon: <FaRegClock />,
            },
            {
              title: "Clock Out",
              value: summary.totalClockOut,
              icon: <FaUserCheck />,
            },
            {
              title: "Leave",
              value: summary.totalLeave,
              icon: <FaCalendarCheck />,
            },
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
        {/* User Table */}
        <div
          className="card border-0 shadow-lg"
          style={{ borderRadius: "1rem", overflow: "hidden" }}
        >
          <div
            className="card-header text-white fw-semibold"
            style={{
              background: "linear-gradient(to right, #a593e6, #ffb6c1)",
            }}
          >
            User Management
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table align-middle text-center mb-0">
                <thead
                  style={{
                    backgroundColor: "#f8f9fa",
                    borderBottom: "2px solid #eee",
                  }}
                >
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map((u) => (
                      <tr
                        key={u.id}
                        style={{
                          backgroundColor:
                            editingUser?.id === u.id ? "#fff3cd" : "white",
                        }}
                      >
                        <td>
                          {editingUser?.id === u.id ? (
                            <input
                              className="form-control form-control-sm"
                              value={editingUser.username}
                              onChange={(e) =>
                                setEditingUser({
                                  ...editingUser,
                                  username: e.target.value,
                                })
                              }
                            />
                          ) : (
                            <strong>{u.username}</strong>
                          )}
                        </td>
                        <td>
                          {u.email || <span className="text-muted">—</span>}
                        </td>
                        <td>
                          <span
                            className={`badge px-3 py-2 rounded-pill ${
                              u.role === "ADMIN" ? "bg-primary" : "bg-success"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td>{formatDateTime(u.createdAt)}</td>
                        <td>
                          {editingUser?.id === u.id ? (
                            <>
                              <button
                                className="btn btn-success btn-sm me-2"
                                onClick={saveEdit}
                              >
                                💾 Save
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setEditingUser(null)}
                              >
                                ✖ Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn btn-outline-primary btn-sm me-2"
                                onClick={() => startEdit(u)}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm me-2"
                                onClick={() => confirmDeleteUser(u)}
                              >
                                🗑 Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-4 text-muted">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* User Pagination */}
        <nav aria-label="User pagination" className="my-3">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${userPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setUserPage(userPage - 1)}
              >
                Prev
              </button>
            </li>
            {Array.from({ length: totalUserPages }, (_, i) => (
              <li
                key={i}
                className={`page-item ${userPage === i + 1 ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setUserPage(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}
            <li
              className={`page-item ${
                userPage === totalUserPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => setUserPage(userPage + 1)}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            role="dialog"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Delete</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowDeleteModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    Are you sure you want to delete{" "}
                    <strong>{userToDelete?.username}</strong>?
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={deleteUser}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Leave Requests */}
        <div
          className="card shadow-lg mb-5 border-0"
          style={{ borderRadius: "1rem", overflow: "hidden" }}
        >
          <div
            className="card-header text-white fw-bold"
            style={{ background: "linear-gradient(to right,#a593e6, #ffb6c1)" }}
          >
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
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => approve(l.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => reject(l.id)}
                        >
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

        {/* Leave History Table */}
        <div
          className="card shadow-lg mb-5 border-0"
          style={{ borderRadius: "1rem", overflow: "hidden" }}
        >
          <div
            className="card-header text-white fw-bold"
            style={{ background: "linear-gradient(to right,#a593e6, #ffb6c1)" }}
          >
            Leave History ( Approved/Rejected )
          </div>
          <div className="card-body p-0">
            <table className="table mb-0 align-middle text-center">
              <thead className="table-light">
                <tr>
                  <th>User</th>
                  <th>Reason</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Requested At</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length > 0 ? (
                  leaves
                    .slice(
                      (leavePage - 1) * leavePerPage,
                      leavePage * leavePerPage
                    )
                    .map((l) => (
                      <tr
                        key={l.id}
                        style={{
                          backgroundColor:
                            l.status === "APPROVED"
                              ? "#e9f7ef"
                              : l.status === "REJECTED"
                              ? "#ffe5e5"
                              : "#fff3cd",
                        }}
                      >
                        <td>{l.username}</td>
                        <td>{l.reason}</td>
                        <td>{formatDate(l.startDate)}</td>
                        <td>{formatDate(l.endDate)}</td>
                        <td>{formatDateTime(l.createdAt)}</td>
                        <td>
                          <span
                            className={`badge ${
                              l.status === "APPROVED"
                                ? "bg-success"
                                : l.status === "REJECTED"
                                ? "bg-danger"
                                : "bg-warning text-dark"
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-3 text-muted">
                      No leave records
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Leave Pagination */}
            <nav aria-label="Leave pagination" className="my-3">
              <ul className="pagination justify-content-center">
                <li
                  className={`page-item ${leavePage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setLeavePage(leavePage - 1)}
                  >
                    Prev
                  </button>
                </li>
                {Array.from({ length: totalLeavePages }, (_, i) => (
                  <li
                    key={i}
                    className={`page-item ${
                      leavePage === i + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setLeavePage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    leavePage === totalLeavePages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setLeavePage(leavePage + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Attendance Table */}
        <div
          className="card shadow-lg mb-5 border-0"
          style={{ borderRadius: "1rem", overflow: "hidden" }}
        >
          <div
            className="card-header text-white fw-bold"
            style={{ background: "linear-gradient(to right,#a593e6, #ffb6c1)" }}
          >
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
                    <tr
                      key={a.id}
                      style={{
                        backgroundColor:
                          a.status.toLowerCase() === "late"
                            ? "#ffe5e5"
                            : "#e9f7ef",
                      }}
                    >
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
                    <td colSpan="7" className="text-center py-3 text-muted">
                      No attendance records
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Attendance Pagination */}
            <nav aria-label="Attendance pagination" className="my-3">
              <ul className="pagination justify-content-center">
                <li
                  className={`page-item ${
                    attendancePage === 1 ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setAttendancePage(attendancePage - 1)}
                  >
                    Prev
                  </button>
                </li>
                {Array.from({ length: totalAttendancePages }, (_, i) => (
                  <li
                    key={i}
                    className={`page-item ${
                      attendancePage === i + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setAttendancePage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    attendancePage === totalAttendancePages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setAttendancePage(attendancePage + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
