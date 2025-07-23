import React, { useState, useEffect } from "react";
import Mint from "./Mint";

const menu = [
  { key: "users", label: "Quản lý User", icon: "👤" },
  { key: "nfts", label: "Quản lý NFT", icon: "🖼️" },
  { key: "stats", label: "Thống kê", icon: "📊" },
  { key: "mint", label: "Mint NFT", icon: "🪙" },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<any[]>([]);
  const [nfts, setNfts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch users
  useEffect(() => {
    if (activeTab === "users") {
      setLoading(true);
      fetch("/api/inventory/users")
        .then((res) => res.json())
        .then((data) => setUsers(data))
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  // Fetch NFTs
  useEffect(() => {
    if (activeTab === "nfts") {
      setLoading(true);
      fetch("/api/inventory/nfts_cache")
        .then((res) => res.json())
        .then((data) => setNfts(data))
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  // Fetch Stats
  useEffect(() => {
    if (activeTab === "stats") {
      setLoading(true);
      fetch("/api/inventory/stats")
        .then((res) => res.json())
        .then((data) => setStats(data))
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

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
              {loading ? (
                <p>Đang tải dữ liệu...</p>
              ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 15,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f3f3f3" }}>
                      <th
                        style={{
                          padding: 10,
                          border: "1px solid #eee",
                          textAlign: "left",
                        }}
                      >
                        Address
                      </th>
                      <th
                        style={{
                          padding: 10,
                          border: "1px solid #eee",
                          textAlign: "center",
                        }}
                      >
                        Keys
                      </th>
                      <th
                        style={{
                          padding: 10,
                          border: "1px solid #eee",
                          textAlign: "center",
                        }}
                      >
                        Pity Current
                      </th>
                      <th
                        style={{
                          padding: 10,
                          border: "1px solid #eee",
                          textAlign: "center",
                        }}
                      >
                        Epic
                      </th>
                      <th
                        style={{
                          padding: 10,
                          border: "1px solid #eee",
                          textAlign: "center",
                        }}
                      >
                        Legendary
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u: any) => (
                      <tr key={u.address}>
                        <td
                          style={{
                            padding: 10,
                            border: "1px solid #eee",
                            fontFamily: "monospace",
                            maxWidth: 220,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {u.address.slice(0, 10) + "..." + u.address.slice(-8)}
                        </td>
                        <td
                          style={{
                            padding: 10,
                            border: "1px solid #eee",
                            textAlign: "center",
                          }}
                        >
                          {u.currentkeys}
                        </td>
                        <td
                          style={{
                            padding: 10,
                            border: "1px solid #eee",
                            textAlign: "center",
                          }}
                        >
                          {u.pity_current}
                        </td>
                        <td
                          style={{
                            padding: 10,
                            border: "1px solid #eee",
                            textAlign: "center",
                          }}
                        >
                          {u.pity_guaranteedEpic}
                        </td>
                        <td
                          style={{
                            padding: 10,
                            border: "1px solid #eee",
                            textAlign: "center",
                          }}
                        >
                          {u.pity_guaranteedLegendary}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
              {loading ? (
                <p>Đang tải dữ liệu...</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f3f3f3" }}>
                      <th style={{ padding: 8, border: "1px solid #eee" }}>
                        Tên
                      </th>
                      <th style={{ padding: 8, border: "1px solid #eee" }}>
                        Hình ảnh
                      </th>
                      <th style={{ padding: 8, border: "1px solid #eee" }}>
                        Chủ sở hữu
                      </th>
                      <th style={{ padding: 8, border: "1px solid #eee" }}>
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {nfts.map((n: any) => (
                      <tr key={n.txhash}>
                        <td style={{ padding: 8, border: "1px solid #eee" }}>
                          {n.name}
                        </td>
                        <td style={{ padding: 8, border: "1px solid #eee" }}>
                          <img
                            src={`https://gateway.pinata.cloud/ipfs/${n.image}`}
                            alt={n.name}
                            style={{
                              width: 48,
                              height: 48,
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                          />
                        </td>
                        <td style={{ padding: 8, border: "1px solid #eee" }}>
                          {n.ownerAddress}
                        </td>
                        <td style={{ padding: 8, border: "1px solid #eee" }}>
                          {n.status || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
              {loading ? (
                <p>Đang tải dữ liệu...</p>
              ) : stats ? (
                <ul style={{ fontSize: 18, color: "#232946" }}>
                  <li>
                    Tổng số user: <b>{stats.totalUsers}</b>
                  </li>
                  <li>
                    Tổng số NFT: <b>{stats.totalNFTs}</b>
                  </li>
                  <li>
                    Tổng số lượt quay: <b>{stats.totalWishes}</b>
                  </li>
                  {/* Thêm các thống kê khác nếu có */}
                </ul>
              ) : (
                <p>Không có dữ liệu thống kê.</p>
              )}
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
