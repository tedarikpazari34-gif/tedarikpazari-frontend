import { useEffect, useState } from "react";

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
  };

  buyer?: {
    id?: string;
    name?: string;
    companyName?: string;
    email?: string;
  };
};

const API = "https://tedarik-backend.onrender.com/api";

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Oturum bulunamadı");
        setOrders([]);
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
      console.error("ORDER LOAD ERROR:", err);
      setError("Siparişler alınamadı");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrepare = async (orderId: string) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/orders/${orderId}/prepare`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message || "Hazırlama işlemi başarısız");
        return;
      }

      alert("Sipariş hazırlanmaya alındı 🛠");
      loadOrders();
    } catch (err) {
      console.error("PREPARE ERROR:", err);
      alert("Hazırlama işlemi sırasında hata oluştu");
    }
  };

  const handleShip = async (orderId: string) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/orders/${orderId}/ship`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message || "Kargo işlemi başarısız");
        return;
      }

      alert("Sipariş kargoya verildi 🚚");
      loadOrders();
    } catch (err) {
      console.error("SHIP ERROR:", err);
      alert("Kargo işlemi sırasında hata oluştu");
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) {
    return <p style={{ padding: 40 }}>Yükleniyor...</p>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 24 }}>Satıcı Siparişleri</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {orders.length === 0 ? (
        <p>Sipariş bulunamadı</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {orders.map((o) => (
            <div
              key={o.id}
              style={{
                borderRadius: 12,
                padding: 20,
                background: "#0f172a",
                color: "white",
              }}
            >
              <h3 style={{ marginTop: 0 }}>
                {o.rfq?.product?.title || "Ürün"}
              </h3>

              <p>
                <b>Buyer:</b> {o.buyer?.name || o.buyer?.companyName || "-"}
              </p>

              <p>
                <b>Miktar:</b> {o.rfq?.quantity || "-"}
              </p>

              <p>
                <b>Birim Fiyat:</b> {o.quote?.unitPrice || "-"} ₺
              </p>

              <p style={{ color: "#22c55e", fontWeight: "bold" }}>
                Toplam: {o.totalAmount || "-"} ₺
              </p>

              <p>
                <b>Komisyon:</b> {o.commissionAmount || "-"} ₺
              </p>

              <p>
                <b>Durum:</b> {o.status}
              </p>

              {o.status === "PAID" && (
                <button
                  onClick={() => handlePrepare(o.id)}
                  style={{
                    marginTop: 12,
                    padding: "10px 14px",
                    background: "#f59e0b",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  🛠 Hazırlamaya Başla
                </button>
              )}

              {o.status === "PREPARING" && (
                <button
                  onClick={() => handleShip(o.id)}
                  style={{
                    marginTop: 12,
                    padding: "10px 14px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  📦 Kargoya Ver
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}