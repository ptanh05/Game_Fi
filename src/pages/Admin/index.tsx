import React, { useState } from "react";
import AdminDashboard from "~/components/AdminDashboard";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

const AdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setError("");
    } else {
      setError("Sai tài khoản hoặc mật khẩu!");
    }
  };

  if (!isLoggedIn) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #232946 60%, #6c47ff 100%)",
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            width: 350,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 8px 32px 0 rgba(44, 62, 80, 0.18)",
            padding: 32,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <h2
            style={{
              textAlign: "center",
              color: "#6c47ff",
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            Đăng nhập Admin
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontWeight: 500, color: "#232946" }}>
              Tài khoản
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                padding: "10px 12px",
                border: "1.5px solid #d1d5db",
                borderRadius: 8,
                outline: "none",
                fontSize: 16,
                background: "#f4f4fb",
                transition: "border 0.2s",
              }}
              autoFocus
              placeholder="Nhập tài khoản..."
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontWeight: 500, color: "#232946" }}>
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: "10px 12px",
                border: "1.5px solid #d1d5db",
                borderRadius: 8,
                outline: "none",
                fontSize: 16,
                background: "#f4f4fb",
                transition: "border 0.2s",
              }}
              placeholder="Nhập mật khẩu..."
            />
          </div>
          {error && (
            <div
              style={{
                color: "#e74c3c",
                background: "#ffeaea",
                borderRadius: 6,
                padding: "8px 12px",
                fontWeight: 500,
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}
          <button
            type="submit"
            style={{
              marginTop: 8,
              padding: "12px 0",
              background: "linear-gradient(90deg, #6c47ff 60%, #232946 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 16,
              boxShadow: "0 2px 8px 0 rgba(108,71,255,0.10)",
              cursor: "pointer",
              transition: "background 0.2s, box-shadow 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#232946")}
            onMouseOut={(e) =>
              (e.currentTarget.style.background =
                "linear-gradient(90deg, #6c47ff 60%, #232946 100%)")
            }
          >
            Đăng nhập
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f4fb",
        padding: 0,
        margin: 0,
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "40px auto",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 8px 32px 0 rgba(44, 62, 80, 0.10)",
          padding: 32,
        }}
      >
        <h1 style={{ color: "#6c47ff", fontWeight: 800, marginBottom: 8 }}>
          Trang Quản Trị Dự Án (Admin)
        </h1>
        <p style={{ color: "#232946", marginBottom: 24 }}>
          Chào mừng bạn đến trang quản lý. Tại đây bạn sẽ quản lý tất cả thông
          tin của dự án.
        </p>
        <AdminDashboard />
      </div>
    </div>
  );
};

export default AdminPage;
