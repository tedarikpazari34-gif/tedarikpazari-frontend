import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDmkt_dIxdpdjJbsA-Z4nYp2ZNsw2MUpT8",
  authDomain: "tedarik-pazari.firebaseapp.com",
  projectId: "tedarik-pazari",
  storageBucket: "tedarik-pazari.firebasestorage.app",
  messagingSenderId: "207480499748",
  appId: "1:207480499748:web:9bfa79adeedb6bb4d0b2b1",
};

export const firebaseApp = initializeApp(firebaseConfig);

export async function getFirebaseMessaging() {
  const supported = await isSupported();
  return supported ? getMessaging(firebaseApp) : null;
}
