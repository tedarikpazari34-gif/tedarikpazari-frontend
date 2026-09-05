import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { authFetch } from "../api";
import { useTranslation } from "react-i18next";

type RecentOrder = {
  id: string;
  status: string;
  totalAmount?: number | string;
  payoutAmount?: number | string;
};

type SellerDashboard = {
  activeProducts: number;
  totalProducts: number;
  openRfqs: number;
  sentQuotes: number;
  activeOrders: number;
  completedOrders: number;
  totalOrders: number;
  grossSales: number;
  totalPayout: number;
  walletAvailable: number;
  walletLocked: number;
  recentOrders: RecentOrder[];
};

const emptyDashboard: SellerDashboard = {
  activeProducts: 0,
  totalProducts: 0,
  openRfqs: 0,
  sentQuotes: 0,
  activeOrders: 0,
  completedOrders: 0,
  totalOrders: 0,
  grossSales: 0,
  totalPayout: 0,
  walletAvailable: 0,
  walletLocked: 0,
  recentOrders: [],
};

function money(
  value: number | string | undefined,
  locale: string,
) {
  return `${Number(value || 0).toLocaleString(locale)} ₺`;
}

function statusLabel(status: string, t: any) {
  const labels: Record<string, string> = {
    PENDING_PAYMENT: t("sellerDashboardPage.pendingPayment"),
    PAID: t("sellerDashboardPage.paid"),
    PREPARING: t("sellerDashboardPage.preparing"),
    SHIPPED: t("sellerDashboardPage.shipped"),
    COMPLETED: t("sellerDashboardPage.completed"),
    CANCELLED: t("sellerDashboardPage.cancelled"),
  };

  return labels[status] || status;
}

export default function SellerDashboardPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";

  const [data, setData] = useState<SellerDashboard>(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const response = await authFetch("/dashboard/seller");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            Array.isArray(result?.message)
              ? result.message.join(", ")
              : result?.message || t("sellerDashboardPage.loadFailed"),
          );
        }

        setData({
          ...emptyDashboard,
          ...result,
          recentOrders: Array.isArray(result?.recentOrders)
            ? result.recentOrders
            : [],
        });
      } catch (err: any) {
        console.error("Seller dashboard error:", err);
        setError(err?.message || t("sellerDashboardPage.loadFailed"));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <main style={pageStyle}>
        {t("sellerDashboardPage.loading")}
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>{t("sellerDashboardPage.title")}</h1>
          <p style={subtitleStyle}>
            {t("sellerDashboardPage.subtitle")}
          </p>
        </div>

        <Link to="/seller/products/new" style={primaryLinkStyle}>
          {t("sellerDashboardPage.addProduct")}
        </Link>
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      <div style={statGridStyle}>
        <StatCard
          title={t("sellerDashboardPage.activeProducts")}
          value={data.activeProducts}
          icon="🏷️"
        />
        <StatCard
          title={t("sellerDashboardPage.openRfqs")}
          value={data.openRfqs}
          icon="📋"
        />
        <StatCard
          title={t("sellerDashboardPage.sentQuotes")}
          value={data.sentQuotes}
          icon="💬"
        />
        <StatCard
          title={t("sellerDashboardPage.activeOrders")}
          value={data.activeOrders}
          icon="📦"
        />
        <StatCard
          title={t("sellerDashboardPage.completedOrders")}
          value={data.completedOrders}
          icon="✅"
        />
        <StatCard
          title={t("sellerDashboardPage.grossSales")}
          value={money(data.grossSales, locale)}
          icon="₺"
        />
        <StatCard
          title={t("sellerDashboardPage.totalPayout")}
          value={money(data.totalPayout, locale)}
          icon="💰"
        />
        <StatCard
          title={t("sellerDashboardPage.availableBalance")}
          value={money(data.walletAvailable, locale)}
          icon="👛"
        />
      </div>

      <div style={quickGridStyle}>
        <Link to="/seller/products" style={quickCardStyle}>
          <span style={quickIconStyle}>🏷️</span>
          <strong>{t("sellerDashboardPage.myProducts")}</strong>
          <small style={quickTextStyle}>
            {t("sellerDashboardPage.manageProducts")}
          </small>
        </Link>

        <Link to="/seller/quotes" style={quickCardStyle}>
          <span style={quickIconStyle}>📝</span>
          <strong>{t("sellerDashboardPage.myQuotes")}</strong>
          <small style={quickTextStyle}>
            {t("sellerDashboardPage.trackQuotes")}
          </small>
        </Link>

        <Link to="/seller/orders" style={quickCardStyle}>
          <span style={quickIconStyle}>📦</span>
          <strong>{t("sellerDashboardPage.myOrders")}</strong>
          <small style={quickTextStyle}>
            {t("sellerDashboardPage.updateOrders")}
          </small>
        </Link>

        <Link to="/wallet" style={quickCardStyle}>
          <span style={quickIconStyle}>💳</span>
          <strong>{t("sellerDashboardPage.wallet")}</strong>
          <small style={quickTextStyle}>
            {t("sellerDashboardPage.viewWallet")}
          </small>
        </Link>
      </div>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          {t("sellerDashboardPage.financialSummary")}
        </h2>

        <div style={financeGridStyle}>
          <div style={financeCardStyle}>
            <span style={mutedStyle}>
              {t("sellerDashboardPage.grossSalesLower")}
            </span>
            <strong style={financeValueStyle}>
              {money(data.grossSales, locale)}
            </strong>
          </div>

          <div style={financeCardStyle}>
            <span style={mutedStyle}>
              {t("sellerDashboardPage.totalPayoutLower")}
            </span>
            <strong style={financeValueStyle}>
              {money(data.totalPayout, locale)}
            </strong>
          </div>

          <div style={financeCardStyle}>
            <span style={mutedStyle}>
              {t("sellerDashboardPage.lockedBalance")}
            </span>
            <strong style={financeValueStyle}>
              {money(data.walletLocked, locale)}
            </strong>
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          {t("sellerDashboardPage.recentOrders")}
        </h2>

        {data.recentOrders.length === 0 ? (
          <div style={emptyStyle}>
            {t("sellerDashboardPage.noOrders")}
          </div>
        ) : (
          <div style={listStyle}>
            {data.recentOrders.map((order) => (
              <div key={order.id} style={listItemStyle}>
                <div>
                  <strong>
                    {t("sellerDashboardPage.order", {
                      id: order.id.slice(-8),
                    })}
                  </strong>
                  <div style={mutedStyle}>
                    {money(order.totalAmount, locale)}
                  </div>
                </div>

                <span style={badgeStyle}>
                  {statusLabel(order.status, t)}
                </span>
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
  background: "#dcfce7",
  border: "1px solid #bbf7d0",
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

const financeGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
  gap: 14,
};

const financeCardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: 16,
  borderRadius: 12,
  background: "#f8fafc",
};

const financeValueStyle: CSSProperties = {
  fontSize: 22,
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
  color: "#64748b",
  fontSize: 14,
};

const badgeStyle: CSSProperties = {
  background: "#dcfce7",
  color: "#166534",
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
