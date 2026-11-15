import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api";

type WebhookEvent = {
  id: string;
  orderId: string | null;
  paymentAttemptId: string | null;
  paymentId: string;
  eventType: string;
  paymentStatus: string;
  status: string;
  receivedAt: string;
  deliveryCount: number;
};

export default function AdminIyzicoWebhookManager() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [filter, setFilter] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");
      setEvents([]);

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Yönetici oturumu bulunamadı.");

        const query = filter ? "?status=" + encodeURIComponent(filter) : "";
        const response = await fetch(API + "/admin/iyzico-webhooks" + query, {
          headers: { Authorization: "Bearer " + token },
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("HTTP " + response.status);

        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error("Geçersiz API yanıtı");

        if (!controller.signal.aborted) setEvents(data as WebhookEvent[]);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Bağlantı hatası");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [filter, refresh]);

  return (
    <section style={{ background: "#fff", padding: 24, borderRadius: 20, marginBottom: 24 }}>
      <h2 style={{ color: "#0f172a" }}>iyzico Webhook İnceleme</h2>
      <p>Bildirim kayıtları yalnızca görüntülenir. Ödeme onayı verilmez.</p>

      <select
        aria-label="Webhook durum filtresi"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        <option value="">Tümü</option>
        <option value="RECEIVED">Alındı</option>
        <option value="INVESTIGATION_REQUIRED">İnceleme gerekli</option>
      </select>

      <button type="button" onClick={() => setRefresh((x) => x + 1)}>
        Yenile
      </button>

      {loading && <p role="status">Yükleniyor...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && events.length === 0 && <p>Kayıt bulunamadı.</p>}

      {!loading && !error && events.map((event) => (
        <article key={event.id} style={{
          padding: 16, border: "1px solid #e2e8f0",
          borderRadius: 12, marginTop: 12, overflowWrap: "anywhere"
        }}>
          <strong>{event.status}</strong>
          <div>Sipariş: {event.orderId || "-"}</div>
          <div>Ödeme denemesi: {event.paymentAttemptId || "-"}</div>
          <div>iyzico Payment ID: {event.paymentId}</div>
          <div>Bildirim türü: {event.eventType}</div>
          <div>Ödeme bildirimi: {event.paymentStatus}</div>
          <div>Bildirim sayısı: {event.deliveryCount}</div>
          <div>Tarih: {new Date(event.receivedAt).toLocaleString("tr-TR")}</div>
        </article>
      ))}
    </section>
  );
}
