// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDXsgXsd7oMMru1wCFYr6CkTwF1AGkkIzI",
  authDomain: "rebuild-63abf.firebaseapp.com",
  projectId: "rebuild-63abf",
  storageBucket: "rebuild-63abf.firebasestorage.app",
  messagingSenderId: "525834338467",
  appId: "1:525834338467:web:505ef4d0cde9ff61f17f16",
  measurementId: "G-FBCVT2WFPB"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
const analytics = getAnalytics(app);