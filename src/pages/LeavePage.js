import React, { useState, useEffect } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Leave() {
  const [leaves, setLeaves] = useState([]);
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [alert, setAlert] = useState(null);
  const [showForm, setShowForm] = useState(false); 

  const fetchLeaves = async () => {
    try {
      const res = await API.get("/leave/my");
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", message: "Failed to fetch leave data" });
    }
  };

  const requestLeave = async () => {
    if (!reason || !startDate || !endDate) {
      setAlert({ type: "danger", message: "Please fill in all fields" });
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setAlert({ type: "danger", message: "End date must be after start date" });
      return;
    }

    try {
      await API.post("/leave/request", { reason, startDate, endDate });
      setReason("");
      setStartDate("");
      setEndDate("");
      fetchLeaves();
      setShowForm(false);
      setAlert({
        type: "success",
        message: "Leave request submitted successfully! Pending approval.",
      });
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", message: "Failed to submit leave request" });
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-GB");
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Navbar />

      <div className="container animate-in mt-4 mb-5 p-4 bg-white rounded-4 shadow-lg">
        {/* หัวข้อ */}
        <h2
          className="page-title fw-bold mb-3" 
          style={{
            background: "linear-gradient(45deg, #667eea, #764ba2)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          <i className="fas fa-calendar-alt me-2"></i>
          {showForm ? "New Leave Request" : "My Leave Requests"}
        </h2>

        {/* ปุ่ม + Leave Request */}
        {!showForm && (
          <div className="mb-4">
            <button
              className="btn rounded-pill px-3 py-2"
              style={{
                background: "linear-gradient(135deg, #d8b4ff, #fbcfe8)",
                color: "#4b0082",
                fontSize: "0.9rem",
                fontWeight: "600",
                border: "none",
              }}
              onClick={() => setShowForm(true)}
            >
              <i className="fas fa-plus me-2"></i> + Create Leave Request
            </button>
          </div>
        )}

        {alert && (
          <div
            className={`alert alert-${alert.type} alert-dismissible fade show`}
            role="alert"
          >
            <i
              className={`fas fa-${alert.type === "success" ? "check-circle" : "exclamation-triangle"} me-2`}
            ></i>
            {alert.message}
            <button
              type="button"
              className="btn-close"
              onClick={() => setAlert(null)}
            ></button>
          </div>
        )}

        {showForm ? (
          <div
            className="p-4 rounded-4 shadow-sm"
            style={{ background: "linear-gradient(135deg, #f8f9ff, #e8f2ff)" }}
          >
            <div className="row">
              <div className="col-12 mb-3">
                <label className="form-label fw-semibold">
                  <i className="fas fa-comment-alt me-2"></i>
                  Reason for Leave
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter your reason for leave..."
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  <i className="fas fa-calendar-day me-2"></i>
                  Start Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  <i className="fas fa-calendar-day me-2"></i>
                  End Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                className="btn btn-secondary px-4"
                onClick={() => setShowForm(false)}
              >
                <i className="fas fa-times me-2"></i> Cancel
              </button>

              <button
                className="btn px-4"
                style={{
                  background: "linear-gradient(135deg, #a855f7, #f43f5e)",
                  color: "#fff",
                  fontWeight: "600",
                  border: "none",
                }}
                onClick={requestLeave}
              >
                <i className="fas fa-check me-2"></i> Submit
              </button>

            </div>
          </div>
        ) : (

          <div className="history-section bg-white rounded-4 p-4 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover rounded-3 shadow-sm">
                <thead>
                  <tr>
                    <th>Date Requested</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        <i className="fas fa-inbox fa-2x mb-3 d-block"></i>
                        No leave requests found
                      </td>
                    </tr>
                  ) : (
                    leaves.map((l) => (
                      <tr key={l.id}>
                        <td>{formatDate(l.createdAt)}</td>
                        <td>{formatDate(l.startDate)}</td>
                        <td>{formatDate(l.endDate)}</td>
                        <td>{l.reason}</td>
                        <td>
                          {l.status.toLowerCase() === "approved" && (
                            <span className="badge bg-success">{l.status}</span>
                          )}
                          {l.status.toLowerCase() === "rejected" && (
                            <span className="badge bg-danger">{l.status}</span>
                          )}
                          {l.status.toLowerCase() === "pending" && (
                            <span className="badge bg-warning text-dark">{l.status}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
