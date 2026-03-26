"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTrackerCore } from "@/src/hooks/useTrackerCore";

export default function ReservationPage() {
  const core = useTrackerCore();
  const [weekOffset, setWeekOffset] = useState(0);

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#f5f7fb",
    color: "#111827",
    fontFamily: "sans-serif",
    padding: "24px 16px",
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  };

  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: 20,
    padding: 20,
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
  };

  const navButtonStyle: React.CSSProperties = {
    width: 64,
    height: 64,
    borderRadius: 18,
    border: "1px solid #d1d5db",
    background: "#fff",
    fontSize: 28,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(17, 24, 39, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 1000,
  };

  const modalStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 520,
    background: "#ffffff",
    borderRadius: 20,
    padding: 20,
    boxShadow: "0 20px 60px rgba(0,0,0,0.20)",
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

  const dangerButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #ef4444",
    background: "#fff",
    color: "#ef4444",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
  };

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const weekDates = useMemo(() => {
    const base = getStartOfWeek(new Date());
    base.setDate(base.getDate() + weekOffset * 7);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d;
    });
  }, [weekOffset]);

  const weekTitle = useMemo(() => {
    const start = weekDates[0];
    return `${start.getFullYear()}/${start.getMonth() + 1}/${start.getDate()} 週`;
  }, [weekDates]);

  const formatDateKey = (date: Date) => {
    return date.toISOString().slice(0, 10);
  };

  const formatDayLabel = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekJa = ["日", "月", "火", "水", "木", "金", "土"];
    return `${month}/${day}\n${weekJa[date.getDay()]}`;
  };

  const reservableVehicles = useMemo(() => {
    return core.vehicles.filter((v) => v.isReservable);
  }, [core.vehicles]);

  const editingReservation = useMemo(() => {
    if (!core.reservationTargetVehicleId || !core.reservationTargetDate) return null;
    return core.getReservationForCell(
      core.reservationTargetVehicleId,
      core.reservationTargetDate
    );
  }, [
    core,
    core.reservationTargetVehicleId,
    core.reservationTargetDate,
  ]);

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
          <div style={{ marginTop: 12, fontSize: 28, fontWeight: 800 }}>予約ページ</div>
          <div style={{ marginTop: 8, color: "#6b7280" }}>共有車のみ表示</div>
        </div>

        <div style={cardStyle}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "72px 1fr 72px",
              gap: 16,
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <button onClick={() => setWeekOffset((prev) => prev - 1)} style={navButtonStyle}>
              ←
            </button>

            <div style={{ textAlign: "center", fontSize: 28, fontWeight: 800 }}>
              {weekTitle}
            </div>

            <button onClick={() => setWeekOffset((prev) => prev + 1)} style={navButtonStyle}>
              →
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <div
              style={{
                minWidth: 980,
                display: "grid",
                gridTemplateColumns: "220px repeat(7, 1fr)",
                borderTop: "1px solid #d1d5db",
                borderLeft: "1px solid #d1d5db",
              }}
            >
              <div
                style={{
                  background: "#f3f4f6",
                  borderRight: "1px solid #d1d5db",
                  borderBottom: "1px solid #d1d5db",
                  minHeight: 88,
                }}
              />

              {weekDates.map((date) => (
                <div
                  key={formatDateKey(date)}
                  style={{
                    background: "#f3f4f6",
                    borderRight: "1px solid #d1d5db",
                    borderBottom: "1px solid #d1d5db",
                    minHeight: 88,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    whiteSpace: "pre-line",
                    fontSize: 18,
                    fontWeight: 800,
                    lineHeight: 1.4,
                  }}
                >
                  {formatDayLabel(date)}
                </div>
              ))}

              {reservableVehicles.map((vehicle) => (
                <div key={vehicle.id} style={{ display: "contents" }}>
                  <div
                    style={{
                      borderRight: "1px solid #d1d5db",
                      borderBottom: "1px solid #d1d5db",
                      background: "#fff",
                      padding: 18,
                      minHeight: 120,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <div style={{ fontSize: 24, fontWeight: 800 }}>
                      {vehicle.nickname || vehicle.vehicleName}
                    </div>
                    <div style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.5 }}>
                      {vehicle.nickname ? vehicle.vehicleName : ""}
                      {vehicle.plateNumber ? ` ${vehicle.plateNumber}` : ""}
                    </div>
                  </div>

                  {weekDates.map((date) => {
                    const dateKey = formatDateKey(date);
                    const reservation = core.getReservationForCell(vehicle.id, dateKey);
                    const isMine = reservation?.userId === core.user.uid;
                    const isTaken = !!reservation;

                    return (
                      <div
                        key={`${vehicle.id}-${dateKey}`}
                        style={{
                          borderRight: "1px solid #d1d5db",
                          borderBottom: "1px solid #d1d5db",
                          background: "#fff",
                          minHeight: 120,
                          padding: 12,
                        }}
                      >
                        <button
                          onClick={() => {
                            if (isTaken && !isMine) return;
                            core.openReservationModal(vehicle.id, dateKey);
                          }}
                          disabled={isTaken && !isMine}
                          style={{
                            width: "100%",
                            height: "100%",
                            minHeight: 92,
                            borderRadius: 20,
                            border: isMine
                              ? "2px solid #0B4EA2"
                              : "2px dashed #d1d5db",
                            background: isMine
                              ? "#0B4EA2"
                              : isTaken
                              ? "#e5e7eb"
                              : "#ffffff",
                            color: isMine ? "#ffffff" : "#6b7280",
                            cursor: isTaken && !isMine ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            gap: 6,
                            padding: 10,
                          }}
                        >
                          {isMine ? (
                            <>
                              <div style={{ fontSize: 18, fontWeight: 800 }}>
                                {reservation?.destination || "自分"}
                              </div>
                              <div style={{ fontSize: 13, opacity: 0.9 }}>
                                {reservation?.purpose || "タップで編集"}
                              </div>
                            </>
                          ) : isTaken ? (
                            <>
                              <div style={{ fontSize: 22, fontWeight: 800, color: "#374151" }}>
                                予約済
                              </div>
                              <div style={{ fontSize: 14, color: "#6b7280" }}>
                                他ユーザー
                              </div>
                            </>
                          ) : (
                            <div style={{ fontSize: 28, color: "#9ca3af", fontWeight: 500 }}>
                              +予約
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 14, color: "#6b7280", fontSize: 14 }}>
            青：自分の予約　/　グレー：他ユーザー予約済み
          </div>
        </div>

        {core.reservationModalOpen && (
          <div style={overlayStyle} onClick={core.closeReservationModal}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
                    予約入力
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 22 }}>
                    {reservableVehicles.find(
                      (v) => v.id === core.reservationTargetVehicleId
                    )?.nickname ||
                      reservableVehicles.find(
                        (v) => v.id === core.reservationTargetVehicleId
                      )?.vehicleName}
                  </div>
                  <div style={{ marginTop: 4, color: "#6b7280", fontSize: 14 }}>
                    {core.reservationTargetDate}
                  </div>
                </div>

                <button
                  onClick={core.closeReservationModal}
                  style={{
                    border: "1px solid #d1d5db",
                    background: "#fff",
                    borderRadius: 10,
                    padding: "8px 12px",
                    cursor: "pointer",
                  }}
                >
                  閉じる
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="行き先"
                  value={core.reservationDestination}
                  onChange={(e) => core.setReservationDestination(e.target.value)}
                />

                <input
                  style={inputStyle}
                  type="text"
                  placeholder="用途"
                  value={core.reservationPurpose}
                  onChange={(e) => core.setReservationPurpose(e.target.value)}
                />

                <button onClick={core.handleSaveReservation} style={primaryButtonStyle}>
                  予約を保存
                </button>

                {editingReservation && editingReservation.userId === core.user.uid && (
  <button
    onClick={() => core.handleDeleteReservation(editingReservation.id)}
    style={dangerButtonStyle}
  >
    予約を解除
  </button>
)}

                <button
                  onClick={core.closeReservationModal}
                  style={secondaryButtonStyle}
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}