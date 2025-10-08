import React, { useState, useEffect } from "react";    
import API from "../api/api";
import Navbar from "../components/Navbar";

export default function UserDashboard() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hasClockedIn, setHasClockedIn] = useState(false);
  const [hasClockedOut, setHasClockedOut] = useState(false);
  const [alert, setAlert] = useState(null);

  const toBangkokTime = (utcDateStr) => {
    if (!utcDateStr) return null;
    const d = new Date(utcDateStr);
    d.setHours(d.getHours() + 7); 
    return d;
  };

  const formatDate = (dt) => {
    if (!dt) return "-";
    const th = toBangkokTime(dt);
    return th.toISOString().split("T")[0];
  };

  const formatDateTime = (dt) => {
    if (!dt) return "-";
    const th = toBangkokTime(dt);
    return th.toLocaleString("th-TH", { hour12: false });
  };

  const formatCurrentTime = (dt) => {
    return new Date(dt).toLocaleTimeString("th-TH", { hour12: false });
  };

  const fetchAttendance = async () => {
    try {
      const res = await API.get("/attendance/my");
      setAttendance(res.data);

      const todayStr = new Date().toISOString().split("T")[0];
      const todayRecord = res.data.find((a) => a.date === todayStr);
      setHasClockedIn(!!todayRecord?.clockIn);
      setHasClockedOut(!!todayRecord?.clockOut);
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", message: "Failed to fetch attendance ❌" });
    }
  };

  const clockIn = async () => {
    if (!navigator.geolocation) {
      setAlert({ type: "danger", message: "Geolocation is not supported ❌" });
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const location = `${position.coords.latitude},${position.coords.longitude}`;
      const method = "GPS";

      try {
        setLoading(true);
        const now = new Date();
        await API.post("/attendance/clockin", {
          method,
          location,
          clockIn: now.toISOString(),
        });
        await fetchAttendance();
        setAlert({ type: "success", message: "Clock In สำเร็จ ✅" });
      } catch (err) {
        console.error(err);
        setAlert({ type: "danger", message: "Clock In ล้มเหลว ❌" });
      } finally {
        setLoading(false);
      }
    });
  };

  const clockOut = async () => {
    try {
      setLoading(true);
      const now = new Date();
      await API.post("/attendance/clockout", { clockOut: now.toISOString() });
      await fetchAttendance();
      setAlert({ type: "success", message: "Clock Out สำเร็จ ✅" });
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", message: "Clock Out ล้มเหลว ❌" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const getStatusBadge = (status) => {
    const s = (status || "").replace("_", " ").toLowerCase();
    const baseStyle = "px-2 py-1 rounded-pill fw-semibold";

    switch (s) {
      case "on time":
        return <span className={baseStyle} style={{ backgroundColor: "#28a745", color: "white" }}>On Time</span>;
      case "late":
        return <span className={baseStyle} style={{ backgroundColor: "#dc3545", color: "white" }}>Late</span>;
      case "absent":
        return <span className={baseStyle} style={{ backgroundColor: "#6c757d", color: "white" }}>Absent</span>;
      default:
        return <span className={baseStyle} style={{ backgroundColor: "#ffc107", color: "#212529" }}>{status}</span>;
    }
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />

      {localStorage.getItem("role") === "USER" && (
        <div className="py-5 text-center text-white mb-4 mx-3 d-flex flex-column align-items-center justify-content-center"
          style={{
            backgroundImage: "url('/banner2.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "1rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            minHeight: "180px",
            marginTop: "40px",
          }}
        >
          <h1 className="fw-bold">Welcome to Your Attendance Dashboard</h1>
          <p className="lead">Check your attendance and manage your work time</p>
          <h2>{formatCurrentTime(currentTime)}</h2>

          <div className="d-flex gap-3 mt-3">
            <button className="btn rounded-pill px-4 py-2 fw-semibold"
              style={{ backgroundColor: "#9b6bff", color: "white", border: "none" }}
              onClick={clockIn} disabled={loading || hasClockedIn}>
              Clock In
            </button>
            <button className="btn rounded-pill px-4 py-2 fw-semibold"
              style={{ backgroundColor: "white", color: "#6a11cb" }}
              onClick={clockOut} disabled={loading || !hasClockedIn || hasClockedOut}>
              Clock Out
            </button>
          </div>
        </div>
      )}

      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show mx-3`}
          role="alert"
          style={{ position: "fixed", top: 20, right: 20, zIndex: 1050 }}>
          <i className={`fas fa-${alert.type === "success" ? "check-circle" : "exclamation-triangle"} me-2`}></i>
          {alert.message}
        </div>
      )}

      <div className="container py-4">
        <div className="card shadow-lg border-0" style={{ borderRadius: "1rem", overflow: "hidden" }}>
          <div className="card-header text-white fw-bold"
               style={{ background: "linear-gradient(to right, #a593e6, #ffb6c1)" }}>
            <span>Attendance History</span>
          </div>

          <div className="card-body p-0">
            <table className="table table-hover mb-0 text-center align-middle">
              <thead style={{ backgroundColor: "#f8f9fa" }}>
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
                    <tr key={a.id} style={{ backgroundColor: a.status?.toLowerCase() === "late" ? "#ffe5e5" : "#e9f7ef" }}>
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
                    <td colSpan="6" className="text-center py-4 text-muted">No attendance records</td>
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
