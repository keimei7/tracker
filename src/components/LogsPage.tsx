"use client";

import Link from "next/link";
import { useTrackerCore } from "@/src/hooks/useTrackerCore";

export default function LogsPage() {
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
          <h1 style={{ marginTop: 12 }}>実績ページ</h1>
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 22 }}>実績一覧</h2>

          {core.logs.length === 0 ? (
            <p style={{ margin: 0, color: "#6b7280" }}>まだ実績がありません</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {core.logs.map((log) => {
                const vehicle = core.vehicles.find((v) => v.id === log.vehicleId);

                return (
                  <div
                    key={log.id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                      padding: 14,
                      background: "#fafafa",
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>
                      {vehicle?.nickname || vehicle?.vehicleName || "不明な車両"}
                    </div>
                    <div style={{ marginTop: 4, color: "#6b7280", fontSize: 14 }}>
                      {log.date} ・ {log.destination}
                    </div>
                    <div style={{ marginTop: 4, color: "#6b7280", fontSize: 14 }}>
                      走行距離: {log.distance || 0}km
                      {log.fueled ? " ・ 給油あり" : ""}
                    </div>
                    {log.comment ? (
                      <div style={{ marginTop: 4, color: "#6b7280", fontSize: 14 }}>
                        {log.comment}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}