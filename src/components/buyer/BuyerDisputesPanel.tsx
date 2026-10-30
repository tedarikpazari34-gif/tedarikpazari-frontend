import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

type Dispute = {
  id: string;
  orderId: string;
  status: string;
  reason: string;
  description?: string | null;
  createdAt: string;
};

const labels = {
  tr: ["Taleplerim / Durum Takibi", "Yenile", "Yükleniyor...", "Henüz talebiniz yok.", "Talepler yüklenemedi.", "Tekrar giriş yapın.", "Sipariş", "Durum", "Gerekçe", "Açıklama"],
  en: ["My Disputes / Status", "Refresh", "Loading...", "No requests yet.", "Could not load requests.", "Please sign in again.", "Order", "Status", "Reason", "Description"],
  de: ["Meine Beschwerden / Status", "Aktualisieren", "Laden...", "Noch keine Anfragen.", "Anfragen konnten nicht geladen werden.", "Bitte erneut anmelden.", "Bestellung", "Status", "Grund", "Beschreibung"],
  ru: ["Мои обращения / Статус", "Обновить", "Загрузка...", "Обращений пока нет.", "Не удалось загрузить обращения.", "Войдите снова.", "Заказ", "Статус", "Причина", "Описание"],
  ka: ["ჩემი საჩივრები / სტატუსი", "განახლება", "იტვირთება...", "განაცხადები ჯერ არ არის.", "განაცხადები ვერ ჩაიტვირთა.", "ხელახლა შედით.", "შეკვეთა", "სტატუსი", "მიზეზი", "აღწერა"],
  ar: ["طلباتي / الحالة", "تحديث", "جارٍ التحميل...", "لا توجد طلبات بعد.", "تعذر تحميل الطلبات.", "يرجى تسجيل الدخول مجددًا.", "الطلب", "الحالة", "السبب", "الوصف"],
  uz: ["Murojaatlarim / Holati", "Yangilash", "Yuklanmoqda...", "Hozircha murojaat yo‘q.", "Murojaatlarni yuklab bo‘lmadi.", "Qayta kiring.", "Buyurtma", "Holat", "Sabab", "Izoh"],
};

export default function BuyerDisputesPanel() {
  const { i18n } = useTranslation();
  const language = i18n.language.slice(0, 2);
  const key = (language in labels ? language : "tr") as keyof typeof labels;
  const t = labels[key];

  const [items, setItems] = useState<Dispute[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const refresh = () => setVersion(v => v + 1);
    window.addEventListener("nex:dispute-created", refresh);
    return () => window.removeEventListener("nex:dispute-created", refresh);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setBusy(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error(t[5]);

        const response = await fetch(`${API}/disputes/mine`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) throw new Error(t[4]);

        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error(t[4]);

        if (!controller.signal.aborted) {
          setItems(data as Dispute[]);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : t[4]);
        }
      } finally {
        if (!controller.signal.aborted) setBusy(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [version, key]);

  return (
    <section style={{
      marginTop: 24, padding: 20, background: "#fff",
      border: "1px solid #cbd5e1", borderRadius: 14,
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", gap: 12, flexWrap: "wrap",
      }}>
        <h2 style={{ margin: 0, color: "#0f172a", fontSize: 19 }}>
          {t[0]}
        </h2>
        <button type="button" disabled={busy}
          onClick={() => setVersion(v => v + 1)}
          style={{
            border: 0, padding: "9px 14px", borderRadius: 8,
            color: "#fff", background: "#0d9488",
            cursor: busy ? "wait" : "pointer",
          }}>
          {t[1]}
        </button>
      </div>

      {busy && <p role="status">{t[2]}</p>}
      {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
      {!busy && !error && items.length === 0 && <p>{t[3]}</p>}

      {!busy && !error && items.map(item => (
        <article key={item.id} style={{
          marginTop: 12, padding: 14, borderRadius: 10,
          background: "#f8fafc", border: "1px solid #e2e8f0",
          overflowWrap: "anywhere",
        }}>
          <p><strong>{t[6]}:</strong> {item.orderId}</p>
          <p><strong>{t[7]}:</strong> {item.status}</p>
          <p><strong>{t[8]}:</strong> {item.reason}</p>
          {item.description && (
            <p><strong>{t[9]}:</strong> {item.description}</p>
          )}
          <small>{new Date(item.createdAt).toLocaleString(i18n.language)}</small>
        </article>
      ))}
    </section>
  );
}
