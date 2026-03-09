importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js");

const firebaseConfig = {
  apiKey: "AIzaSyDXsgXsd7oMMru1wCFYr6CkTwF1AGkkIzI",
  authDomain: "rebuild-63abf.firebaseapp.com",
  projectId: "rebuild-63abf",
  storageBucket: "rebuild-63abf.firebasestorage.app",
  messagingSenderId: "525834338467",
  appId: "1:525834338467:web:505ef4d0cde9ff61f17f16"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message", payload);

  const notificationTitle = payload.notification.title;

  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});