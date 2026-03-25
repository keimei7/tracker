
 import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC2Ql6E9BtBpz6fHBVddbzXBMYdxGvTz_c",
  authDomain: "tracker-1-dab9c.firebaseapp.com",
  projectId: "tracker-1-dab9c",
  storageBucket: "tracker-1-dab9c.firebasestorage.app",
  messagingSenderId: "107411142587",
  appId: "1:107411142587:web:60e431abd0ac65c6ed769e",
  measurementId: "G-01FF111Y14"
};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);