import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDXsgXsd7oMMru1wCFYr6CkTwF1AGkkIzI",
  authDomain: "rebuild-63abf.firebaseapp.com",
  projectId: "rebuild-63abf",
  storageBucket: "rebuild-63abf.firebasestorage.app",
  messagingSenderId: "525834338467",
  appId: "1:525834338467:web:505ef4d0cde9ff61f17f16",
  measurementId: "G-FBCVT2WFPB"
};

export const app = initializeApp(firebaseConfig);

// ❗ DO NOT initialize directly
export const getFirebaseMessaging = async () => {
  if (typeof window === "undefined") return null;

  const supported = await isSupported();
  if (!supported) return null;

  return getMessaging(app);
};