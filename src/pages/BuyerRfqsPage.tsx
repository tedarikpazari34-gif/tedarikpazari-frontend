import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";

type RFQ = {
  id: string;
  quantity: number;
  note?: string | null;
  status: string;
  product?: {
    title?: string;
  };
};

const API = "http://localhost:3002/api";

export default function BuyerRfqsPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRfqs = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Token yok, giriş yap");
          return;
        }

        const res = await fetch(`${API}/rfqs/mine`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data?.message || "RFQ talepleri alınamadı");
          return;
        }

        setRfqs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("RFQ talepleri alınamadı");
      } finally {
        setLoading(false);
      }
    };

    loadRfqs();
  }, []);

  if (loading) return <main style={page}>Yükleniyor...</main>;

  return (
    <main style={page}>
      <h1 style={{ marginBottom: 30 }}>RFQ Taleplerim</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!error && rfqs.length === 0 ? (
        <p>Henüz RFQ talebin yok.</p>
      ) : (
        <div style={grid}>
          {rfqs.map((rfq) => (
            <div key={rfq.id} style={card}>
              <h2 style={title}>{rfq.product?.title || "Ürün"}</h2>

              <p style={sub}>Miktar: {rfq.quantity}</p>
              <p style={sub}>Durum: {rfq.status}</p>
              <p style={sub}>Not: {rfq.note || "-"}</p>

              <Link to={`/buyer/rfqs/${rfq.id}`} style={button}>
                Teklifleri Gör
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

const page: CSSProperties = {
  padding: 40,
  minHeight: "100vh",
  background: "#f8fafc",
};

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: 20,
};

const card: CSSProperties = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
};

const title: CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  marginBottom: 10,
};

const sub: CSSProperties = {
  fontSize: 14,
  color: "#4b5563",
  marginBottom: 6,
};

const button: CSSProperties = {
  display: "inline-block",
  marginTop: 12,
  padding: "10px 14px",
  background: "#2563eb",
  color: "white",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: 700,
};