"use client";

import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { auth, db } from "@/src/lib/firebase";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

type UserProfile = {
  email: string;
  companyId: string;
  role: string;
  createdAt?: unknown;
};

type Vehicle = {
  id: string;
  companyId: string;
  vehicleName: string;
  nickname?: string;
  plateNumber?: string;
  createdAt?: unknown;
};

type LogItem = {
  id: string;
  companyId: string;
  userId: string;
  vehicleId: string;
  date: string;
  destination: string;
  distance: number;
  fueled: boolean;
  comment?: string;
  createdAt?: unknown;
};

export default function TrackerApp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [vehicleName, setVehicleName] = useState("");
  const [nickname, setNickname] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [destination, setDestination] = useState("");
  const [distance, setDistance] = useState("");
  const [fueled, setFueled] = useState(false);
  const [comment, setComment] = useState("");
  const [logs, setLogs] = useState<LogItem[]>([]);

  useEffect(() => {
  if (!auth || !db) return;

  const authInstance = auth;
  const dbInstance = db;

  const unsubscribe = onAuthStateChanged(authInstance, async (u) => {
    setUser(u);

    if (!u) {
      setUserProfile(null);
      setVehicles([]);
      setLogs([]);
      return;
    }

    try {
      const userRef = doc(dbInstance, "users", u.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setUserProfile(null);
        setVehicles([]);
        setLogs([]);
        return;
      }

      const profile = userSnap.data() as UserProfile;
      setUserProfile(profile);

      if (profile.companyId) {
        await fetchVehicles(profile.companyId);
        await fetchLogs(profile.companyId);
      }
    } catch (error) {
      console.error("ユーザー取得失敗", error);
    }
  });

  return () => unsubscribe();
}, []);

   

  const fetchVehicles = async (companyId: string) => {
    if (!db) return;

    const q = query(collection(db, "vehicles"), where("companyId", "==", companyId));
    const snap = await getDocs(q);
    const list = snap.docs.map(
      (item) =>
        ({
          id: item.id,
          ...item.data(),
        }) as Vehicle
    );
    setVehicles(list);
  };

  const fetchLogs = async (companyId: string) => {
    if (!db) return;

    const q = query(collection(db, "logs"), where("companyId", "==", companyId));
    const snap = await getDocs(q);
    const list = snap.docs.map(
      (item) =>
        ({
          id: item.id,
          ...item.data(),
        }) as LogItem
    );
    setLogs(list);
  };

  const handleSignUp = async () => {
    if (!auth) return;

    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("新規登録失敗", error);
    }
  };

  const handleLogin = async () => {
    if (!auth) return;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("ログイン失敗", error);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  const generateCompanyCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateCompany = async () => {
    if (!db || !user || !companyName.trim()) return;

    try {
      const companyRef = doc(collection(db, "companies"));
      const companyCode = generateCompanyCode();

      await setDoc(companyRef, {
        companyName: companyName.trim(),
        companyCode,
        createdAt: serverTimestamp(),
      });

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        companyId: companyRef.id,
        role: "admin",
        createdAt: serverTimestamp(),
      });

      const updatedUserSnap = await getDoc(doc(db, "users", user.uid));
      if (updatedUserSnap.exists()) {
        setUserProfile(updatedUserSnap.data() as UserProfile);
      }
    } catch (error) {
      console.error("会社作成失敗", error);
    }
  };

  const handleAddVehicle = async () => {
    if (!db || !userProfile?.companyId || !vehicleName.trim()) return;

    try {
      await addDoc(collection(db, "vehicles"), {
        companyId: userProfile.companyId,
        vehicleName: vehicleName.trim(),
        nickname: nickname.trim(),
        plateNumber: plateNumber.trim(),
        createdAt: serverTimestamp(),
      });

      setVehicleName("");
      setNickname("");
      setPlateNumber("");

      await fetchVehicles(userProfile.companyId);
    } catch (error) {
      console.error("車両登録失敗", error);
    }
  };

  const handleAddLog = async () => {
    if (!db || !userProfile?.companyId || !user?.uid) return;
    if (!selectedVehicleId || !destination.trim()) return;

    try {
      await addDoc(collection(db, "logs"), {
        companyId: userProfile.companyId,
        userId: user.uid,
        vehicleId: selectedVehicleId,
        date: new Date().toISOString().slice(0, 10),
        destination: destination.trim(),
        distance: distance ? Number(distance) : 0,
        fueled,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });

      setSelectedVehicleId("");
      setDestination("");
      setDistance("");
      setFueled(false);
      setComment("");

      await fetchLogs(userProfile.companyId);
    } catch (error) {
      console.error("実績保存失敗", error);
    }
  };

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

  if (user && userProfile?.companyId) {
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
                <p style={{ margin: "8px 0 0", color: "#6b7280" }}>{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                style={{ ...secondaryButtonStyle, width: "auto", padding: "10px 14px" }}
              >
                ログアウト
              </button>
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 22 }}>車両一覧</h2>
            {vehicles.length === 0 ? (
              <p style={{ margin: 0, color: "#6b7280" }}>まだ車両がありません</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {vehicles.map((vehicle) => (
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 22 }}>今日の入力</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                style={inputStyle}
              >
                <option value="">車両を選択</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.nickname || vehicle.vehicleName}
                  </option>
                ))}
              </select>

              <input
                style={inputStyle}
                type="text"
                placeholder="行先"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />

              <input
                style={inputStyle}
                type="number"
                placeholder="走行距離（km）"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
              />

              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={fueled}
                  onChange={(e) => setFueled(e.target.checked)}
                />
                給油あり
              </label>

              <input
                style={inputStyle}
                type="text"
                placeholder="コメント（任意）"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <button onClick={handleAddLog} style={primaryButtonStyle}>
                今日の記録を保存
              </button>
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 22 }}>実績一覧</h2>

            {logs.length === 0 ? (
              <p style={{ margin: 0, color: "#6b7280" }}>まだ実績がありません</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {logs.map((log) => {
                  const vehicle = vehicles.find((v) => v.id === log.vehicleId);

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

          <div style={cardStyle}>
            <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 22 }}>車両登録</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                style={inputStyle}
                type="text"
                placeholder="車両名"
                value={vehicleName}
                onChange={(e) => setVehicleName(e.target.value)}
              />
              <input
                style={inputStyle}
                type="text"
                placeholder="ニックネーム（任意）"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <input
                style={inputStyle}
                type="text"
                placeholder="ナンバー（任意）"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
              />
              <button onClick={handleAddVehicle} style={primaryButtonStyle}>
                車両を登録
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (user) {
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
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
              <button onClick={handleCreateCompany} style={primaryButtonStyle}>
                会社を作成する
              </button>
              <button onClick={handleLogout} style={secondaryButtonStyle}>
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
          <h1 style={titleStyle}>tr🚛ker</h1>
          <p style={{ margin: "8px 0 20px", color: "#6b7280" }}>ログイン</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              style={inputStyle}
              type="email"
              placeholder="メール"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              style={inputStyle}
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleSignUp} style={primaryButtonStyle}>
              新規登録
            </button>
            <button onClick={handleLogin} style={secondaryButtonStyle}>
              ログイン
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}