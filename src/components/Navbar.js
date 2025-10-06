import React from "react";
import { useNavigate } from "react-router-dom";
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
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <span className="navbar-brand">
          Time Attendance {role === "ADMIN" ? "(Admin)" : ""}
        </span>
        <div className="d-flex">
          <button className="btn btn-outline-light" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
