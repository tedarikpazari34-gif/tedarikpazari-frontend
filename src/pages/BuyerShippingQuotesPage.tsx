import { useEffect, useState } from "react";

const API = "http://https://tedarik-backend.onrender.com/api";

export default function BuyerShippingQuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState("");

  const load = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/shipping/buyer`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("BUYER SHIPPING QUOTES:", data);

      if (!res.ok) {
        alert(data?.message || "Teklifler alınamadı");
        setQuotes([]);
        return;
      }

      setQuotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const acceptQuote = async (quoteId: string) => {
    try {
      setAcceptingId(quoteId);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/shipping/quote/${quoteId}/accept`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("ACCEPT RESULT:", data);

      if (!res.ok) {
        alert(data?.message || "Nakliye seçilemedi");
        return;
      }

      alert("Nakliye firması seçildi ✅");
      await load();
    } catch (err) {
      console.error(err);
      alert("Hata oluştu");
    } finally {
      setAcceptingId("");
    }
  };

  if (loading) {
    return <p style={{ padding: 40 }}>Yükleniyor...</p>;
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>🚚 Nakliye Tekliflerim</h1>

      {quotes.length === 0 ? (
        <p>Teklif yok</p>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {quotes.map((q) => (
            <div
              key={q.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 20,
                background: "white",
              }}
            >
              <p>
                <b>Firma:</b> {q.company?.name || q.company?.companyName || "-"}
              </p>

              <p>
                <b>Ürün:</b>{" "}
                {q.rfq?.order?.rfq?.product?.title || "-"}
              </p>

              <p>
                <b>Fiyat:</b> {Number(q.price || 0).toLocaleString("tr-TR")} ₺
              </p>

              <p>
                <b>Teslim:</b> {q.deliveryDays || "-"} gün
              </p>

              <p>
                <b>Not:</b> {q.note || "-"}
              </p>

              <p>
                <b>Durum:</b> {q.status}
              </p>

              {q.status === "SENT" && (
                <button
                  onClick={() => acceptQuote(q.id)}
                  disabled={acceptingId === q.id}
                  style={{
                    marginTop: 10,
                    padding: "10px 14px",
                    background: "#16a34a",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  {acceptingId === q.id
                    ? "Seçiliyor..."
                    : "Nakliyeciyi Seç"}
                </button>
              )}

              {q.status === "ACCEPTED" && (
                <p style={{ color: "#16a34a", fontWeight: 700 }}>
                  ✅ Seçildi
                </p>
              )}

              {q.status === "REJECTED" && (
                <p style={{ color: "#ef4444", fontWeight: 700 }}>
                  Reddedildi
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}