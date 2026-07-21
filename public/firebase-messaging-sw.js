importScripts("https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDmkt_dIxdpujJbsA-Z4nYp2ZNsW2MUpT8",
  authDomain: "tedarik-pazari.firebaseapp.com",
  projectId: "tedarik-pazari",
  storageBucket: "tedarik-pazari.firebasestorage.app",
  messagingSenderId: "207480499748",
  appId: "1:207480499748:web:9bfa79adeedb6bb4d0b2b1",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Tedarik Pazarı";
  const options = {
    body: payload.notification?.body || "Yeni bir bildiriminiz var.",
    icon: "/favicon.ico",
    data: payload.data || {},
  };

  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl =
    event.notification?.data?.url || "/notifications";

  event.waitUntil(clients.openWindow(targetUrl));
});
