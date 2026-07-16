import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { authFetch } from "../api";

type ShippingOrder = {
  id: string;
  status: string;
  trackingNo?: string | null;
  shippingCompany?: string | null;
  shippingRfq?: {
    fromAddress?: string | null;
    toAddress?: string | null;
  };
  shippingQuote?: {
    price?: number | string;
  };
  order?: {
    rfq?: {
      product?: {
        title?: string;
      };
    };
  };
};

type LogisticsDashboard = {
  openShippingRfqs: number;
  submittedQuotes: number;
  acceptedQuotes: number;
  pendingPickup: number;
  pickedUp: number;
  inTransit: number;
  activeShippingOrders: number;
  completedShippingOrders: number;
  totalShippingOrders: number;
  grossTransportAmount: number;
  recentShippingOrders: ShippingOrder[];
};

const emptyDashboard: LogisticsDashboard = {
  openShippingRfqs: 0,
  submittedQuotes: 0,
  acceptedQuotes: 0,
  pendingPickup: 0,
  pickedUp: 0,
  inTransit: 0,
  activeShippingOrders: 0,
  completedShippingOrders: 0,
  totalShippingOrders: 0,
  grossTransportAmount: 0,
  recentShippingOrders: [],
};

function money(value: number | string | undefined) {
  return `${Number(value || 0).toLocaleString("tr-TR")} ₺`;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING_PICKUP: "Yükleme Bekliyor",
    PICKED_UP: "Teslim Alındı",
    IN_TRANSIT: "Yolda",
    DELIVERED: "Teslim Edildi",
  };

  return labels[status] || status;
}

export default function LogisticsDashboardPage() {
  const [data, setData] = useState<LogisticsDashboard>(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const response = await authFetch("/dashboard/logistics");
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
          recentShippingOrders: Array.isArray(result?.recentShippingOrders)
            ? result.recentShippingOrders
            : [],
        });
      } catch (err: any) {
        console.error("Logistics dashboard error:", err);
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
          <h1 style={titleStyle}>Lojistik Dashboard</h1>
          <p style={subtitleStyle}>
            Açık yükleri, tekliflerinizi ve aktif taşımalarınızı yönetin.
          </p>
        </div>

        <Link to="/logistics/shipping" style={primaryLinkStyle}>
          Açık Yükleri Gör
        </Link>
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      <div style={statGridStyle}>
        <StatCard
          title="Açık Nakliye Talebi"
          value={data.openShippingRfqs}
          icon="📍"
        />
        <StatCard
          title="Verilen Teklif"
          value={data.submittedQuotes}
          icon="📝"
        />
        <StatCard
          title="Kabul Edilen Teklif"
          value={data.acceptedQuotes}
          icon="✅"
        />
        <StatCard
          title="Yükleme Bekleyen"
          value={data.pendingPickup}
          icon="📦"
        />
        <StatCard title="Yolda" value={data.inTransit} icon="🚚" />
        <StatCard
          title="Tamamlanan Taşıma"
          value={data.completedShippingOrders}
          icon="🏁"
        />
        <StatCard
          title="Aktif Taşıma"
          value={data.activeShippingOrders}
          icon="🛣️"
        />
        <StatCard
          title="Brüt Taşıma Tutarı"
          value={money(data.grossTransportAmount)}
          icon="₺"
        />
      </div>

      <div style={quickGridStyle}>
        <Link to="/logistics/shipping" style={quickCardStyle}>
          <span style={quickIconStyle}>🔎</span>
          <strong>Açık Yükler</strong>
          <small style={quickTextStyle}>
            Yeni nakliye taleplerini inceleyin
          </small>
        </Link>

        <Link to="/logistics/orders" style={quickCardStyle}>
          <span style={quickIconStyle}>🚚</span>
          <strong>Taşımalarım</strong>
          <small style={quickTextStyle}>
            Aktif taşıma süreçlerini güncelleyin
          </small>
        </Link>

        <Link to="/chat" style={quickCardStyle}>
          <span style={quickIconStyle}>💬</span>
          <strong>Mesajlar</strong>
          <small style={quickTextStyle}>
            Alıcı ve satıcılarla iletişim kurun
          </small>
        </Link>
      </div>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Son Taşımalar</h2>

        {data.recentShippingOrders.length === 0 ? (
          <div style={emptyStyle}>Henüz taşıma siparişi bulunmuyor.</div>
        ) : (
          <div style={listStyle}>
            {data.recentShippingOrders.map((order) => {
              const title = order.order?.rfq?.product?.title || "Ürün taşıması";

              const route = [
                order.shippingRfq?.fromAddress,
                order.shippingRfq?.toAddress,
              ]
                .filter(Boolean)
                .join(" → ");

              return (
                <div key={order.id} style={listItemStyle}>
                  <div>
                    <strong>{title}</strong>
                    <div style={mutedStyle}>
                      {route || "Güzergâh bilgisi bulunmuyor"}
                    </div>
                    <div style={mutedStyle}>
                      Teklif: {money(order.shippingQuote?.price)}
                    </div>
                  </div>

                  <span style={badgeStyle}>{statusLabel(order.status)}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div style={noticeStyle}>
        Brüt taşıma tutarı, kabul edilen taşıma siparişlerinin toplamıdır.
        Lojistik ödeme ve komisyon sistemi tamamlandığında net kazanç ayrıca
        gösterilecektir.
      </div>
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
  background: "#fef3c7",
  border: "1px solid #fde68a",
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
  background: "#fef3c7",
  color: "#92400e",
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

const noticeStyle: CSSProperties = {
  padding: 16,
  border: "1px solid #bae6fd",
  borderRadius: 12,
  background: "#e0f2fe",
  color: "#0c4a6e",
  lineHeight: 1.6,
};
