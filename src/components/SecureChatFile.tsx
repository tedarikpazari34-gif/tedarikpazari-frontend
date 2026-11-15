import { useState } from "react";
import {
  chatFileEndpoint,
  isTrustedChatFileUrl,
} from "../lib/chatFileAccess";

type Labels = {
  image: string;
  document: string;
  loading: string;
  error: string;
  popup: string;
};

const LABELS: Record<string, Labels> = {
  tr: {
    image: "Görseli aç",
    document: "Dosyayı aç",
    loading: "Hazırlanıyor...",
    error: "Dosya güvenli şekilde açılamadı.",
    popup: "Tarayıcı yeni pencereyi engelledi.",
  },
  en: {
    image: "Open image",
    document: "Open file",
    loading: "Preparing...",
    error: "The file could not be opened securely.",
    popup: "Your browser blocked the new window.",
  },
  ka: {
    image: "სურათის გახსნა",
    document: "ფაილის გახსნა",
    loading: "მზადდება...",
    error: "ფაილის უსაფრთხოდ გახსნა ვერ მოხერხდა.",
    popup: "ბრაუზერმა ახალი ფანჯარა დაბლოკა.",
  },
  ru: {
    image: "Открыть изображение",
    document: "Открыть файл",
    loading: "Подготовка...",
    error: "Не удалось безопасно открыть файл.",
    popup: "Браузер заблокировал новое окно.",
  },
  de: {
    image: "Bild öffnen",
    document: "Datei öffnen",
    loading: "Wird vorbereitet...",
    error: "Die Datei konnte nicht sicher geöffnet werden.",
    popup: "Der Browser hat das neue Fenster blockiert.",
  },
  ar: {
    image: "فتح الصورة",
    document: "فتح الملف",
    loading: "جارٍ التحضير...",
    error: "تعذر فتح الملف بأمان.",
    popup: "حظر المتصفح النافذة الجديدة.",
  },
  uz: {
    image: "Rasmni ochish",
    document: "Faylni ochish",
    loading: "Tayyorlanmoqda...",
    error: "Faylni xavfsiz ochib bo‘lmadi.",
    popup: "Brauzer yangi oynani blokladi.",
  },
};

type Props = {
  apiBase: string;
  token: string | null;
  threadId: string;
  messageId: string;
  fileName?: string | null;
  isImage: boolean;
  language: string;
  color: string;
};

export default function SecureChatFile({
  apiBase,
  token,
  threadId,
  messageId,
  fileName,
  isImage,
  language,
  color,
}: Props) {
  const [busy, setBusy] = useState(false);

  const lang = language.split("-")[0].toLowerCase();
  const labels = LABELS[lang] ?? LABELS.tr;

  const openFile = async () => {
    if (busy) return;

    if (!token) {
      window.alert(labels.error);
      return;
    }

    // Open synchronously to avoid popup blockers after await.
    const popup = window.open("about:blank", "_blank");

    if (!popup) {
      window.alert(labels.popup);
      return;
    }

    popup.opener = null;
    setBusy(true);

    try {
      const response = await fetch(
        chatFileEndpoint(apiBase, threadId, messageId),
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
          credentials: "omit",
          redirect: "error",
        },
      );

      if (!response.ok) {
        throw new Error("File access denied");
      }

      const payload: unknown = await response.json();

      const url =
        payload &&
        typeof payload === "object" &&
        "url" in payload
          ? (payload as { url?: unknown }).url
          : null;

      if (!isTrustedChatFileUrl(url)) {
        throw new Error("Untrusted file URL");
      }

      popup.location.replace(url);
    } catch {
      popup.close();
      window.alert(labels.error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void openFile()}
      disabled={busy || !token}
      title={fileName || undefined}
      style={{
        color,
        background: "transparent",
        border: "1px solid currentColor",
        borderRadius: 8,
        padding: "8px 12px",
        cursor: busy ? "wait" : "pointer",
        fontWeight: 600,
        opacity: busy ? 0.65 : 1,
      }}
    >
      {isImage ? "🖼️" : "📄"}{" "}
      {busy
        ? labels.loading
        : isImage
          ? labels.image
          : labels.document}
    </button>
  );
}
