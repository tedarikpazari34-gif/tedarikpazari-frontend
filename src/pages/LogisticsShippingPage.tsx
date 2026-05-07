import { useEffect, useState } from "react";

const API = "http://https://tedarik-backend.onrender.com/api";

export default function ShippingPage() {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/shipping/open`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("SHIPPING OPEN RESPONSE:", data);

      if (!res.ok) {
        alert(data?.message || "Nakliye talepleri alınamadı");
        setRfqs([]);
        return;
      }

      setRfqs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("LOAD ERROR:", error);
      setRfqs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sendQuote = async (rfqId: string) => {
    try {
      const price = prompt("Teklif fiyatı gir:");
      if (!price) return;

      const deliveryDays = prompt("Teslim süresi kaç gün?");
      if (!deliveryDays) return;

      const note = prompt("Not ekle (opsiyonel):") || "";

      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/shipping/quote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rfqId,
          price: Number(price),
          deliveryDays: Number(deliveryDays),
          note,
        }),
      });

      const data = await res.json();
      console.log("SHIPPING QUOTE RESPONSE:", data);

      if (!res.ok) {
        alert(data?.message || "Teklif gönderilemedi");
        return;
      }

      alert("✅ Nakliye teklifi gönderildi");
      await load();
    } catch (error) {
      console.error("SEND QUOTE ERROR:", error);
      alert("Hata oluştu");
    }
  };

  if (loading) {
    return <p style={{ padding: 40 }}>Yükleniyor...</p>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>🚚 Nakliye Talepleri</h1>

      {rfqs.length === 0 ? (
        <p>Açık nakliye talebi yok.</p>
      ) : (
        rfqs.map((r) => (
          <div
            key={r.id}
            style={{
              border: "1px solid #ccc",
              marginBottom: 20,
              padding: 20,
              borderRadius: 10,
            }}
          >
            <p><b>From:</b> {r.fromAddress}</p>
            <p><b>To:</b> {r.toAddress}</p>
            <p><b>Order:</b> {r.orderId}</p>
            <p><b>Durum:</b> {r.status}</p>
            <p><b>Teklif Sayısı:</b> {r.quotes?.length || 0}</p>

            <button
              onClick={() => sendQuote(r.id)}
              style={{
                marginTop: 8,
                padding: "8px 12px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              💰 Teklif Ver
            </button>
          </div>
        ))
      )}
    </div>
  );
}