import React, { useState } from "react";
import Mint from "./Mint";

const menu = [
  { key: "users", label: "Quản lý User", icon: "👤" },
  { key: "nfts", label: "Quản lý NFT", icon: "🖼️" },
  { key: "stats", label: "Thống kê", icon: "📊" },
  { key: "mint", label: "Mint NFT", icon: "🪙" },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div style={{ display: "flex", minHeight: 500 }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          background: "linear-gradient(135deg, #232946 60%, #6c47ff 100%)",
          color: "#fff",
          borderRadius: 16,
          marginRight: 32,
          padding: "32px 0 32px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "0 4px 24px 0 rgba(44, 62, 80, 0.10)",
        }}
      >
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 8px auto",
              fontSize: 32,
              boxShadow: "0 2px 8px 0 rgba(108,71,255,0.10)",
            }}
          >
            🛡️
          </div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Admin</div>
          <div style={{ fontSize: 13, color: "#bdbdbd" }}>Quản trị viên</div>
        </div>
        <nav style={{ width: "100%" }}>
          {menu.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              style={{
                width: "100%",
                background: activeTab === item.key ? "#fff" : "transparent",
                color: activeTab === item.key ? "#6c47ff" : "#fff",
                border: "none",
                borderRadius: 8,
                padding: "12px 0 12px 32px",
                fontWeight: 600,
                fontSize: 16,
                margin: "4px 0",
                textAlign: "left",
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
      </aside>
      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 4px 24px 0 rgba(44, 62, 80, 0.10)",
            padding: 32,
            minHeight: 400,
          }}
        >
          {activeTab === "users" && (
            <div>
              <h2
                style={{
                  color: "#6c47ff",
                  fontWeight: 800,
                  marginBottom: 16,
                  fontSize: 24,
                }}
              >
                👤 Quản lý User
              </h2>
              <p style={{ color: "#232946" }}>
                Hiển thị danh sách user ở đây (đang phát triển).
              </p>
            </div>
          )}
          {activeTab === "nfts" && (
            <div>
              <h2
                style={{
                  color: "#6c47ff",
                  fontWeight: 800,
                  marginBottom: 16,
                  fontSize: 24,
                }}
              >
                🖼️ Quản lý NFT
              </h2>
              <p style={{ color: "#232946" }}>
                Hiển thị danh sách NFT ở đây (đang phát triển).
              </p>
            </div>
          )}
          {activeTab === "stats" && (
            <div>
              <h2
                style={{
                  color: "#6c47ff",
                  fontWeight: 800,
                  marginBottom: 16,
                  fontSize: 24,
                }}
              >
                📊 Thống kê
              </h2>
              <p style={{ color: "#232946" }}>
                Hiển thị thống kê tổng quan ở đây (đang phát triển).
              </p>
            </div>
          )}
          {activeTab === "mint" && (
            <div>
              <h2
                style={{
                  color: "#6c47ff",
                  fontWeight: 800,
                  marginBottom: 16,
                  fontSize: 24,
                }}
              >
                🪙 Mint NFT
              </h2>
              <Mint />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
