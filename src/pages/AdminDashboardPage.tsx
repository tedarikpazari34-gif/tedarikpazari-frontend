import { useEffect, useState, type CSSProperties } from "react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Link } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";

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
type AdminMetrics = {
  totalUsers: number;
  totalCompanies: number;
  approvedCompanies: number;
  pendingCompanies: number;
  totalProducts: number;
  approvedProducts: number;
  pendingProducts: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders?: number;
  disputes: number;
  totalRfqs: number;
  openRfqs: number;
  quotes: number;
  gmv: number;
  commission: number;
};

const API =
  import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api";

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
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
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

      const [metricsRes, ordersRes, rfqsRes] = await Promise.all([
        fetch(`${API}/dashboard/admin`, { headers }),
        fetch(`${API}/orders`, { headers }),
        fetch(`${API}/rfqs/open`, { headers }),
      ]);

      const metricsData = await metricsRes.json();

      if (metricsRes.ok) {
        setMetrics(metricsData);
      }

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

  const totalRevenue =
    metrics?.gmv ??
    orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

  const totalCommission =
    metrics?.commission ??
    orders.reduce((sum, order) => sum + Number(order.commissionAmount || 0), 0);

  const activeRfqs =
    metrics?.openRfqs ?? rfqs.filter((rfq) => rfq.status === "OPEN").length;

  const completedOrders =
    metrics?.completedOrders ??
    orders.filter((order) => order.status === "COMPLETED").length;

  const paidOrders = orders.filter((order) => order.status === "PAID").length;

  const totalOrders = metrics?.totalOrders ?? orders.length;
  const revenueData = [
    {
      name: "Sipariş",
      revenue: totalRevenue,
      commission: totalCommission,
    },
  ];

  const otherOrders = Math.max(0, orders.length - paidOrders - completedOrders);

  const orderStatusData = [
    {
      name: "Ödendi",
      value: paidOrders,
    },
    {
      name: "Tamamlandı",
      value: completedOrders,
    },
    {
      name: "Diğer",
      value: orders.length - paidOrders - completedOrders,
    },
  ];

  const COLORS = ["#2563eb", "#22c55e", "#f59e0b"];
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          background: "#f8fafc",
        }}
      >
        <AdminSidebar />

        <main
          style={{
            ...pageStyle,
            flex: 1,
          }}
        >
          <div style={emptyCardStyle}>Admin verileri yükleniyor...</div>
        </main>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        background: "#f8fafc",
      }}
    >
      <AdminSidebar />

      <main
        style={{
          ...pageStyle,
          flex: 1,
        }}
      >
        <section style={heroStyle}>
          <div>
            <div style={eyebrowStyle}>ADMIN PANELİ</div>

            <h1 style={titleStyle}>Platform Dashboard</h1>

            <p style={descStyle}>
              RFQ, sipariş, işlem hacmi ve platform komisyonlarını tek ekrandan
              takip edin.
            </p>
          </div>

          <div style={heroAmountStyle}>
            <span>Toplam Hacim</span>

            <strong>{formatMoney(totalRevenue)}</strong>
          </div>
        </section>

        {error && <div style={errorCardStyle}>{error}</div>}

        <section style={statsStyle}>
          <Stat label="Toplam RFQ" value={metrics?.totalRfqs ?? rfqs.length} />

          <Stat label="Aktif RFQ" value={activeRfqs} />

          <Stat label="Toplam Sipariş" value={totalOrders} />

          <Stat label="Ödenen Sipariş" value={paidOrders} />

          <Stat label="Tamamlanan" value={completedOrders} />

          <Stat
            label="Komisyon"
            value={formatMoney(totalCommission)}
            highlight
          />
          <Stat label="Şirketler" value={metrics?.totalCompanies ?? "-"} />
          <Stat label="Ürünler" value={metrics?.totalProducts ?? "-"} />
          <Stat label="Dispute" value={metrics?.disputes ?? "-"} />
        </section>

        <section style={quickActionsStyle}>
          <Link to="/admin/companies" style={actionCardStyle}>
            <strong>Şirket Onayları</strong>

            <span>Firma ve kullanıcı kayıtlarını incele</span>
          </Link>

          <Link to="/admin/products" style={actionCardStyle}>
            <strong>Ürün Yönetimi</strong>

            <span>Bekleyen ürünleri onayla</span>
          </Link>
          <Link to="/admin/chat-moderation" style={actionCardStyle}>
            <strong>Chat Moderation</strong>
            <span>
              Şüpheli mesajları ve platform dışı iletişim denemelerini incele
            </span>
          </Link>
          <Link to="/admin/payouts" style={actionCardStyle}>
            <strong>Payout Yönetimi</strong>

            <span>Satıcı ödeme taleplerini yönet</span>
          </Link>

          <Link to="/admin/disputes" style={actionCardStyle}>
            <strong>Dispute Yönetimi</strong>

            <span>Escrow dispute süreçlerini çöz</span>
          </Link>

          <Link to="/admin/finance" style={actionCardStyle}>
            <strong>Finans Dashboard</strong>

            <span>Ledger ve işlem geçmişini görüntüle</span>
          </Link>
        </section>
        <section style={chartGridStyle}>
          <div style={chartCardStyle}>
            <div style={chartHeaderStyle}>
              <div>
                <div style={eyebrowDarkStyle}>GELİR ANALİTİĞİ</div>

                <h2 style={sectionTitleStyle}>Platform Geliri</h2>
              </div>
            </div>

            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />

                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="name" />

                  <YAxis />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={chartCardStyle}>
            <div style={chartHeaderStyle}>
              <div>
                <div style={eyebrowDarkStyle}>SİPARİŞ DURUMU</div>

                <h2 style={sectionTitleStyle}>Sipariş Dağılımı</h2>
              </div>
            </div>

            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    dataKey="value"
                    label
                  >
                    {orderStatusData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
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

                  <span style={statusPillStyle}>
                    {statusLabel(order.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
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
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 18,
};

const statCardStyle: CSSProperties = {
  background: "white",
  borderRadius: 20,
  padding: 22,
  display: "grid",
  gap: 10,
  boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
};

const statLabelStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 14,
};

const statValueStyle: CSSProperties = {
  fontSize: 28,
  fontWeight: 900,
};

const quickActionsStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 18,
};

const actionCardStyle: CSSProperties = {
  background: "white",
  borderRadius: 20,
  padding: 22,
  display: "grid",
  gap: 8,
  textDecoration: "none",
  color: "#0f172a",
  boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
};

const tableSectionStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
};

const sectionHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
};

const eyebrowDarkStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 6,
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 28,
  fontWeight: 900,
};

const tableStyle: CSSProperties = {
  background: "white",
  borderRadius: 22,
  overflow: "hidden",
  boxShadow: "0 14px 30px rgba(15,23,42,0.06)",
};

const rowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
  gap: 12,
  padding: 18,
  borderBottom: "1px solid #e2e8f0",
  alignItems: "center",
};

const orderIdStyle: CSSProperties = {
  fontWeight: 800,
};

const statusPillStyle: CSSProperties = {
  background: "#dbeafe",
  color: "#1d4ed8",
  padding: "8px 12px",
  borderRadius: 999,
  fontWeight: 700,
  width: "fit-content",
};

const emptyCardStyle: CSSProperties = {
  background: "white",
  borderRadius: 24,
  padding: 40,
  textAlign: "center",
  boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
};

const emptyTableStyle: CSSProperties = {
  background: "white",
  borderRadius: 22,
  padding: 40,
  textAlign: "center",
};

const errorCardStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
  background: "#fee2e2",
  color: "#991b1b",
  padding: 18,
  borderRadius: 16,
  fontWeight: 700,
};
const chartGridStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
  gap: 18,
};

const chartCardStyle: CSSProperties = {
  background: "white",
  borderRadius: 24,
  padding: 24,
  boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
};

const chartHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
};

const chartTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 800,
  color: "#0f172a",
};

const chartSubStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 13,
  fontWeight: 700,
};
