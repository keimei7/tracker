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
  deleteDoc,
} from "firebase/firestore";
import type { UserProfile, Vehicle, LogItem, Reservation } from "@/src/lib/trackerTypes";

export function useTrackerCore() {
    const formatLocalDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [vehicleName, setVehicleName] = useState("");
  const [nickname, setNickname] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [isReservable, setIsReservable] = useState(false);
  const [inspectionDate, setInspectionDate] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [destination, setDestination] = useState("");
  const [purpose, setPurpose] = useState("");
  const [distance, setDistance] = useState("");
  const [fueled, setFueled] = useState(false);
  const [comment, setComment] = useState("");
  const [logs, setLogs] = useState<LogItem[]>([]);

  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [reservationTargetVehicleId, setReservationTargetVehicleId] = useState("");
  const [reservationTargetDate, setReservationTargetDate] = useState("");
  const [reservationDestination, setReservationDestination] = useState("");
  const [reservationPurpose, setReservationPurpose] = useState("");

  const getWeekDates = () => {
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(formatLocalDate(d));
  }
  return dates;
};

  const weekDates = getWeekDates();

  useEffect(() => {
    if (!auth || !db) return;

    const dbInstance = db;

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (!u) {
        setUserProfile(null);
        setVehicles([]);
        setLogs([]);
        setReservations([]);
        return;
      }

      try {
        const userRef = doc(dbInstance, "users", u.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setUserProfile(null);
          setVehicles([]);
          setLogs([]);
          setReservations([]);
          return;
        }

        const profile = userSnap.data() as UserProfile;
        setUserProfile(profile);

        if (profile.companyId) {
          await fetchVehicles(profile.companyId);
          await fetchLogs(profile.companyId);
          await fetchReservations(profile.companyId);
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

  const fetchReservations = async (companyId: string) => {
    if (!db) return;

    const q = query(collection(db, "reservations"), where("companyId", "==", companyId));
    const snap = await getDocs(q);
    const list = snap.docs.map(
      (item) =>
        ({
          id: item.id,
          ...item.data(),
        }) as Reservation
    );
    setReservations(list);
  };

  const getReservationForCell = (vehicleId: string, date: string) => {
    return reservations.find((r) => r.vehicleId === vehicleId && r.date === date);
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
        isReservable,
        inspectionDate: inspectionDate || "",
        createdAt: serverTimestamp(),
      });

      setVehicleName("");
      setNickname("");
      setPlateNumber("");
      setIsReservable(false);
      setInspectionDate("");

      await fetchVehicles(userProfile.companyId);
    } catch (error) {
      console.error("車両登録失敗", error);
    }
  };

  const handleAddLog = async (vehicleId: string) => {
    if (!db || !userProfile?.companyId || !user?.uid) return;
    if (!vehicleId || !destination.trim()) return;

    try {
      await addDoc(collection(db, "logs"), {
        companyId: userProfile.companyId,
        userId: user.uid,
        vehicleId,
      date: formatLocalDate(new Date()),
        destination: destination.trim(),
        purpose: purpose.trim(),
        distance: distance ? Number(distance) : 0,
        fueled,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });

      setDestination("");
      setPurpose("");
      setDistance("");
      setFueled(false);
      setComment("");

      await fetchLogs(userProfile.companyId);
    } catch (error) {
      console.error("実績保存失敗", error);
    }
  };

  const openReservationModal = (vehicleId: string, date: string) => {
    const existing = getReservationForCell(vehicleId, date);

    setReservationTargetVehicleId(vehicleId);
    setReservationTargetDate(date);
    setReservationDestination(existing?.destination || "");
    setReservationPurpose(existing?.purpose || "");
    setReservationModalOpen(true);
  };

  const closeReservationModal = () => {
    setReservationModalOpen(false);
    setReservationTargetVehicleId("");
    setReservationTargetDate("");
    setReservationDestination("");
    setReservationPurpose("");
  };

  const handleSaveReservation = async () => {
    if (!db || !userProfile?.companyId || !user?.uid) return;
    if (!reservationTargetVehicleId || !reservationTargetDate) return;

    const existingMine = reservations.find(
      (r) =>
        r.vehicleId === reservationTargetVehicleId &&
        r.date === reservationTargetDate &&
        r.userId === user.uid
    );

    try {
      if (existingMine) {
        await deleteDoc(doc(db, "reservations", existingMine.id));
      }

      await addDoc(collection(db, "reservations"), {
        companyId: userProfile.companyId,
        userId: user.uid,
        vehicleId: reservationTargetVehicleId,
        date: reservationTargetDate,
        destination: reservationDestination.trim(),
        purpose: reservationPurpose.trim(),
        createdAt: serverTimestamp(),
      });

      await fetchReservations(userProfile.companyId);
      closeReservationModal();
    } catch (error) {
      console.error("予約保存失敗", error);
    }
  };

  const handleDeleteReservation = async (reservationId: string) => {
    if (!db || !userProfile?.companyId) return;

    try {
      await deleteDoc(doc(db, "reservations", reservationId));
      await fetchReservations(userProfile.companyId);
      closeReservationModal();
    } catch (error) {
      console.error("予約解除失敗", error);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    companyName,
    setCompanyName,
    user,
    userProfile,

    vehicleName,
    setVehicleName,
    nickname,
    setNickname,
    plateNumber,
    setPlateNumber,
    isReservable,
    setIsReservable,
    inspectionDate,
    setInspectionDate,
    vehicles,

    destination,
    setDestination,
    purpose,
    setPurpose,
    distance,
    setDistance,
    fueled,
    setFueled,
    comment,
    setComment,
    logs,

    reservations,
    weekDates,
    getReservationForCell,

    reservationModalOpen,
    reservationTargetVehicleId,
    reservationTargetDate,
    reservationDestination,
    setReservationDestination,
    reservationPurpose,
    setReservationPurpose,

    handleSignUp,
    handleLogin,
    handleLogout,
    handleCreateCompany,
    handleAddVehicle,
    handleAddLog,

    openReservationModal,
    closeReservationModal,
    handleSaveReservation,
    handleDeleteReservation,
  };
}