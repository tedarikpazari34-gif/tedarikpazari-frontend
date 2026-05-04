import { useEffect, useState, type CSSProperties } from "react";

type Order = {
  id: string;
  status: string;
  totalAmount?: number | string;
  commissionAmount?: number | string;

  rfq?: {
    quantity?: number;
    product?: {
      title?: string;
    };
  };

  quote?: {
    unitPrice?: number | string;
    deliveryDays?: number;
    sellerNote?: string | null;
  };
};

const API =
  import.meta.env.VITE_API_URL || "http://localhost:3002/api";

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Token yok, giriş yap");
        return;
      }

      const res = await fetch(`${API}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Siparişler alınamadı");
        setOrders([]);
        return;
      }

      const safeOrders = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setOrders(safeOrders);
    } catch (err) {
      console.error(err);
      setError("Fetch hatası");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleAction = async (orderId: string, action: string) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/orders/${orderId}/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        alert("İşlem başarısız");
        return;
      }

      alert("İşlem başarılı ✅");
      loadOrders();
    } catch (err) {
      console.error(err);
      alert("İstek hatası");
    }
  };

  if (loading) {
    return <p style={{ padding: 40 }}>Yükleniyor...</p>;
  }

  return (
    <main style={{ padding: 40 }}>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    
    <h1 style={{ marginBottom: 30 }}>Siparişlerim</h1>

    <button
      onClick={() => {
        localStorage.clear();
        window.location.href = "/login";
      }}
      style={{
        padding: "8px 14px",
        background: "#ef4444",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer"
      }}
    >
      Çıkış Yap
    </button>

  </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!error && orders.length === 0 ? (
        <p>Henüz sipariş yok.</p>
      ) : (
        <div style={grid}>
          {orders.map((o) => (
            <div key={o.id} style={card}>
              <h2 style={title}>
                {o.rfq?.product?.title || "Ürün bulunamadı"}
              </h2>

              <p style={sub}>Miktar: {o.rfq?.quantity || 0}</p>

              <p style={sub}>
                Birim Fiyat:{" "}
                {Number(o.quote?.unitPrice || 0).toLocaleString("tr-TR")} ₺
              </p>

              <p style={sub}>
                Teslim: {o.quote?.deliveryDays || "-"} gün
              </p>

              <p style={sub}>
                Not: {o.quote?.sellerNote || "-"}
              </p>

              <p style={price}>
                Toplam:{" "}
                {Number(o.totalAmount || 0).toLocaleString("tr-TR")} ₺
              </p>

              <span style={statusBadge(o.status)}>
                {o.status}
              </span>

              <div style={{ marginTop: 12 }}>
                {o.status === "PENDING_PAYMENT" && (
                  <button
                    style={blueButton}
                    onClick={() => handleAction(o.id, "pay")}
                  >
                    💳 Öde
                  </button>
                )}

                {o.status === "SHIPPED" && (
                  <button
                    style={greenButton}
                    onClick={() => handleAction(o.id, "complete")}
                  >
                    ✅ Teslim Aldım
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

/* STYLES */

const page: CSSProperties = {
  padding: 40,
  minHeight: "100vh",
  background: "#f8fafc",
};

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))",
  gap: 20,
};

const card: CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  background: "#ffffff",
};

const title: CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  marginBottom: 10,
};

const sub: CSSProperties = {
  fontSize: 14,
  color: "#4b5563",
  marginBottom: 6,
};

const price: CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  color: "#16a34a",
  marginTop: 10,
};

const blueButton: CSSProperties = {
  padding: "8px 12px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const greenButton: CSSProperties = {
  padding: "8px 12px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const statusBadge = (status: string): CSSProperties => {
  const base: CSSProperties = {
    marginTop: 12,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    display: "inline-block",
  };

  switch (status) {
    case "PENDING_PAYMENT":
      return { ...base, background: "#fef3c7", color: "#92400e" };
    case "PAID":
      return { ...base, background: "#dbeafe", color: "#1d4ed8" };
    case "PREPARING":
      return { ...base, background: "#e9d5ff", color: "#7e22ce" };
    case "SHIPPED":
      return { ...base, background: "#cffafe", color: "#155e75" };
    case "COMPLETED":
      return { ...base, background: "#dcfce7", color: "#166534" };
    default:
      return { ...base, background: "#e5e7eb", color: "#374151" };
  }
};