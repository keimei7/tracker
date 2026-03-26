"use client";

import Link from "next/link";
import { useTrackerCore } from "@/src/hooks/useTrackerCore";

export default function ReservationPage() {
  const core = useTrackerCore();

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#f5f7fb",
    color: "#111827",
    fontFamily: "sans-serif",
    padding: "24px 16px",
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: 920,
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
          <h1 style={{ marginTop: 12 }}>予約画面</h1>
          <p style={{ color: "#6b7280" }}>共有車のみ表示</p>
        </div>

        <div style={cardStyle}>
          <div style={{ overflowX: "auto" }}>
            <div
              style={{
                minWidth: 560,
                display: "grid",
                gridTemplateColumns: "140px repeat(7, 1fr)",
                gap: 8,
                alignItems: "center",
              }}
            >
              <div></div>

              {core.weekDates.map((date) => (
                <div
                  key={date}
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#374151",
                    textAlign: "center",
                    padding: "6px 4px",
                  }}
                >
                  {date.slice(5)}
                </div>
              ))}

              {core.vehicles
                .filter((vehicle) => vehicle.isReservable)
                .map((vehicle) => (
                  <div key={vehicle.id} style={{ display: "contents" }}>
                    <div
                      style={{
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {vehicle.nickname || vehicle.vehicleName}
                    </div>

                    {core.weekDates.map((date) => {
                      const reservation = core.getReservationForCell(vehicle.id, date);
                      const isMine = reservation?.userId === core.user.uid;
                      const isTaken = !!reservation;

                      return (
                        <button
                          key={`${vehicle.id}-${date}`}
                          onClick={() => core.handleReserve(vehicle.id, date)}
                          disabled={isTaken && !isMine}
                          style={{
                            height: 44,
                            borderRadius: 10,
                            border: "1px solid #d1d5db",
                            background: isMine ? "#0B4EA2" : isTaken ? "#e5e7eb" : "#ffffff",
                            color: isMine ? "#ffffff" : "#111827",
                            fontWeight: 700,
                            cursor: isTaken && !isMine ? "not-allowed" : "pointer",
                          }}
                        >
                          {isMine ? "自分" : isTaken ? "埋" : "○"}
                        </button>
                      );
                    })}
                  </div>
                ))}
            </div>
          </div>

          <p style={{ marginTop: 12, marginBottom: 0, color: "#6b7280", fontSize: 13 }}>
            青：自分の予約 / グレー：他ユーザー予約済み
          </p>
        </div>
      </div>
    </main>
  );
}