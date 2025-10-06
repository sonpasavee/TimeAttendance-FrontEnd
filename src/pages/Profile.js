import React, { useState, useEffect } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Profile() {
  const [user, setUser] = useState({});

  const fetchProfile = async () => {
    try {
      const res = await API.get("/user/profile");
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateProfile = async () => {
    try {
      await API.put("/user/profile", user);
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container py-5">
        <div className="card mx-auto" style={{ maxWidth: "500px" }}>
          <div className="card-header bg-primary text-white">
            My Profile
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                value={user.username || ""}
                onChange={(e) => setUser({ ...user, username: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={user.email || ""}
                disabled
              />
            </div>

            <button className="btn btn-primary w-100" onClick={updateProfile}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
