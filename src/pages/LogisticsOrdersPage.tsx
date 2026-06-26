import { useEffect, useState } from "react";

const API = "https://tedarik-backend.onrender.com/api";

const statusText: Record<string, string> = {
  PENDING_PICKUP: "Yük Alınacak",
  PICKED_UP: "Yük Alındı",
  IN_TRANSIT: "Yolda",
  DELIVERED: "Teslim Edildi",
};

export default function LogisticsOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/shipping/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("SHIPPING ORDERS:", data);

      if (!res.ok) {
        alert(data?.message || "Nakliye siparişleri alınamadı");
        setOrders([]);
        return;
      }

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const action = async (id: string, type: "pickup" | "transit" | "deliver") => {
    try {
      setBusyId(id);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/shipping/orders/${id}/${type}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || "İşlem yapılamadı");
        return;
      }

      alert("İşlem başarılı ✅");
      await load();
    } catch (err) {
      console.error(err);
      alert("Hata oluştu");
    } finally {
      setBusyId("");
    }
  };

  if (loading) {
    return <p style={{ padding: 40 }}>Yükleniyor...</p>;
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>🚚 Nakliye Siparişlerim</h1>

      {orders.length === 0 ? (
        <p>Aktif nakliye siparişi yok.</p>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {orders.map((o) => (
            <div
              key={o.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 20,
                background: "white",
              }}
            >
              <h3>{o.order?.rfq?.product?.title || "Ürün"}</h3>

              <p>
                <b>Alıcı:</b> {o.buyer?.name || "-"}
              </p>
              <p>
                <b>Satıcı:</b> {o.seller?.name || "-"}
              </p>

              <p>
                <b>Rota:</b> {o.shippingRfq?.fromAddress || "-"} →{" "}
                {o.shippingRfq?.toAddress || "-"}
              </p>

              <p>
                <b>Fiyat:</b>{" "}
                {Number(o.shippingQuote?.price || 0).toLocaleString("tr-TR")} ₺
              </p>

              <p>
                <b>Teslim Süresi:</b> {o.shippingQuote?.deliveryDays || "-"} gün
              </p>

              <p>
                <b>Takip No:</b> {o.trackingNo || "-"}
              </p>

              <p>
                <b>Durum:</b> {statusText[o.status] || o.status}
              </p>

              {o.status === "PENDING_PICKUP" && (
                <button
                  disabled={busyId === o.id}
                  onClick={() => action(o.id, "pickup")}
                  style={{
                    padding: "10px 14px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  📦 Yükü Aldım
                </button>
              )}

              {o.status === "PICKED_UP" && (
                <button
                  disabled={busyId === o.id}
                  onClick={() => action(o.id, "transit")}
                  style={{
                    padding: "10px 14px",
                    background: "#f59e0b",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  🚛 Yola Çıktı
                </button>
              )}

              {o.status === "IN_TRANSIT" && (
                <button
                  disabled={busyId === o.id}
                  onClick={() => action(o.id, "deliver")}
                  style={{
                    padding: "10px 14px",
                    background: "#16a34a",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  ✅ Teslim Edildi
                </button>
              )}

              {o.status === "DELIVERED" && (
                <p style={{ color: "#16a34a", fontWeight: 700 }}>
                  ✅ Teslim edildi
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}