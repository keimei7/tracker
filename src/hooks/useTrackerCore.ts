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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [vehicleName, setVehicleName] = useState("");
  const [nickname, setNickname] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [isReservable, setIsReservable] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [destination, setDestination] = useState("");
  const [distance, setDistance] = useState("");
  const [fueled, setFueled] = useState(false);
  const [comment, setComment] = useState("");
  const [logs, setLogs] = useState<LogItem[]>([]);

  const [reservations, setReservations] = useState<Reservation[]>([]);

  const getWeekDates = () => {
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
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
        createdAt: serverTimestamp(),
      });

      setVehicleName("");
      setNickname("");
      setPlateNumber("");
      setIsReservable(false);

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
        date: new Date().toISOString().slice(0, 10),
        destination: destination.trim(),
        distance: distance ? Number(distance) : 0,
        fueled,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });

      setDestination("");
      setDistance("");
      setFueled(false);
      setComment("");

      await fetchLogs(userProfile.companyId);
    } catch (error) {
      console.error("実績保存失敗", error);
    }
  };

  const handleReserve = async (vehicleId: string, date: string) => {
    if (!db || !userProfile?.companyId || !user?.uid) return;

    const alreadyMine = reservations.find(
      (r) => r.vehicleId === vehicleId && r.date === date && r.userId === user.uid
    );

    if (alreadyMine) {
      try {
        await deleteDoc(doc(db, "reservations", alreadyMine.id));
        await fetchReservations(userProfile.companyId);
      } catch (error) {
        console.error("予約解除失敗", error);
      }
      return;
    }

    const alreadyTaken = reservations.find(
      (r) => r.vehicleId === vehicleId && r.date === date
    );

    if (alreadyTaken) return;

    try {
      await addDoc(collection(db, "reservations"), {
        companyId: userProfile.companyId,
        userId: user.uid,
        vehicleId,
        date,
        createdAt: serverTimestamp(),
      });

      await fetchReservations(userProfile.companyId);
    } catch (error) {
      console.error("予約失敗", error);
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
    vehicles,

    
    destination,
    setDestination,
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

    handleSignUp,
    handleLogin,
    handleLogout,
    handleCreateCompany,
    handleAddVehicle,
    handleAddLog,
    handleReserve,
  };
}