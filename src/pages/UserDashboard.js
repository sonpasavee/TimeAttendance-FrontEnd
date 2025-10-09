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
  const [locationName, setLocationName] = useState("กำลังดึงตำแหน่ง...");
  const [locationCache, setLocationCache] = useState({}); // เก็บชื่อสถานที่ตามพิกัด

  // 🕒 แปลงเวลาให้อยู่ในรูปแบบไทย เช่น "วันที่ 8 ตุลาคม 2568 เวลา 09:40:15 น."
  const formatThaiDateTime = (date) => {
    const optionsDate = { year: "numeric", month: "long", day: "numeric" };
    const optionsTime = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const thaiDate = new Intl.DateTimeFormat("th-TH", optionsDate).format(date);
    const thaiTime = new Intl.DateTimeFormat("th-TH", optionsTime).format(date);
    return `วันที่ ${thaiDate} เวลา ${thaiTime} น.`;
  };

  // 🕕 เวลา Bangkok
  const toBangkokTime = (utcDateStr) => {
    if (!utcDateStr) return null;
    const d = new Date(utcDateStr);
    d.setHours(d.getHours() + 7);
    return d;
  };

  const formatDateTime = (dt) => {
    if (!dt) return "-";
    const th = toBangkokTime(dt);
    return new Intl.DateTimeFormat("th-TH", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(th);
  };

  // 🌍 ดึงชื่อสถานที่จากพิกัด (ใช้ Nominatim API ฟรี)
  const fetchLocationName = async (lat, lon) => {
    const key = `${lat},${lon}`;
    if (locationCache[key]) return locationCache[key]; // ใช้ cache เพื่อลดการเรียกซ้ำ

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=th`,
        { headers: { "User-Agent": "TimeAttendanceApp/1.0" } }
      );
      const data = await res.json();
      const name =
        data.address?.university ||
        data.address?.building ||
        data.address?.neighbourhood ||
        data.address?.road ||
        data.address?.suburb ||
        data.display_name ||
        "ไม่พบชื่อสถานที่";
      setLocationCache((prev) => ({ ...prev, [key]: name }));
      return name;
    } catch {
      return "ไม่สามารถดึงชื่อสถานที่ได้";
    }
  };

  // 📅 ดึงข้อมูลการบันทึกเวลา
  const fetchAttendance = async () => {
    try {
      const res = await API.get("/attendance/my");
      const data = res.data;

      // ดึงชื่อสถานที่จริงจากทุกเรคคอร์ด
      const updated = await Promise.all(
        data.map(async (a) => {
          if (a.location && a.location.includes(",")) {
            const [lat, lon] = a.location.split(",");
            const name = await fetchLocationName(lat.trim(), lon.trim());
            return { ...a, locationName: name };
          }
          return { ...a, locationName: a.location || "-" };
        })
      );

      setAttendance(updated);

      const todayStr = new Date().toISOString().split("T")[0];
      const todayRecord = data.find((a) => a.date === todayStr);
      setHasClockedIn(!!todayRecord?.clockIn);
      setHasClockedOut(!!todayRecord?.clockOut);
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", message: "Failed to fetch attendance ❌" });
    }
  };

  // ⏰ Clock In
  const clockIn = async () => {
    if (!navigator.geolocation) {
      setAlert({ type: "danger", message: "Geolocation is not supported ❌" });
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const location = `${position.coords.latitude},${position.coords.longitude}`;
      const method = "GPS";
      const name = await fetchLocationName(
        position.coords.latitude,
        position.coords.longitude
      );
      setLocationName(name);

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

  // ⏰ Clock Out
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

  // 🔁 เรียกใช้ตอนเริ่มโหลดหน้า
  useEffect(() => {
    fetchAttendance();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // ดึงชื่อสถานที่เมื่อเข้าเว็บ
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          fetchLocationName(pos.coords.latitude, pos.coords.longitude).then(
            (name) => setLocationName(name)
          ),
        () => setLocationName("ไม่อนุญาตให้เข้าถึงตำแหน่ง")
      );
    }

    return () => clearInterval(timer);
  }, []);

  // ⏳ ซ่อน Alert อัตโนมัติ
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // 🏷️ แสดง Badge สถานะ
  const getStatusBadge = (status) => {
    const s = (status || "").replace("_", " ").toLowerCase();
    const baseStyle = "px-2 py-1 rounded-pill fw-semibold";

    switch (s) {
      case "on time":
        return (
          <span className={baseStyle} style={{ backgroundColor: "#28a745", color: "white" }}>
            On Time
          </span>
        );
      case "late":
        return (
          <span className={baseStyle} style={{ backgroundColor: "#dc3545", color: "white" }}>
            Late
          </span>
        );
      case "absent":
        return (
          <span className={baseStyle} style={{ backgroundColor: "#6c757d", color: "white" }}>
            Absent
          </span>
        );
      default:
        return (
          <span className={baseStyle} style={{ backgroundColor: "#ffc107", color: "#212529" }}>
            {status}
          </span>
        );
    }
  };

  // 🧾 ส่วนแสดงผลหน้าเว็บ
  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />

      {localStorage.getItem("role") === "USER" && (
        <div
          className="py-5 text-center text-white mb-4 mx-3 d-flex flex-column align-items-center justify-content-center"
          style={{
            backgroundImage: "url('/banner2.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "1rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            minHeight: "220px",
            marginTop: "40px",
          }}
        >
          <h1 className="fw-bold mb-2">Welcome to Your Attendance Dashboard</h1>
          <p className="fw-semibold">{formatThaiDateTime(currentTime)}</p>
          <p className="fw-semibold">สถานที่: {locationName}</p>

          <div className="d-flex gap-3 mt-3">
            <button
              className="btn rounded-pill px-4 py-2 fw-semibold"
              style={{ backgroundColor: "#9b6bff", color: "white", border: "none" }}
              onClick={clockIn}
              disabled={loading || hasClockedIn}
            >
              Clock In
            </button>
            <button
              className="btn rounded-pill px-4 py-2 fw-semibold"
              style={{ backgroundColor: "white", color: "#6a11cb" }}
              onClick={clockOut}
              disabled={loading || !hasClockedIn || hasClockedOut}
            >
              Clock Out
            </button>
          </div>
        </div>
      )}

      {/* 🔔 Alert */}
      {alert && (
        <div
          className={`alert alert-${alert.type} alert-dismissible fade show mx-3`}
          role="alert"
          style={{ position: "fixed", top: 20, right: 20, zIndex: 1050 }}
        >
          <i
            className={`fas fa-${
              alert.type === "success" ? "check-circle" : "exclamation-triangle"
            } me-2`}
          ></i>
          {alert.message}
        </div>
      )}

      {/* 📋 ตาราง Attendance */}
      <div className="container py-4">
        <div className="card shadow-lg border-0" style={{ borderRadius: "1rem", overflow: "hidden" }}>
          <div
            className="card-header text-white fw-bold"
            style={{ background: "linear-gradient(to right, #a593e6, #ffb6c1)" }}
          >
            <span>Attendance History</span>
          </div>

          <div className="card-body p-0">
            <table className="table table-hover mb-0 text-center align-middle">
              <thead style={{ backgroundColor: "#f8f9fa" }}>
                <tr>
                  <th>วันที่</th>
                  <th>เวลาเข้างาน</th>
                  <th>เวลาออกงาน</th>
                  <th>สถานะ</th>
                  <th>วิธีบันทึก</th>
                  <th>สถานที่</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length > 0 ? (
                  attendance.map((a) => (
                    <tr
                      key={a.id}
                      style={{
                        backgroundColor:
                          a.status?.toLowerCase() === "late" ? "#ffe5e5" : "#e9f7ef",
                      }}
                    >
                      <td>{formatDateTime(a.date)}</td>
                      <td>{formatDateTime(a.clockIn)}</td>
                      <td>{formatDateTime(a.clockOut)}</td>
                      <td>{getStatusBadge(a.status)}</td>
                      <td>{a.method}</td>
                      <td>{a.locationName}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      ไม่มีประวัติการบันทึกเวลา
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
