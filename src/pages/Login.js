import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api"; // axios instance ของคุณ
import "bootstrap/dist/css/bootstrap.min.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/login", { email, password });
      if (res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);

        if (res.data.role === "ADMIN") navigate("/admin/dashboard");
        else navigate("/user/dashboard");
      }
    } catch (err) {
      alert("Invalid email or password!");
    }
  };

  return (
    <section
      className="vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(to bottom, #a593e6ff, #ffb6c1)",
      }}
    >
      <div
        className="card shadow-lg border-0"
        style={{
          borderRadius: "1rem",
          overflow: "hidden",
          width: "800px",
          height: "500px",
          boxShadow: "0 10px 30px rgba(106, 17, 203, 0.3)",
        }}
      >
        <div className="row g-0 h-100">
          {/* ฝั่งซ้าย: รูปภาพ + โลโก้ */}
          <div className="col-md-6 d-none d-md-block position-relative">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
              alt="login"
              className="img-fluid h-100"
              style={{
                borderTopLeftRadius: "1rem",
                borderBottomLeftRadius: "1rem",
                objectFit: "cover",
              }}
            />

            {/* โลโก้ด้านบน */}
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
          <div className="col-md-6 d-flex align-items-center">
            <div className="card-body p-4 text-black w-100">
              <h1 className="mb-4 fw-bold text-center">Login</h1>

              <form
                onSubmit={handleSubmit}
                className="d-flex flex-column justify-content-center"
              >
                <div className="form-outline mb-3">
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-outline mb-4">
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-lg w-100 mb-3 text-white"
                  style={{
                    background: "linear-gradient(90deg, #6a11cb, #ff6fd8)",
                    border: "none",
                    transition: "0.3s",
                  }}
                  onMouseOver={(e) => (e.target.style.opacity = 0.9)}
                  onMouseOut={(e) => (e.target.style.opacity = 1)}
                >
                  Login
                </button>

                <div className="text-center text-muted">
                  Don't have an account?{" "}
                  <a
                    href="/register"
                    className="text-decoration-none fw-bold"
                    style={{ color: "#6a11cb" }}
                  >
                    Sign Up
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
