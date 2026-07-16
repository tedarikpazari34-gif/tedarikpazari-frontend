import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { authFetch } from "../api";

type RecentOrder = {
  id: string;
  status: string;
  totalAmount?: number | string;
};

type RecentShippingOrder = {
  id: string;
  status: string;
  trackingNo?: string | null;
  shippingCompany?: string | null;
};

type BuyerDashboard = {
  openRfqs: number;
  closedRfqs: number;
  totalRfqs: number;
  receivedQuotes: number;
  pendingPaymentOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalOrders: number;
  totalPurchases: number;
  shippingRequests: number;
  activeShippingOrders: number;
  completedShippingOrders: number;
  recentOrders: RecentOrder[];
  recentShippingOrders: RecentShippingOrder[];
};

const emptyDashboard: BuyerDashboard = {
  openRfqs: 0,
  closedRfqs: 0,
  totalRfqs: 0,
  receivedQuotes: 0,
  pendingPaymentOrders: 0,
  activeOrders: 0,
  completedOrders: 0,
  totalOrders: 0,
  totalPurchases: 0,
  shippingRequests: 0,
  activeShippingOrders: 0,
  completedShippingOrders: 0,
  recentOrders: [],
  recentShippingOrders: [],
};

function money(value: number | string | undefined) {
  return `${Number(value || 0).toLocaleString("tr-TR")} ₺`;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING_PAYMENT: "Ödeme Bekliyor",
    PAID: "Ödendi",
    PREPARING: "Hazırlanıyor",
    SHIPPED: "Kargoda",
    COMPLETED: "Tamamlandı",
    CANCELLED: "İptal Edildi",
    PENDING_PICKUP: "Yükleme Bekliyor",
    PICKED_UP: "Teslim Alındı",
    IN_TRANSIT: "Yolda",
    DELIVERED: "Teslim Edildi",
  };

  return labels[status] || status;
}

export default function BuyerDashboardPage() {
  const [data, setData] = useState<BuyerDashboard>(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const response = await authFetch("/dashboard/buyer");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            Array.isArray(result?.message)
              ? result.message.join(", ")
              : result?.message || "Dashboard verileri alınamadı",
          );
        }

        setData({
          ...emptyDashboard,
          ...result,
          recentOrders: Array.isArray(result?.recentOrders)
            ? result.recentOrders
            : [],
          recentShippingOrders: Array.isArray(result?.recentShippingOrders)
            ? result.recentShippingOrders
            : [],
        });
      } catch (err: any) {
        console.error("Buyer dashboard error:", err);
        setError(err?.message || "Dashboard verileri alınamadı");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <main style={pageStyle}>Dashboard yükleniyor...</main>;
  }

  return (
    <main style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Alıcı Dashboard</h1>
          <p style={subtitleStyle}>
            Satın alma, teklif ve nakliye süreçlerinizi tek ekrandan yönetin.
          </p>
        </div>

        <Link to="/products" style={primaryLinkStyle}>
          Ürünleri İncele
        </Link>
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      <div style={statGridStyle}>
        <StatCard title="Açık RFQ" value={data.openRfqs} icon="📋" />
        <StatCard title="Gelen Teklif" value={data.receivedQuotes} icon="💬" />
        <StatCard
          title="Ödeme Bekleyen"
          value={data.pendingPaymentOrders}
          icon="💳"
        />
        <StatCard title="Aktif Sipariş" value={data.activeOrders} icon="📦" />
        <StatCard
          title="Tamamlanan Sipariş"
          value={data.completedOrders}
          icon="✅"
        />
        <StatCard
          title="Toplam Satın Alma"
          value={money(data.totalPurchases)}
          icon="₺"
        />
        <StatCard
          title="Nakliye Talebi"
          value={data.shippingRequests}
          icon="🚚"
        />
        <StatCard
          title="Aktif Taşıma"
          value={data.activeShippingOrders}
          icon="🛣️"
        />
      </div>

      <div style={quickGridStyle}>
        <Link to="/products" style={quickCardStyle}>
          <span style={quickIconStyle}>🔎</span>
          <strong>Ürün Ara</strong>
          <small style={quickTextStyle}>
            Tedarikçilerin ürünlerini inceleyin
          </small>
        </Link>

        <Link to="/buyer/orders" style={quickCardStyle}>
          <span style={quickIconStyle}>📦</span>
          <strong>Siparişlerim</strong>
          <small style={quickTextStyle}>
            Sipariş ve ödeme durumlarını takip edin
          </small>
        </Link>

        <Link to="/buyer/shipping-quotes" style={quickCardStyle}>
          <span style={quickIconStyle}>🚛</span>
          <strong>Nakliye Teklifleri</strong>
          <small style={quickTextStyle}>
            Lojistik firmalarının tekliflerini görün
          </small>
        </Link>

        <Link to="/chat" style={quickCardStyle}>
          <span style={quickIconStyle}>💬</span>
          <strong>Mesajlar</strong>
          <small style={quickTextStyle}>Ticari görüşmelerinizi yönetin</small>
        </Link>
      </div>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Son Siparişler</h2>

        {data.recentOrders.length === 0 ? (
          <div style={emptyStyle}>Henüz sipariş bulunmuyor.</div>
        ) : (
          <div style={listStyle}>
            {data.recentOrders.map((order) => (
              <div key={order.id} style={listItemStyle}>
                <div>
                  <strong>Sipariş #{order.id.slice(-8)}</strong>
                  <div style={mutedStyle}>{money(order.totalAmount)}</div>
                </div>

                <span style={badgeStyle}>{statusLabel(order.status)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Son Taşımalar</h2>

        {data.recentShippingOrders.length === 0 ? (
          <div style={emptyStyle}>Henüz aktif taşıma bulunmuyor.</div>
        ) : (
          <div style={listStyle}>
            {data.recentShippingOrders.map((order) => (
              <div key={order.id} style={listItemStyle}>
                <div>
                  <strong>
                    {order.shippingCompany || "Lojistik taşıması"}
                  </strong>
                  <div style={mutedStyle}>
                    Takip: {order.trackingNo || "Henüz oluşturulmadı"}
                  </div>
                </div>

                <span style={badgeStyle}>{statusLabel(order.status)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number | string;
  icon: string;
}) {
  return (
    <div style={statCardStyle}>
      <div style={statTopStyle}>
        <span style={statLabelStyle}>{title}</span>
        <span style={statIconStyle}>{icon}</span>
      </div>
      <div style={statValueStyle}>{value}</div>
    </div>
  );
}

const pageStyle: CSSProperties = {
  maxWidth: 1280,
  margin: "0 auto",
  padding: "32px 20px 80px",
  minHeight: "100vh",
  background: "#f8fafc",
  color: "#0f172a",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  flexWrap: "wrap",
  marginBottom: 24,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(28px, 4vw, 38px)",
  fontWeight: 800,
};

const subtitleStyle: CSSProperties = {
  margin: "8px 0 0",
  color: "#64748b",
};

const primaryLinkStyle: CSSProperties = {
  textDecoration: "none",
  background: "#0f172a",
  color: "#fff",
  padding: "12px 18px",
  borderRadius: 12,
  fontWeight: 700,
};

const errorStyle: CSSProperties = {
  padding: 14,
  borderRadius: 12,
  background: "#fee2e2",
  color: "#991b1b",
  marginBottom: 20,
};

const statGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
  gap: 16,
  marginBottom: 24,
};

const statCardStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
};

const statTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
};

const statLabelStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 14,
  fontWeight: 600,
};

const statIconStyle: CSSProperties = {
  fontSize: 22,
};

const statValueStyle: CSSProperties = {
  marginTop: 12,
  fontSize: 28,
  fontWeight: 800,
};

const quickGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
  marginBottom: 24,
};

const quickCardStyle: CSSProperties = {
  textDecoration: "none",
  color: "#0f172a",
  display: "flex",
  flexDirection: "column",
  gap: 7,
  background: "#e0f2fe",
  border: "1px solid #bae6fd",
  borderRadius: 16,
  padding: 18,
};

const quickIconStyle: CSSProperties = {
  fontSize: 26,
};

const quickTextStyle: CSSProperties = {
  color: "#475569",
  lineHeight: 1.5,
};

const sectionStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 20,
  marginBottom: 20,
};

const sectionTitleStyle: CSSProperties = {
  margin: "0 0 16px",
  fontSize: 20,
};

const listStyle: CSSProperties = {
  display: "grid",
  gap: 10,
};

const listItemStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 14,
  padding: 14,
  border: "1px solid #e2e8f0",
  borderRadius: 12,
};

const mutedStyle: CSSProperties = {
  marginTop: 5,
  color: "#64748b",
  fontSize: 14,
};

const badgeStyle: CSSProperties = {
  background: "#dbeafe",
  color: "#1d4ed8",
  borderRadius: 999,
  padding: "6px 10px",
  fontSize: 12,
  fontWeight: 700,
  textAlign: "center",
};

const emptyStyle: CSSProperties = {
  padding: 16,
  borderRadius: 12,
  background: "#f8fafc",
  color: "#64748b",
};
