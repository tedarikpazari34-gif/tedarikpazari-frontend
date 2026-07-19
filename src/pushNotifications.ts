import { getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "./firebase";

const API =
  import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

export async function enablePushNotifications() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Bildirimleri açmak için giriş yapmalısınız.");
  }

  if (!("Notification" in window)) {
    throw new Error("Bu tarayıcı bildirimleri desteklemiyor.");
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Bildirim izni verilmedi.");
  }

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
  );

  const messaging = await getFirebaseMessaging();

  if (!messaging) {
    throw new Error("Firebase bildirimleri bu tarayıcıda desteklenmiyor.");
  }

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

  if (!vapidKey) {
    throw new Error("VAPID anahtarı bulunamadı.");
  }

  const pushToken = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!pushToken) {
    throw new Error("Cihaz bildirim anahtarı alınamadı.");
  }

  const res = await fetch(`${API}/push/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      token: pushToken,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "Bildirim cihazı kaydedilemedi.");
  }

  return {
    success: true,
    pushToken,
  };
}
