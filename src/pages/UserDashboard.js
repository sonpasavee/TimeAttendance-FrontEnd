import React, { useState, useEffect } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function UserDashboard() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async () => {
    const res = await API.get("/attendance/my");
    setAttendance(res.data);
  };

  // ฟังก์ชัน Clock In → ใช้ Geolocation
  const clockIn = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const location = `${position.coords.latitude},${position.coords.longitude}`;
      const method = "GPS"; // ถ้าใช้ GPS
      try {
        setLoading(true);
        await API.post("/attendance/clockin", { method, location });
        fetchAttendance();
      } catch (err) {
        console.error(err);
        alert("Failed to clock in");
      } finally {
        setLoading(false);
      }
    });
  };

  // Clock Out
  const clockOut = async () => {
    try {
      setLoading(true);
      await API.post("/attendance/clockout");
      fetchAttendance();
    } catch (err) {
      console.error(err);
      alert("Failed to clock out");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // แปลงวันที่ + เวลาให้สวย
  const formatDateTime = (dt) => {
    if (!dt) return "-";
    return new Date(dt).toLocaleString();
  };

  return (
    <div>
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">User Dashboard</h2>

        <div className="mb-4 d-flex gap-2 flex-wrap">
          <button className="btn btn-success" onClick={clockIn} disabled={loading}>
            Clock In
          </button>
          <button className="btn btn-danger" onClick={clockOut} disabled={loading}>
            Clock Out
          </button>
          <Link to="/leave" className="btn btn-primary">Leave Request</Link>
          <Link to="/profile" className="btn btn-secondary">Profile</Link>
        </div>

        <div className="card">
          <div className="card-header bg-primary text-white">Attendance History</div>
          <div className="card-body p-0">
            <table className="table mb-0">
              <thead className="table-light">
                <tr>
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
                      <td>{a.date}</td>
                      <td>{formatDateTime(a.clockIn)}</td>
                      <td>{formatDateTime(a.clockOut)}</td>
                      <td>{a.status}</td>
                      <td>{a.method}</td>
                      <td>{a.location}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">No attendance records</td>
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
