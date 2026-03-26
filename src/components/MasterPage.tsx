"use client";

import Link from "next/link";
import { useTrackerCore } from "@/src/hooks/useTrackerCore";

export default function MasterPage() {
  const core = useTrackerCore();

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#f5f7fb",
    color: "#111827",
    fontFamily: "sans-serif",
    padding: "24px 16px",
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: 720,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  };

  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    background: "#fff",
    fontSize: 16,
    outline: "none",
    boxSizing: "border-box",
  };

  const primaryButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "none",
    background: "#0B4EA2",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
  };

  if (!core.user || !core.userProfile?.companyId) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <div style={cardStyle}>
            <p>先にログインして会社を作成してください。</p>
            <Link href="/">マイページへ戻る</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <div style={cardStyle}>
          <Link href="/">← マイページへ</Link>
          <h1 style={{ marginTop: 12 }}>マスターページ</h1>
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 22 }}>車両登録</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              style={inputStyle}
              type="text"
              placeholder="車両名"
              value={core.vehicleName}
              onChange={(e) => core.setVehicleName(e.target.value)}
            />
            <input
              style={inputStyle}
              type="text"
              placeholder="ニックネーム（任意）"
              value={core.nickname}
              onChange={(e) => core.setNickname(e.target.value)}
            />
            <input
              style={inputStyle}
              type="text"
              placeholder="ナンバー（任意）"
              value={core.plateNumber}
              onChange={(e) => core.setPlateNumber(e.target.value)}
            />
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={core.isReservable}
                onChange={(e) => core.setIsReservable(e.target.checked)}
              />
              共有車（予約対象）
            </label>
            <button onClick={core.handleAddVehicle} style={primaryButtonStyle}>
              車両を登録
            </button>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 22 }}>車両一覧</h2>
          {core.vehicles.length === 0 ? (
            <p style={{ margin: 0, color: "#6b7280" }}>まだ車両がありません</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {core.vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 14,
                    background: "#fafafa",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 16 }}>
                    {vehicle.nickname || vehicle.vehicleName}
                  </div>
                  <div style={{ marginTop: 4, color: "#6b7280", fontSize: 14 }}>
                    {vehicle.nickname ? `${vehicle.vehicleName}` : ""}
                    {vehicle.plateNumber ? ` ・ ${vehicle.plateNumber}` : ""}
                    {vehicle.isReservable ? " ・ 共有車" : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}