import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { authFetch } from "../api";
import { useTranslation } from "react-i18next";

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

function money(
  value: number | string | undefined,
  locale: string,
) {
  return `${Number(value || 0).toLocaleString(locale)} ₺`;
}

function statusLabel(status: string, t: any) {
  const labels: Record<string, string> = {
    PENDING_PICKUP: t("logisticsDashboardPage.statusPendingPickup"),
    PICKED_UP: t("logisticsDashboardPage.statusPickedUp"),
    IN_TRANSIT: t("logisticsDashboardPage.statusInTransit"),
    DELIVERED: t("logisticsDashboardPage.statusDelivered"),
  };

  return labels[status] || status;
}

export default function LogisticsDashboardPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";

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
              : result?.message || t("logisticsDashboardPage.loadFailed"),
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
        setError(err?.message || t("logisticsDashboardPage.loadFailed"));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <main style={pageStyle}>
        {t("logisticsDashboardPage.loading")}
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>
            {t("logisticsDashboardPage.title")}
          </h1>
          <p style={subtitleStyle}>
            {t("logisticsDashboardPage.subtitle")}
          </p>
        </div>

        <Link to="/logistics/shipping" style={primaryLinkStyle}>
          {t("logisticsDashboardPage.viewOpenLoads")}
        </Link>
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      <div style={statGridStyle}>
        <StatCard
          title={t("logisticsDashboardPage.openShippingRequests")}
          value={data.openShippingRfqs}
          icon="📍"
        />
        <StatCard
          title={t("logisticsDashboardPage.submittedQuotes")}
          value={data.submittedQuotes}
          icon="📝"
        />
        <StatCard
          title={t("logisticsDashboardPage.acceptedQuotes")}
          value={data.acceptedQuotes}
          icon="✅"
        />
        <StatCard
          title={t("logisticsDashboardPage.pendingPickup")}
          value={data.pendingPickup}
          icon="📦"
        />
        <StatCard
          title={t("logisticsDashboardPage.inTransit")}
          value={data.inTransit}
          icon="🚚"
        />
        <StatCard
          title={t("logisticsDashboardPage.completedTransport")}
          value={data.completedShippingOrders}
          icon="🏁"
        />
        <StatCard
          title={t("logisticsDashboardPage.activeTransport")}
          value={data.activeShippingOrders}
          icon="🛣️"
        />
        <StatCard
          title={t("logisticsDashboardPage.grossTransportAmount")}
          value={money(data.grossTransportAmount, locale)}
          icon="₺"
        />
      </div>

      <div style={quickGridStyle}>
        <Link to="/logistics/shipping" style={quickCardStyle}>
          <span style={quickIconStyle}>🔎</span>
          <strong>{t("logisticsDashboardPage.openLoads")}</strong>
          <small style={quickTextStyle}>
            {t("logisticsDashboardPage.openLoadsText")}
          </small>
        </Link>

        <Link to="/logistics/orders" style={quickCardStyle}>
          <span style={quickIconStyle}>🚚</span>
          <strong>{t("logisticsDashboardPage.myTransports")}</strong>
          <small style={quickTextStyle}>
            {t("logisticsDashboardPage.myTransportsText")}
          </small>
        </Link>

        <Link to="/chat" style={quickCardStyle}>
          <span style={quickIconStyle}>💬</span>
          <strong>{t("logisticsDashboardPage.messages")}</strong>
          <small style={quickTextStyle}>
            {t("logisticsDashboardPage.messagesText")}
          </small>
        </Link>
      </div>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          {t("logisticsDashboardPage.recentTransports")}
        </h2>

        {data.recentShippingOrders.length === 0 ? (
          <div style={emptyStyle}>
            {t("logisticsDashboardPage.noTransports")}
          </div>
        ) : (
          <div style={listStyle}>
            {data.recentShippingOrders.map((order) => {
              const title =
                order.order?.rfq?.product?.title ||
                t("logisticsDashboardPage.productTransport");

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
                      {route || t("logisticsDashboardPage.noRoute")}
                    </div>
                    <div style={mutedStyle}>
                      {t("logisticsDashboardPage.quote")}:{" "}
                      {money(order.shippingQuote?.price, locale)}
                    </div>
                  </div>

                  <span style={badgeStyle}>
                    {statusLabel(order.status, t)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div style={noticeStyle}>
        {t("logisticsDashboardPage.notice")}
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
