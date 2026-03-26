"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTrackerCore } from "@/src/hooks/useTrackerCore";

export default function MyPage() {
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

  const secondaryButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#111827",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 32,
    fontWeight: 800,
    margin: 0,
    color: "#111827",
  };

  const vehicleCardBaseStyle: React.CSSProperties = {
    padding: 16,
    borderRadius: 14,
    background: "#ffffff",
    cursor: "pointer",
    transition: "all 0.15s ease",
  };

  const today = new Date().toISOString().slice(0, 10);

  const myCar = useMemo(() => {
    return core.vehicles.find((v) => !v.isReservable) || null;
  }, [core.vehicles]);

  const todaysReservations = useMemo(() => {
    if (!core.user) return [];

    return core.reservations.filter(
      (r) => r.userId === core.user.uid && r.date === today
    );
  }, [core.reservations, core.user, today]);

  const todaysReservedVehicles = useMemo(() => {
    return todaysReservations
      .map((r) => core.vehicles.find((v) => v.id === r.vehicleId && v.isReservable))
      .filter(Boolean);
  }, [todaysReservations, core.vehicles]);

  if (!core.user) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <div style={cardStyle}>
            <h1 style={titleStyle}>tr🚛ker</h1>
            <p style={{ margin: "8px 0 20px", color: "#6b7280" }}>ログイン</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                style={inputStyle}
                type="email"
                placeholder="メール"
                value={core.email}
                onChange={(e) => core.setEmail(e.target.value)}
              />
              <input
                style={inputStyle}
                type="password"
                placeholder="パスワード"
                value={core.password}
                onChange={(e) => core.setPassword(e.target.value)}
              />
              <button onClick={core.handleSignUp} style={primaryButtonStyle}>
                新規登録
              </button>
              <button onClick={core.handleLogin} style={secondaryButtonStyle}>
                ログイン
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (core.user && !core.userProfile?.companyId) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <div style={cardStyle}>
            <h1 style={titleStyle}>tr🚛ker</h1>
            <p style={{ margin: "8px 0 20px", color: "#6b7280" }}>会社を作成</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                style={inputStyle}
                type="text"
                placeholder="会社名"
                value={core.companyName}
                onChange={(e) => core.setCompanyName(e.target.value)}
              />
              <button onClick={core.handleCreateCompany} style={primaryButtonStyle}>
                会社を作成する
              </button>
              <button onClick={core.handleLogout} style={secondaryButtonStyle}>
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div>
              <h1 style={titleStyle}>tr🚛ker</h1>
              <p style={{ margin: "8px 0 0", color: "#6b7280" }}>{core.user.email}</p>
            </div>
            <button
              onClick={core.handleLogout}
              style={{ ...secondaryButtonStyle, width: "auto", padding: "10px 14px" }}
            >
              ログアウト
            </button>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            <Link href="/reservations">予約</Link>
            <Link href="/logs">実績</Link>
            <Link href="/master">マスター</Link>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 22 }}>今日の車</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {myCar ? (
              <div
                onClick={() => core.setSelectedVehicleId(myCar.id)}
                style={{
                  ...vehicleCardBaseStyle,
                  border:
                    core.selectedVehicleId === myCar.id
                      ? "2px solid #0B4EA2"
                      : "1px solid #e5e7eb",
                  background:
                    core.selectedVehicleId === myCar.id ? "#eff6ff" : "#ffffff",
                }}
              >
                <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>
                  マイカー
                </div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>
                  {myCar.nickname || myCar.vehicleName}
                </div>
                <div style={{ marginTop: 4, color: "#6b7280", fontSize: 14 }}>
                  {myCar.nickname ? myCar.vehicleName : ""}
                  {myCar.plateNumber ? ` ・ ${myCar.plateNumber}` : ""}
                </div>
              </div>
            ) : (
              <div
                style={{
                  ...vehicleCardBaseStyle,
                  border: "1px dashed #d1d5db",
                  color: "#6b7280",
                  cursor: "default",
                }}
              >
                マイカーが未設定です
              </div>
            )}

            {todaysReservedVehicles.map((vehicle: any) => (
              <div
                key={vehicle.id}
                onClick={() => core.setSelectedVehicleId(vehicle.id)}
                style={{
                  ...vehicleCardBaseStyle,
                  border:
                    core.selectedVehicleId === vehicle.id
                      ? "2px solid #0B4EA2"
                      : "1px solid #e5e7eb",
                  background:
                    core.selectedVehicleId === vehicle.id ? "#eff6ff" : "#ffffff",
                }}
              >
                <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>
                  予約車
                </div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>
                  {vehicle.nickname || vehicle.vehicleName}
                </div>
                <div style={{ marginTop: 4, color: "#6b7280", fontSize: 14 }}>
                  {vehicle.nickname ? vehicle.vehicleName : ""}
                  {vehicle.plateNumber ? ` ・ ${vehicle.plateNumber}` : ""}
                </div>
              </div>
            ))}

            {!myCar && todaysReservedVehicles.length === 0 && (
              <div
                style={{
                  ...vehicleCardBaseStyle,
                  border: "1px dashed #d1d5db",
                  color: "#6b7280",
                  cursor: "default",
                }}
              >
                今日使う車がありません
              </div>
            )}
          </div>
        </div>

        {core.selectedVehicleId && (
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 22 }}>今日の入力</h2>

            <div style={{ marginBottom: 16, color: "#6b7280", fontSize: 14 }}>
              選択中：
              {core.vehicles.find((v) => v.id === core.selectedVehicleId)?.nickname ||
                core.vehicles.find((v) => v.id === core.selectedVehicleId)?.vehicleName}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                style={inputStyle}
                type="text"
                placeholder="行先"
                value={core.destination}
                onChange={(e) => core.setDestination(e.target.value)}
              />

              <input
                style={inputStyle}
                type="number"
                placeholder="走行距離（km）"
                value={core.distance}
                onChange={(e) => core.setDistance(e.target.value)}
              />

              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={core.fueled}
                  onChange={(e) => core.setFueled(e.target.checked)}
                />
                給油あり
              </label>

              <input
                style={inputStyle}
                type="text"
                placeholder="コメント（任意）"
                value={core.comment}
                onChange={(e) => core.setComment(e.target.value)}
              />

              <button onClick={core.handleAddLog} style={primaryButtonStyle}>
                今日の記録を保存
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}