import { useEffect, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";

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
type AdminOverview = {
  companies: {
    total: number;
    pending: number;
    approved: number;
    blocked: number;
  };
  users: {
    total: number;
  };
  marketplace: {
    productsTotal: number;
    productsApproved: number;
    productsPending: number;
    rfqsTotal: number;
    quotesTotal: number;
    disputesOpen: number;
    payoutsPending: number;
  };
  orders: {
    total: number;
    pendingPayment: number;
    paid: number;
    preparing: number;
    shipped: number;
    completed: number;
  };
  finance: {
    escrowDepositedTotal: number | string;
    commissionTotal: number | string;
    walletAvailableTotal: number | string;
    walletLockedTotal: number | string;
  };
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

function formatMoney(value: number | string, locale: string) {
  return `${Number(value || 0).toLocaleString(locale)} ₺`;
}

function statusLabel(status: string | undefined, t: any) {
  if (status === "PENDING_PAYMENT") return t("adminDashboardPage.statusPendingPayment");
  if (status === "PAID") return t("adminDashboardPage.statusPaid");
  if (status === "PREPARING") return t("adminDashboardPage.statusPreparing");
  if (status === "SHIPPED") return t("adminDashboardPage.statusShipped");
  if (status === "COMPLETED") return t("adminDashboardPage.statusCompleted");
  if (status === "OPEN") return t("adminDashboardPage.statusOpen");
  return status || "-";
}

export default function AdminDashboardPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";

  const [orders, setOrders] = useState<Order[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError(t("adminDashboardPage.loginRequired"));
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [metricsRes, overviewRes, ordersRes, rfqsRes] = await Promise.all([
        fetch(`${API}/dashboard/admin`, { headers }),
        fetch(`${API}/admin/metrics/overview`, { headers }),
        fetch(`${API}/orders`, { headers }),
        fetch(`${API}/rfqs/open`, { headers }),
      ]);

      const metricsData = await metricsRes.json();

      if (metricsRes.ok) {
        setMetrics(metricsData);
      }

      const overviewData = await overviewRes.json();

      if (overviewRes.ok) {
        setOverview(overviewData);
      } else {
        console.error("ADMIN OVERVIEW ERROR:", overviewData);
        setOverview(null);
      }

      const ordersData = await ordersRes.json();
      const rfqsData = await rfqsRes.json();

      if (!ordersRes.ok) {
        setError(ordersData?.message || t("adminDashboardPage.ordersLoadFailed"));
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
      setError(t("adminDashboardPage.dataLoadFailed"));
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
      name: t("adminDashboardPage.chartOrder"),
      revenue: totalRevenue,
      commission: totalCommission,
    },
  ];

  const otherOrders = Math.max(0, orders.length - paidOrders - completedOrders);

  const orderStatusData = [
    {
      name: t("adminDashboardPage.chartPaid"),
      value: paidOrders,
    },
    {
      name: t("adminDashboardPage.chartCompleted"),
      value: completedOrders,
    },
    {
      name: t("adminDashboardPage.chartOther"),
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
          <div style={emptyCardStyle}>{t("adminDashboardPage.loading")}</div>
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
            <div style={eyebrowStyle}>{t("adminDashboardPage.eyebrow")}</div>

            <h1 style={titleStyle}>{t("adminDashboardPage.title")}</h1>

            <p style={descStyle}>
              {t("adminDashboardPage.description")}
            </p>
          </div>

          <div style={heroAmountStyle}>
            <span>{t("adminDashboardPage.totalVolume")}</span>

            <strong>{formatMoney(totalRevenue, locale)}</strong>
          </div>
        </section>

        {error && <div style={errorCardStyle}>{error}</div>}

        <section style={priorityStatsStyle}>
          <PriorityStat
            label={t("adminDashboardPage.pendingCompany")}
            value={overview?.companies.pending ?? 0}
            to="/admin/companies"
            tone="warning"
          />

          <PriorityStat
            label={t("adminDashboardPage.pendingProduct")}
            value={overview?.marketplace.productsPending ?? 0}
            to="/admin/products"
            tone="warning"
          />

          <PriorityStat
            label={t("adminDashboardPage.openDispute")}
            value={overview?.marketplace.disputesOpen ?? 0}
            to="/admin/disputes"
            tone="danger"
          />

          <PriorityStat
            label={t("adminDashboardPage.pendingPayout")}
            value={overview?.marketplace.payoutsPending ?? 0}
            to="/admin/payouts"
            tone="money"
          />

          <PriorityStat
            label={t("adminDashboardPage.totalOrders")}
            value={overview?.orders.total ?? totalOrders}
            to="/admin/finance"
            tone="info"
          />

          <PriorityStat
            label={t("adminDashboardPage.escrowVolume")}
            value={formatMoney(
              overview?.finance.escrowDepositedTotal ?? totalRevenue,
              locale,
            )}
            to="/admin/finance"
            tone="money"
          />
        </section>

        <section style={statsStyle}>
          <Stat label={t("adminDashboardPage.totalRfqs")} value={metrics?.totalRfqs ?? rfqs.length} />

          <Stat label={t("adminDashboardPage.activeRfqs")} value={activeRfqs} />

          <Stat label={t("adminDashboardPage.totalOrders")} value={totalOrders} />

          <Stat label={t("adminDashboardPage.paidOrders")} value={paidOrders} />

          <Stat label={t("adminDashboardPage.completed")} value={completedOrders} />

          <Stat
            label={t("adminDashboardPage.commission")}
            value={formatMoney(totalCommission, locale)}
            highlight
          />
          <Stat label={t("adminDashboardPage.companies")} value={metrics?.totalCompanies ?? "-"} />
          <Stat label={t("adminDashboardPage.products")} value={metrics?.totalProducts ?? "-"} />
          <Stat label={t("adminDashboardPage.disputes")} value={metrics?.disputes ?? "-"} />
        </section>

        <section style={quickActionsStyle}>
          <Link to="/admin/companies" style={actionCardStyle}>
            <strong>{t("adminDashboardPage.companyApprovals")}</strong>

            <span>{t("adminDashboardPage.companyApprovalsText")}</span>
          </Link>

          <Link to="/admin/products" style={actionCardStyle}>
            <strong>{t("adminDashboardPage.productManagement")}</strong>

            <span>{t("adminDashboardPage.productManagementText")}</span>
          </Link>
          <Link to="/admin/chat-moderation" style={actionCardStyle}>
            <strong>{t("adminDashboardPage.chatModeration")}</strong>
            <span>
              {t("adminDashboardPage.chatModerationText")}
            </span>
          </Link>
          <Link to="/admin/payouts" style={actionCardStyle}>
            <strong>{t("adminDashboardPage.payoutManagement")}</strong>

            <span>{t("adminDashboardPage.payoutManagementText")}</span>
          </Link>

          <Link to="/admin/disputes" style={actionCardStyle}>
            <strong>{t("adminDashboardPage.disputeManagement")}</strong>

            <span>{t("adminDashboardPage.disputeManagementText")}</span>
          </Link>

          <Link to="/admin/finance" style={actionCardStyle}>
            <strong>{t("adminDashboardPage.financeDashboard")}</strong>

            <span>{t("adminDashboardPage.financeDashboardText")}</span>
          </Link>
        </section>
        <section style={chartGridStyle}>
          <div style={chartCardStyle}>
            <div style={chartHeaderStyle}>
              <div>
                <div style={eyebrowDarkStyle}>{t("adminDashboardPage.revenueAnalytics")}</div>

                <h2 style={sectionTitleStyle}>{t("adminDashboardPage.platformRevenue")}</h2>
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
                <div style={eyebrowDarkStyle}>{t("adminDashboardPage.orderStatus")}</div>

                <h2 style={sectionTitleStyle}>{t("adminDashboardPage.orderDistribution")}</h2>
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
              <div style={eyebrowDarkStyle}>{t("adminDashboardPage.latestActivity")}</div>

              <h2 style={sectionTitleStyle}>{t("adminDashboardPage.latestOrders")}</h2>
            </div>
          </div>

          {orders.length === 0 ? (
            <div style={emptyTableStyle}>{t("adminDashboardPage.noOrders")}</div>
          ) : (
            <div style={tableStyle}>
              {orders.slice(0, 10).map((order) => (
                <div key={order.id} style={rowStyle}>
                  <span style={orderIdStyle}>#{order.id.slice(0, 8)}</span>

                  <span>{formatMoney(order.totalAmount || 0, locale)}</span>

                  <span>{formatMoney(order.commissionAmount || 0, locale)}</span>

                  <span style={statusPillStyle}>
                    {statusLabel(order.status, t)}
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

function PriorityStat({
  label,
  value,
  to,
  tone,
}: {
  label: string;
  value: string | number;
  to: string;
  tone: "warning" | "danger" | "money" | "info";
}) {
  const { t } = useTranslation();

  const tones = {
    warning: {
      background: "#fffbeb",
      border: "#f59e0b",
      color: "#92400e",
    },
    danger: {
      background: "#fef2f2",
      border: "#ef4444",
      color: "#991b1b",
    },
    money: {
      background: "#f0fdf4",
      border: "#22c55e",
      color: "#166534",
    },
    info: {
      background: "#eff6ff",
      border: "#2563eb",
      color: "#1d4ed8",
    },
  };

  const selectedTone = tones[tone];

  return (
    <Link
      to={to}
      style={{
        ...priorityStatCardStyle,
        background: selectedTone.background,
        borderColor: selectedTone.border,
        color: selectedTone.color,
      }}
    >
      <span style={priorityStatLabelStyle}>{label}</span>
      <strong style={priorityStatValueStyle}>{value}</strong>
      <span style={priorityStatLinkStyle}>{t("adminDashboardPage.manage")}</span>
    </Link>
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

const priorityStatsStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 18,
};

const priorityStatCardStyle: CSSProperties = {
  border: "1px solid",
  borderRadius: 20,
  padding: 22,
  display: "grid",
  gap: 10,
  textDecoration: "none",
  boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
};

const priorityStatLabelStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
};

const priorityStatValueStyle: CSSProperties = {
  fontSize: 30,
  fontWeight: 900,
};

const priorityStatLinkStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
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
