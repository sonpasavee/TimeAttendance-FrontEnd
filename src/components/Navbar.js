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
      style={{ background: "linear-gradient(to right, #6a11cb, #a593e6)" }}
    >
      <div className="container">
        <span className="navbar-brand fw-semibold">
          ATTENDA {role === "ADMIN" ? "(Admin)" : ""}
        </span>

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
