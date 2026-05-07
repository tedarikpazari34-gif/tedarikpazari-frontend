import { useEffect, useState } from "react";

type Order = {
  id: string;
  totalAmount?: number | string;
  commissionAmount?: number | string;
  status?: string;
};

type RFQ = {
  id: string;
  status?: string;
};

const API = "http://https://tedarik-backend.onrender.com/api";

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Token yok, admin olarak giriş yap");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [ordersRes, rfqsRes] = await Promise.all([
        fetch(`${API}/orders`, { headers }),
        fetch(`${API}/rfqs/open`, { headers }),
      ]);

      const ordersData = await ordersRes.json();
      const rfqsData = await rfqsRes.json();

      if (!ordersRes.ok) {
        setError(ordersData?.message || "Siparişler alınamadı");
        setOrders([]);
      } else {
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      }

      if (rfqsRes.ok) {
        setRfqs(Array.isArray(rfqsData) ? rfqsData : []);
      } else {
        setRfqs([]);
      }
    } catch (err) {
      console.error("ADMIN DASHBOARD ERROR:", err);
      setError("Admin verileri alınamadı");
      setOrders([]);
      setRfqs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const totalRevenue = orders.reduce(
    (sum, o) => sum + Number(o.totalAmount || 0),
    0
  );

  const totalCommission = orders.reduce(
    (sum, o) => sum + Number(o.commissionAmount || 0),
    0
  );

  const activeRfqs = rfqs.filter((r) => r.status === "OPEN").length;

  if (loading) {
    return <main style={{ padding: 40 }}>Yükleniyor...</main>;
  }

  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 30 }}>Admin Dashboard</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={grid}>
        <div style={card}>
          <p>RFQ Sayısı</p>
          <h2>{rfqs.length}</h2>
        </div>

        <div style={card}>
          <p>Toplam Sipariş</p>
          <h2>{orders.length}</h2>
        </div>

        <div style={card}>
          <p>Toplam Hacim</p>
          <h2 style={{ color: "#16a34a" }}>
            {totalRevenue.toLocaleString("tr-TR")} ₺
          </h2>
        </div>

        <div style={card}>
          <p>Platform Komisyonu</p>
          <h2 style={{ color: "#2563eb" }}>
            {totalCommission.toLocaleString("tr-TR")} ₺
          </h2>
        </div>

        <div style={card}>
          <p>Aktif RFQ</p>
          <h2>{activeRfqs}</h2>
        </div>
      </div>

      <h2 style={{ marginTop: 40, marginBottom: 20 }}>Son Siparişler</h2>

      {orders.length === 0 ? (
        <p>Sipariş yok.</p>
      ) : (
        <div style={table}>
          {orders.map((o) => (
            <div key={o.id} style={row}>
              <span>Sipariş #{o.id.slice(0, 8)}</span>
              <span>{Number(o.totalAmount || 0).toLocaleString("tr-TR")} ₺</span>
              <span>{o.status || "-"}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 20,
};

const card: React.CSSProperties = {
  background: "#0f172a",
  color: "white",
  borderRadius: 12,
  padding: 24,
};

const table: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  overflow: "hidden",
};

const row: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  padding: 15,
  borderBottom: "1px solid #e5e7eb",
};