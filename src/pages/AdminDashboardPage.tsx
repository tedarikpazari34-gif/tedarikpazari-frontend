import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";

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

const API = "https://tedarik-backend.onrender.com/api";

function formatMoney(value: number | string) {
  return `${Number(value || 0).toLocaleString("tr-TR")} ₺`;
}

function statusLabel(status?: string) {
  if (status === "PENDING_PAYMENT") return "Ödeme Bekliyor";
  if (status === "PAID") return "Ödendi";
  if (status === "PREPARING") return "Hazırlanıyor";
  if (status === "SHIPPED") return "Kargoda";
  if (status === "COMPLETED") return "Tamamlandı";
  if (status === "OPEN") return "Açık";
  return status || "-";
}

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
        setError("Admin panelini görmek için giriş yapmalısınız.");
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
        const safeOrders = Array.isArray(ordersData)
          ? ordersData
          : Array.isArray(ordersData?.data)
          ? ordersData.data
          : [];

        setOrders(safeOrders);
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
    (sum, order) => sum + Number(order.totalAmount || 0),
    0
  );

  const totalCommission = orders.reduce(
    (sum, order) => sum + Number(order.commissionAmount || 0),
    0
  );

  const activeRfqs = rfqs.filter((rfq) => rfq.status === "OPEN").length;
  const completedOrders = orders.filter((order) => order.status === "COMPLETED").length;
  const paidOrders = orders.filter((order) => order.status === "PAID").length;

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={emptyCardStyle}>Admin verileri yükleniyor...</div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <div style={eyebrowStyle}>ADMIN PANELİ</div>
          <h1 style={titleStyle}>Platform Dashboard</h1>
          <p style={descStyle}>
            RFQ, sipariş, işlem hacmi ve platform komisyonlarını tek ekrandan takip edin.
          </p>
        </div>

        <div style={heroAmountStyle}>
          <span>Toplam Hacim</span>
          <strong>{formatMoney(totalRevenue)}</strong>
        </div>
      </section>

      {error && <div style={errorCardStyle}>{error}</div>}

      <section style={statsStyle}>
        <Stat label="RFQ Sayısı" value={rfqs.length} />
        <Stat label="Aktif RFQ" value={activeRfqs} />
        <Stat label="Toplam Sipariş" value={orders.length} />
        <Stat label="Ödenen Sipariş" value={paidOrders} />
        <Stat label="Tamamlanan" value={completedOrders} />
        <Stat label="Komisyon" value={formatMoney(totalCommission)} highlight />
      </section>

      <section style={quickActionsStyle}>
        <Link to="/admin/companies" style={actionCardStyle}>
          <strong>Şirket Onayları</strong>
          <span>Firma ve kullanıcı kayıtlarını incele</span>
        </Link>

        <Link to="/seller/rfqs" style={actionCardStyle}>
          <strong>Açık RFQ Takibi</strong>
          <span>Platformdaki açık talepleri görüntüle</span>
        </Link>

        <Link to="/wallet" style={actionCardStyle}>
          <strong>Finans / Cüzdan</strong>
          <span>Bakiye ve escrow hareketlerini kontrol et</span>
        </Link>
      </section>

      <section style={tableSectionStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <div style={eyebrowDarkStyle}>SON HAREKETLER</div>
            <h2 style={sectionTitleStyle}>Son Siparişler</h2>
          </div>
        </div>

        {orders.length === 0 ? (
          <div style={emptyTableStyle}>Sipariş yok.</div>
        ) : (
          <div style={tableStyle}>
            {orders.slice(0, 10).map((order) => (
              <div key={order.id} style={rowStyle}>
                <span style={orderIdStyle}>#{order.id.slice(0, 8)}</span>
                <span>{formatMoney(order.totalAmount || 0)}</span>
                <span>{formatMoney(order.commissionAmount || 0)}</span>
                <span style={statusPillStyle}>{statusLabel(order.status)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div style={statCardStyle}>
      <span style={statLabelStyle}>{label}</span>
      <strong
        style={{
          ...statValueStyle,
          color: highlight ? "#2563eb" : "#0f172a",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: 40,
};

const heroStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
  background: "linear-gradient(135deg, #020617, #1e3a8a)",
  color: "white",
  borderRadius: 28,
  padding: 32,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  boxShadow: "0 24px 50px rgba(15,23,42,0.18)",
};

const eyebrowStyle: CSSProperties = {
  color: "#93c5fd",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 8,
};

const titleStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: 40,
  fontWeight: 900,
};

const descStyle: CSSProperties = {
  margin: 0,
  maxWidth: 720,
  color: "#cbd5e1",
  lineHeight: 1.7,
};

const heroAmountStyle: CSSProperties = {
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 20,
  padding: 20,
  minWidth: 190,
  display: "grid",
  gap: 6,
};

const statsStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 16,
};

const statCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 20,
  padding: 20,
  boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
  display: "grid",
  gap: 8,
};

const statLabelStyle: CSSProperties = {
  color: "#64748b",
  fontWeight: 800,
};

const statValueStyle: CSSProperties = {
  color: "#0f172a",
  fontSize: 28,
  fontWeight: 900,
};

const quickActionsStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 16,
};

const actionCardStyle: CSSProperties = {
  textDecoration: "none",
  background: "white",
  color: "#0f172a",
  border: "1px solid #e2e8f0",
  borderRadius: 20,
  padding: 20,
  display: "grid",
  gap: 8,
  boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
};

const tableSectionStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 24,
  padding: 24,
  boxShadow: "0 14px 34px rgba(15,23,42,0.08)",
};

const sectionHeaderStyle: CSSProperties = {
  marginBottom: 18,
};

const eyebrowDarkStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 8,
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: 28,
  fontWeight: 900,
};

const tableStyle: CSSProperties = {
  display: "grid",
  gap: 10,
};

const rowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr 1fr",
  gap: 12,
  alignItems: "center",
  background: "#f8fafc",
  borderRadius: 14,
  padding: 14,
  color: "#334155",
};

const orderIdStyle: CSSProperties = {
  fontWeight: 900,
  color: "#0f172a",
};

const statusPillStyle: CSSProperties = {
  background: "#eff6ff",
  color: "#1d4ed8",
  padding: "7px 10px",
  borderRadius: 999,
  fontWeight: 900,
  textAlign: "center",
};

const emptyTableStyle: CSSProperties = {
  color: "#64748b",
};

const emptyCardStyle: CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 24,
  padding: 32,
  boxShadow: "0 14px 34px rgba(15,23,42,0.10)",
};

const errorCardStyle: CSSProperties = {
  ...emptyCardStyle,
  color: "#991b1b",
  marginBottom: 24,
};