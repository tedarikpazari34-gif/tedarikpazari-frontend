import { useEffect, useMemo, useState } from "react";

const API = "https://tedarik-backend.onrender.com/api";

export default function LogisticsDashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);

      const res = await fetch(`${API}/shipping/orders`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setOrders(Array.isArray(data) ? data : []);
      } else {
        console.log(data);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(
        (x) => x.status === "PENDING_PICKUP"
      ).length,
      transit: orders.filter(
        (x) => x.status === "IN_TRANSIT"
      ).length,
      delivered: orders.filter(
        (x) => x.status === "DELIVERED"
      ).length,
    };
  }, [orders]);

  if (loading) {
    return <div style={{ padding: 40 }}>Yükleniyor...</div>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>🚚 Lojistik Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 20,
          marginTop: 25,
          marginBottom: 35,
        }}
      >
        <Card title="Toplam" value={stats.total} />
        <Card title="Pickup Bekliyor" value={stats.pending} />
        <Card title="Yolda" value={stats.transit} />
        <Card title="Teslim" value={stats.delivered} />
      </div>

      <h2>Son Taşımalar</h2>

      {orders.map((o) => (
        <div
          key={o.id}
          style={{
            border: "1px solid #ddd",
            padding: 20,
            marginBottom: 15,
            borderRadius: 12,
          }}
        >
          <h3>{o.order?.rfq?.product?.title}</h3>

          <p>
            <b>Takip:</b> {o.trackingNo}
          </p>

          <p>
            <b>Firma:</b> {o.shippingCompany}
          </p>

          <p>
            <b>Durum:</b> {o.status}
          </p>

          <p>
            <b>Güzergah:</b>{" "}
            {o.shippingRfq?.fromAddress} → {o.shippingRfq?.toAddress}
          </p>
        </div>
      ))}
    </div>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 24,
        border: "1px solid #eee",
      }}
    >
      <div style={{ color: "#666" }}>{title}</div>

      <div
        style={{
          fontSize: 34,
          fontWeight: 700,
          marginTop: 8,
        }}
      >
        {value}
      </div>
    </div>
  );
}