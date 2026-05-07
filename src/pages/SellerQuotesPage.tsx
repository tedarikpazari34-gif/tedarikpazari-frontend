import { useEffect, useState } from "react";

type Quote = {
  id: string;
  unitPrice: string | number;
  deliveryDays?: number;
  sellerNote?: string | null;
  status: string;
  createdAt: string;
  rfq?: {
    id: string;
    quantity: number;
    product?: {
      title?: string;
      unitType?: string;
    };
    buyer?: {
      name?: string;
    };
  };
};

const API = "http://https://tedarik-backend.onrender.com/api";

export default function SellerQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQuotes = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/quotes/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("SELLER QUOTES:", data);

      const safe = Array.isArray(data) ? data : [];
      setQuotes(safe);
    } catch (err) {
      console.error(err);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  if (loading) return <p style={{ padding: 40 }}>Yükleniyor...</p>;

  return (
    <main style={pageStyle}>
      <h1 style={titleStyle}>Tekliflerim</h1>

      {quotes.length === 0 ? (
        <p>Henüz teklif yok</p>
      ) : (
        <div style={gridStyle}>
          {quotes.map((q) => (
            <div key={q.id} style={cardStyle}>
              <h2 style={cardTitle}>
                {q.rfq?.product?.title || "Ürün"}
              </h2>

              <p><b>Buyer:</b> {q.rfq?.buyer?.name || "-"}</p>

              <p>
                <b>Miktar:</b> {q.rfq?.quantity}{" "}
                {q.rfq?.product?.unitType}
              </p>

              <p>
                <b>Fiyat:</b>{" "}
                {Number(q.unitPrice).toLocaleString("tr-TR")} ₺
              </p>

              <p>
                <b>Teslim:</b> {q.deliveryDays || "-"} gün
              </p>

              <div style={{ marginTop: 12 }}>
                <span style={statusBadge(q.status)}>
                  {statusLabel(q.status)}
                </span>
              </div>

              {q.status === "ACCEPTED" && (
                <div style={acceptedBox}>
                  ✅ Satışa dönüştü
                </div>
              )}

              {q.status === "REJECTED" && (
                <div style={rejectedBox}>
                  ❌ Teklif reddedildi
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

/* 🎨 STYLES */

const pageStyle: React.CSSProperties = {
  padding: 40,
  background: "#020617",
  minHeight: "100vh",
  color: "white",
};

const titleStyle: React.CSSProperties = {
  marginBottom: 24,
  fontSize: 32,
  fontWeight: 800,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: 20,
};

const cardStyle: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 14,
  padding: 20,
};

const cardTitle: React.CSSProperties = {
  marginBottom: 10,
  fontSize: 20,
  fontWeight: 700,
};

const acceptedBox: React.CSSProperties = {
  marginTop: 12,
  padding: 10,
  background: "#14532d",
  borderRadius: 8,
  color: "#bbf7d0",
};

const rejectedBox: React.CSSProperties = {
  marginTop: 12,
  padding: 10,
  background: "#7f1d1d",
  borderRadius: 8,
  color: "#fecaca",
};

const statusBadge = (status: string): React.CSSProperties => {
  const base: React.CSSProperties = {
    padding: "5px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  };

  switch (status) {
    case "SENT":
      return { ...base, background: "#1e3a8a", color: "#93c5fd" };

    case "ACCEPTED":
      return { ...base, background: "#166534", color: "#bbf7d0" };

    case "REJECTED":
      return { ...base, background: "#7f1d1d", color: "#fecaca" };

    default:
      return { ...base, background: "#374151", color: "#e5e7eb" };
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case "SENT":
      return "Bekliyor";
    case "ACCEPTED":
      return "Kabul edildi";
    case "REJECTED":
      return "Reddedildi";
    default:
      return status;
  }
};