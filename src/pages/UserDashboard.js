import React, { useState, useEffect } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";

export default function UserDashboard() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchAttendance = async () => {
    const res = await API.get("/attendance/my");
    setAttendance(res.data);
  };

  const clockIn = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const location = `${position.coords.latitude},${position.coords.longitude}`;
      const method = "GPS";
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

    // อัปเดตเวลาปัจจุบันทุกวินาที
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (dt) => {
    if (!dt) return "-";
    return new Date(dt).toLocaleString();
  };

  const formatCurrentTime = (dt) => {
    return dt.toLocaleTimeString(); 
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />

    {/* แบนเนอร์ */}
{localStorage.getItem("role") === "USER" && (
  <div
    className="py-5 text-center text-white mb-4 mx-3 d-flex flex-column align-items-center justify-content-center"
    style={{
      backgroundImage: "url('/banner2.png')", 
      backgroundSize: "cover",       
      backgroundPosition: "center", 
      borderRadius: "1rem",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      minHeight: "180px",
      marginTop: "40px"
    }}
  >
    <h1 className="fw-bold">Welcome to Your Attendance Dashboard</h1>
    <p className="lead">Check your attendance and manage your work time </p>
    <h2>{formatCurrentTime(currentTime)}</h2>

    {/* Clock In / Clock Out Buttons */}
    <div className="d-flex gap-3 mt-3">
      <button
        className="btn rounded-pill px-4 py-2 fw-semibold"
        style={{ backgroundColor: "#9b6bff", color: "white", border: "none" }}
        onClick={clockIn}
        disabled={loading}
      >
        Clock In
      </button>
      <button
        className="btn rounded-pill px-4 py-2 fw-semibold"
        style={{    backgroundColor: "white",  
                  color: "#6a11cb",  }}
        onClick={clockOut}
        disabled={loading}
      >
        Clock Out
      </button>
    </div>
  </div>
)}



      <div className="container py-4">
        {/* ตารางข้อมูล */}
        <div className="card shadow-sm border-0" style={{ borderRadius: "1rem" }}>
          <div
            className="card-header d-flex justify-content-between align-items-center text-white fw-semibold"
            style={{
              background: "linear-gradient(to right, #a593e6, #ffb6c1)",
              borderTopLeftRadius: "1rem",
              borderTopRightRadius: "1rem",
            }}
          >
            <span>Attendance History</span>

          
          </div>

          <div className="card-body p-0">
            <table className="table table-hover mb-0 text-center align-middle">
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
                    <td colSpan="6" className="text-center py-4 text-muted">
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
