import React, { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Profile() {
  const [form, setForm] = useState({
    id: null,
    username: "",
    email: "",
    role: "",
    fullName: "",
    phoneNumber: "",
    position: "",
    profileImageUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const defaultAvatar = useMemo(
    () => "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    []
  );

  const todayStr = useMemo(() => {
    try {
      return new Date().toLocaleDateString(undefined, {
        weekday: "short",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }, []);

  const fetchProfile = async () => {
    try {
      // backend คืน User ทั้งก้อน พร้อม user.profile
      const res = await API.get("/user/profile");
      const u = res?.data || {};
      const p = u?.profile || {};
      setForm({
        id: u.id ?? null,
        username: u.username ?? "",
        email: u.email ?? "",
        role: u.role ?? "",
        // ดึงค่าจาก profile ซ้อน
        fullName: p.fullName ?? "",
        phoneNumber: p.phoneNumber ?? "",
        position: p.position ?? "",
        profileImageUrl: p.profileImageUrl ?? "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    setSaving(true);
    try {
      // Controller รับ JSON แบบแบนอยู่แล้ว
      await API.put(
        "/user/profile",
        {
          id: form.id,
          username: form.username,
          email: form.email,
          role: form.role,
          fullName: form.fullName,
          phoneNumber: form.phoneNumber,
          position: form.position,
          profileImageUrl: form.profileImageUrl,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      alert("✅ Profile updated!");
      setEditMode(false);
      // รีเฟรชจากเซิร์ฟเวอร์เพื่อให้ state ตรงกับ DB
      fetchProfile();
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Failed to update profile";
      alert(`❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="d-flex vh-100 justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const firstName = (form.fullName || form.username || "User").split(" ")[0];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#f8fbff 0%, #ffffff 40%)",
      }}
    >
      <Navbar />

      {/* Top welcome bar */}
      <div className="container py-4 pb-4">
        <div className="mx-auto" style={{ maxWidth: 950 }}>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h5 className="mb-0 fw-semibold">Welcome, {firstName}</h5>
              <small className="text-muted">{todayStr}</small>
            </div>
          </div>
        </div>
      </div>

      {/* Main card */}
      <div className="container pb-5">
        <div
          className="card border-0 shadow-sm mx-auto"
          style={{ maxWidth: 950, borderRadius: 20 }}
        >
          <div
            style={{
              height: 72,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              background:
                "linear-gradient(135deg, rgba(207,226,255,.9), rgba(253,226,255,.9))",
            }}
          />
          <div className="card-body p-4 p-md-5">
            {/* Header inside card */}
            <div className="d-flex align-items-center justify-content-between flex-wrap mb-4">
              <div className="d-flex align-items-center">
                <img
                  src={form.profileImageUrl || defaultAvatar}
                  alt="avatar"
                  onError={(e) => {
                    e.currentTarget.src = defaultAvatar;
                  }}
                  className="me-3"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    objectFit: "cover",
                    boxShadow: "0 4px 14px rgba(0,0,0,.08)",
                  }}
                />
                <div>
                  <div className="fw-semibold">
                    {form.fullName || form.username || "User"}
                  </div>
                  <small className="text-muted">{form.email}</small>
                </div>
              </div>

              {!editMode ? (
                <button
                  className="btn btn-outline-primary rounded-pill px-4"
                  onClick={() => setEditMode(true)}
                >
                  Edit
                </button>
              ) : (
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-secondary rounded-pill px-4"
                    onClick={() => {
                      setEditMode(false);
                      fetchProfile();
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary rounded-pill px-4"
                    onClick={updateProfile}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>

            {/* Two-column form */}
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-muted small">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Your full name"
                  value={form.fullName}
                  onChange={(e) => onChange("fullName", e.target.value)}
                  disabled={!editMode}
                  style={{
                    backgroundColor: !editMode ? "#f8f9fa" : undefined,
                  }}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted small">Username</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Your username"
                  value={form.username}
                  onChange={(e) => onChange("username", e.target.value)}
                  disabled={!editMode}
                  style={{
                    backgroundColor: !editMode ? "#f8f9fa" : undefined,
                  }}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted small">Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="08x-xxx-xxxx"
                  value={form.phoneNumber}
                  onChange={(e) => onChange("phoneNumber", e.target.value)}
                  disabled={!editMode}
                  style={{
                    backgroundColor: !editMode ? "#f8f9fa" : undefined,
                  }}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted small">Position</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Your Position"
                  value={form.position}
                  onChange={(e) => onChange("position", e.target.value)}
                  disabled={!editMode}
                  style={{
                    backgroundColor: !editMode ? "#f8f9fa" : undefined,
                  }}
                />
              </div>
            </div>

            {/* My email address block */}
            <div className="mt-4">
              <div className="fw-semibold mb-2">My email address</div>
              <div className="d-flex align-items-center p-3 border rounded-3 bg-light">
                <div className="me-auto">
                  <div>{form.email}</div>
                </div>
              </div>
            </div>

            {/* (ทางเลือก) อัปโหลดรูปโปรไฟล์ในอนาคต */}
            {/* <div className="mt-3">
              <input type="file" accept="image/*" disabled={!editMode} />
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
