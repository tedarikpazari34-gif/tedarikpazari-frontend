import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type RFQ = {
  id: string;
  quantity: number;
  note?: string | null;
  status: string;
  product?: { title?: string };
};

type Quote = {
  id: string;
  rfqId?: string;
  unitPrice?: string | number;
  deliveryDays?: number;
  sellerNote?: string | null;
  status?: string;
  rfq?: { id?: string };
};

const API = "http://https://tedarik-backend.onrender.com/api";

export default function BuyerRfqDetailPage() {
  const { id } = useParams();

  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          alert("Token yok, giriş yap");
          setLoading(false);
          return;
        }

        // RFQ list
        const rfqRes = await fetch(`${API}/rfqs/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const rfqData = await rfqRes.json();

        const found = Array.isArray(rfqData)
          ? rfqData.find((r: RFQ) => r.id === id)
          : null;

        setRfq(found || null);

        // Quotes
        const qRes = await fetch(`${API}/quotes/buyer`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (qRes.ok) {
          const qData = await qRes.json();

          const filtered = Array.isArray(qData)
            ? qData.filter(
                (q: Quote) => q.rfqId === id || q.rfq?.id === id
              )
            : [];

          setQuotes(filtered);
        } else {
          setQuotes([]);
        }
      } catch (err) {
        console.error(err);
        setQuotes([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const acceptQuote = async (quoteId: string) => {
    try {
      setAcceptingId(quoteId);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API}/orders/from-quote/${quoteId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        alert("Sipariş oluşturulamadı ❌");
        return;
      }

      alert("Teklif kabul edildi ✅");
      location.reload();
    } catch (err) {
      console.error(err);
      alert("Hata ❌");
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) {
    return <main style={{ padding: 40 }}>Yükleniyor...</main>;
  }

  if (!rfq) {
    return <main style={{ padding: 40 }}>RFQ bulunamadı</main>;
  }

  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 20 }}>
        {rfq.product?.title || "Ürün"}
      </h1>

      <div style={card}>
        <p><b>Miktar:</b> {rfq.quantity}</p>
        <p><b>Durum:</b> {rfq.status}</p>
        <p><b>Not:</b> {rfq.note || "-"}</p>
      </div>

      <h2>Teklifler</h2>

      {quotes.length === 0 && <p>Henüz teklif yok.</p>}

      {quotes.map((q) => (
        <div key={q.id} style={quoteCard}>
          <p><b>Fiyat:</b> {q.unitPrice ?? "-"} ₺</p>
          <p><b>Teslim:</b> {q.deliveryDays ?? "-"} gün</p>
          <p><b>Not:</b> {q.sellerNote || "-"}</p>
          <p><b>Durum:</b> {q.status || "-"}</p>

          {q.status === "SENT" && (
            <button
              onClick={() => acceptQuote(q.id)}
              disabled={acceptingId === q.id}
              style={greenButton}
            >
              {acceptingId === q.id
                ? "Oluşturuluyor..."
                : "Teklifi Kabul Et"}
            </button>
          )}
        </div>
      ))}
    </main>
  );
}

/* styles */

const card: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 20,
  marginBottom: 30,
  background: "#fff",
};

const quoteCard: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: 20,
  marginBottom: 16,
  background: "#f9fafb",
};

const greenButton: React.CSSProperties = {
  marginTop: 10,
  padding: "10px 16px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};