import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  const role = localStorage.getItem("role");

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark"
      style={{
        background: "linear-gradient(to right, #a593e6, #6a11cb)",
        padding: "0.5rem 1rem",
      }}
    >
      <div className="container-fluid">
        <Link
          to={role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard"}
          className="navbar-brand fw-semibold d-flex align-items-center text-white text-decoration-none gap-2"
        >
          <img
            src="/logo Attenda2.png"
            alt="Logo"
            width="30"
            height="30"
            className="d-inline-block align-text-top rounded-circle shadow-sm"
          />
          ATTENDA {role === "ADMIN" ? "(Admin)" : ""}
        </Link>

        <div className="collapse navbar-collapse justify-content-end">
          <ul className="navbar-nav align-items-center gap-2">
            {/* Leave Request - เฉพาะ USER */}
            {role === "USER" && (
              <li className="nav-item">
                <Link to="/leave" className="nav-link text-white">
                  Leave Request
                </Link>
              </li>
            )}

            {/* Profile - แสดงทุก role */}
            <li className="nav-item">
              <Link to="/profile" className="nav-link text-white">
                Profile
              </Link>
            </li>

            {/* Logout */}
            <li className="nav-item">
              <button
                className="btn btn-light btn-sm px-3 fw-semibold"
                onClick={logout}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
