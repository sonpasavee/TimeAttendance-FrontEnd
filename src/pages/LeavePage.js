import React, { useState, useEffect } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Leave() {
  const [leaves, setLeaves] = useState([]);
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchLeaves = async () => {
    try {
      const res = await API.get("/leave/my");
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const requestLeave = async () => {
    if (!reason || !startDate || !endDate) {
      alert("Please enter reason and select start/end dates");
      return;
    }

    try {
      await API.post("/leave/request", { reason, startDate, endDate });
      setReason("");
      setStartDate("");
      setEndDate("");
      fetchLeaves();
      alert("Leave requested successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to request leave");
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
    <div>
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">Leave Requests</h2>

        <div className="card mb-4" style={{ maxWidth: "500px" }}>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Reason for Leave</label>
              <input
                type="text"
                className="form-control"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button className="btn btn-primary w-100" onClick={requestLeave}>
              Request Leave
            </button>
          </div>
        </div>

        <h4>My Leave History</h4>
        <table className="table table-bordered table-striped">
          <thead className="table-light">
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
                <td colSpan="5" className="text-center">
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
                  <td>{l.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
