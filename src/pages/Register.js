import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api"; // axios instance ของคุณ
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER"); // default role
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/register", { username, email, password, role });
      if (res.data) {
        alert("Register successful! Please login.");
        navigate("/login");
      }
    } catch (err) {
      alert("Failed to register: " + err.response?.data?.error || err.message);
    }
  };

return (
  <section
    className="d-flex justify-content-center align-items-center"
    style={{
      height: "100vh",
      background: "linear-gradient(to bottom, #a593e6ff, #ffb6c1)",
    }}
  >
    <div
      className="card shadow-lg border-0 d-flex flex-row"
      style={{
        borderRadius: "1rem",
        overflow: "hidden",
        width: "800px",
        maxWidth: "95%",
        height: "500px",
        boxShadow: "0 10px 30px rgba(106, 17, 203, 0.3)",
      }}
    >
      {/* ฝั่งซ้าย: รูป + โลโก้ */}
      <div className="d-none d-md-block position-relative" style={{ flex: 1 }}>
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
          alt="login"
          className="h-100 w-100"
          style={{ objectFit: "cover" }}
        />
        <img
          src="/logo Attenda.png"
          alt="Logo"
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            width: "75px",
            height: "auto",
            padding: "5px",
          }}
        />
      </div>

      {/* ฝั่งขวา: ฟอร์ม */}
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ flex: 1, padding: "2rem" }}
      >
        <div style={{ width: "100%", maxWidth: "350px" }}>
          <h1 className="mb-4 fw-bold text-center">Sign Up</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              className="form-control form-control-lg mb-3"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="email"
              className="form-control form-control-lg mb-3"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="form-control form-control-lg mb-3"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <select
              className="form-select form-select-lg mb-4"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button
              type="submit"
              className="btn btn-lg w-100 mb-3 text-white"
              style={{
                background: "linear-gradient(90deg, #6a11cb, #ff6fd8)",
                border: "none",
              }}
            >
              Register
            </button>
            <div className="text-center text-muted">
              Already have an account?{" "}
              <a href="/login" className="text-decoration-none fw-bold" style={{ color: "#6a11cb" }}>
                Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
);
}
