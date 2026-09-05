import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import AdminSidebar from "../components/admin/AdminSidebar";

const API =
  import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api";

type SystemStatus =
  "UP" | "DOWN" | "STARTING" | "CONFIGURED" | "NOT_CONFIGURED";

type ControlCenterData = {
  checkedAt: string;
  systems: {
    backend: {
      status: SystemStatus;
      message: string;
    };
    database: {
      status: SystemStatus;
      message: string;
      error?: string | null;
    };
    mail: {
      status: SystemStatus;
      message: string;
      missingVariables?: string[];
    };
    websocket: {
      status: SystemStatus;
      message: string;
      onlineUsers: number;
    };
  };
  actions: {
    pendingCompanies: number;
    pendingProducts: number;
    openDisputes: number;
    pendingPayouts: number;
    flaggedMessages: number;
    total: number;
  };
};

type SystemCardProps = {
  title: string;
  status: SystemStatus;
  message: string;
  detail?: string;
};

type ActionCardProps = {
  title: string;
  value: number;
  description: string;
  to: string;
};

function isHealthy(status: SystemStatus) {
  return status === "UP" || status === "CONFIGURED";
}

function getStatusText(status: SystemStatus, t: any) {
  switch (status) {
    case "UP":
      return t("adminControlCenterPage.statusUp");
    case "CONFIGURED":
      return t("adminControlCenterPage.statusConfigured");
    case "STARTING":
      return t("adminControlCenterPage.statusStarting");
    case "NOT_CONFIGURED":
      return t("adminControlCenterPage.statusNotConfigured");
    case "DOWN":
      return t("adminControlCenterPage.statusDown");
    default:
      return status;
  }
}

function SystemCard({ title, status, message, detail }: SystemCardProps) {
  const { t } = useTranslation();
  const healthy = isHealthy(status);
  const warning = status === "STARTING" || status === "NOT_CONFIGURED";

  return (
    <article
      style={{
        ...cardStyle,
        borderColor: healthy ? "#bbf7d0" : warning ? "#fde68a" : "#fecaca",
      }}
    >
      <div style={cardHeaderStyle}>
        <h3 style={cardTitleStyle}>{title}</h3>

        <span
          style={{
            ...statusBadgeStyle,
            background: healthy ? "#dcfce7" : warning ? "#fef3c7" : "#fee2e2",
            color: healthy ? "#166534" : warning ? "#92400e" : "#b91c1c",
          }}
        >
          {healthy ? "●" : warning ? "▲" : "●"} {getStatusText(status, t)}
        </span>
      </div>

      <p style={messageStyle}>{message}</p>

      {detail ? <p style={detailStyle}>{detail}</p> : null}
    </article>
  );
}

function ActionCard({ title, value, description, to }: ActionCardProps) {
  const hasAction = value > 0;

  return (
    <Link
      to={to}
      style={{
        ...actionCardStyle,
        borderColor: hasAction ? "#fed7aa" : "#e2e8f0",
      }}
    >
      <div>
        <div style={actionTitleStyle}>{title}</div>
        <div style={actionDescriptionStyle}>{description}</div>
      </div>

      <div
        style={{
          ...actionValueStyle,
          background: hasAction ? "#fff7ed" : "#f1f5f9",
          color: hasAction ? "#c2410c" : "#475569",
        }}
      >
        {value}
      </div>
    </Link>
  );
}

export default function AdminControlCenterPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";

  const [data, setData] = useState<ControlCenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadControlCenter = useCallback(async (manualRefresh = false) => {
    try {
      manualRefresh ? setRefreshing(true) : setLoading(true);

      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API}/admin/control-center`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message || t("adminControlCenterPage.dataLoadFailed"),
        );
      }

      setData(result);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : t("adminControlCenterPage.unexpectedError"),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    loadControlCenter();
  }, [loadControlCenter]);

  const systemCritical =
    data?.systems.database.status === "DOWN" ||
    data?.systems.backend.status === "DOWN";

  const systemWarning =
    data &&
    !systemCritical &&
    (data.systems.mail.status === "NOT_CONFIGURED" ||
      data.systems.websocket.status === "STARTING" ||
      data.actions.total > 0);

  const overallStatus = systemCritical
    ? {
        title: t("adminControlCenterPage.criticalTitle"),
        description: t("adminControlCenterPage.criticalDescription"),
        background: "#fef2f2",
        border: "#fecaca",
        color: "#b91c1c",
      }
    : systemWarning
      ? {
          title: t("adminControlCenterPage.warningTitle"),
          description: t("adminControlCenterPage.warningDescription"),
          background: "#fffbeb",
          border: "#fde68a",
          color: "#92400e",
        }
      : {
          title: t("adminControlCenterPage.healthyTitle"),
          description: t("adminControlCenterPage.healthyDescription"),
          background: "#f0fdf4",
          border: "#bbf7d0",
          color: "#166534",
        };

  return (
    <div style={layoutStyle}>
      <AdminSidebar />

      <main style={pageStyle}>
        <header style={headerStyle}>
          <div>
            <div style={eyebrowStyle}>{t("adminControlCenterPage.eyebrow")}</div>

            <h1 style={titleStyle}>{t("adminControlCenterPage.title")}</h1>

            <p style={subtitleStyle}>
              {t("adminControlCenterPage.subtitle")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadControlCenter(true)}
            disabled={loading || refreshing}
            style={{
              ...refreshButtonStyle,
              opacity: loading || refreshing ? 0.65 : 1,
              cursor: loading || refreshing ? "not-allowed" : "pointer",
            }}
          >
            {refreshing
              ? t("adminControlCenterPage.refreshing")
              : t("adminControlCenterPage.refresh")}
          </button>
        </header>

        {loading ? (
          <div style={stateBoxStyle}>{t("adminControlCenterPage.checking")}</div>
        ) : error ? (
          <div style={errorBoxStyle}>
            <strong>{t("adminControlCenterPage.couldNotLoad")}</strong>
            <span>{error}</span>

            <button
              type="button"
              onClick={() => loadControlCenter()}
              style={retryButtonStyle}
            >
              {t("adminControlCenterPage.retry")}
            </button>
          </div>
        ) : data ? (
          <>
            <section
              style={{
                ...overallStyle,
                background: overallStatus.background,
                borderColor: overallStatus.border,
                color: overallStatus.color,
              }}
            >
              <div>
                <div style={overallLabelStyle}>
                  {t("adminControlCenterPage.overallStatus")}
                </div>

                <h2 style={overallTitleStyle}>{overallStatus.title}</h2>

                <p style={overallDescriptionStyle}>
                  {overallStatus.description}
                </p>
              </div>

              <div style={totalActionStyle}>
                <strong>{data.actions.total}</strong>
                <span>
                  {t("adminControlCenterPage.pendingActions", {
                    count: data.actions.total,
                  })}
                </span>
              </div>
            </section>

            <section style={sectionStyle}>
              <div style={sectionHeaderStyle}>
                <div>
                  <div style={sectionEyebrowStyle}>
                    {t("adminControlCenterPage.infrastructure")}
                  </div>
                  <h2 style={sectionTitleStyle}>
                    {t("adminControlCenterPage.systemStatus")}
                  </h2>
                </div>

                <span style={checkTimeStyle}>
                  {t("adminControlCenterPage.lastCheck", {
                    date: new Date(data.checkedAt).toLocaleString(locale),
                  })}
                </span>
              </div>

              <div style={systemGridStyle}>
                <SystemCard
                  title={t("adminControlCenterPage.backend")}
                  status={data.systems.backend.status}
                  message={data.systems.backend.message}
                />

                <SystemCard
                  title={t("adminControlCenterPage.database")}
                  status={data.systems.database.status}
                  message={data.systems.database.message}
                  detail={data.systems.database.error || undefined}
                />

                <SystemCard
                  title={t("adminControlCenterPage.mail")}
                  status={data.systems.mail.status}
                  message={data.systems.mail.message}
                  detail={
                    data.systems.mail.missingVariables?.length
                      ? t("adminControlCenterPage.missingVariables", {
                          variables: data.systems.mail.missingVariables.join(", "),
                        })
                      : undefined
                  }
                />

                <SystemCard
                  title={t("adminControlCenterPage.websocket")}
                  status={data.systems.websocket.status}
                  message={data.systems.websocket.message}
                  detail={t("adminControlCenterPage.onlineUsers", {
                    count: data.systems.websocket.onlineUsers,
                  })}
                />
              </div>
            </section>

            <section style={sectionStyle}>
              <div style={sectionHeaderStyle}>
                <div>
                  <div style={sectionEyebrowStyle}>
                    {t("adminControlCenterPage.operation")}
                  </div>
                  <h2 style={sectionTitleStyle}>
                    {t("adminControlCenterPage.pendingWork")}
                  </h2>
                </div>
              </div>

              <div style={actionGridStyle}>
                <ActionCard
                  title={t("adminControlCenterPage.pendingCompanies")}
                  value={data.actions.pendingCompanies}
                  description={t("adminControlCenterPage.pendingCompaniesText")}
                  to="/admin/companies"
                />

                <ActionCard
                  title={t("adminControlCenterPage.pendingProducts")}
                  value={data.actions.pendingProducts}
                  description={t("adminControlCenterPage.pendingProductsText")}
                  to="/admin/products"
                />

                <ActionCard
                  title={t("adminControlCenterPage.openDisputes")}
                  value={data.actions.openDisputes}
                  description={t("adminControlCenterPage.openDisputesText")}
                  to="/admin/disputes"
                />

                <ActionCard
                  title={t("adminControlCenterPage.pendingPayouts")}
                  value={data.actions.pendingPayouts}
                  description={t("adminControlCenterPage.pendingPayoutsText")}
                  to="/admin/payouts"
                />

                <ActionCard
                  title={t("adminControlCenterPage.flaggedMessages")}
                  value={data.actions.flaggedMessages}
                  description={t("adminControlCenterPage.flaggedMessagesText")}
                  to="/admin/chat-moderation"
                />
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}

const layoutStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  background: "#f8fafc",
};

const pageStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  padding: "30px clamp(18px, 4vw, 48px) 60px",
};

const headerStyle: CSSProperties = {
  maxWidth: 1400,
  margin: "0 auto 26px",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 20,
  flexWrap: "wrap",
};

const eyebrowStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 1.2,
};

const titleStyle: CSSProperties = {
  margin: "7px 0 6px",
  fontSize: "clamp(32px, 4vw, 46px)",
  lineHeight: 1.05,
  color: "#0f172a",
};

const subtitleStyle: CSSProperties = {
  maxWidth: 700,
  margin: 0,
  color: "#64748b",
  lineHeight: 1.6,
};

const refreshButtonStyle: CSSProperties = {
  border: 0,
  borderRadius: 14,
  padding: "13px 18px",
  background: "#0f172a",
  color: "white",
  fontWeight: 800,
};

const overallStyle: CSSProperties = {
  maxWidth: 1400,
  margin: "0 auto 26px",
  border: "1px solid",
  borderRadius: 24,
  padding: 24,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  flexWrap: "wrap",
};

const overallLabelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.1,
};

const overallTitleStyle: CSSProperties = {
  margin: "5px 0",
  fontSize: 27,
};

const overallDescriptionStyle: CSSProperties = {
  margin: 0,
  lineHeight: 1.5,
};

const totalActionStyle: CSSProperties = {
  minWidth: 145,
  borderRadius: 18,
  background: "rgba(255,255,255,0.72)",
  padding: "15px 20px",
  display: "grid",
  textAlign: "center",
};

const sectionStyle: CSSProperties = {
  maxWidth: 1400,
  margin: "0 auto 28px",
};

const sectionHeaderStyle: CSSProperties = {
  marginBottom: 15,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 12,
  flexWrap: "wrap",
};

const sectionEyebrowStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.1,
};

const sectionTitleStyle: CSSProperties = {
  margin: "4px 0 0",
  color: "#0f172a",
  fontSize: 25,
};

const checkTimeStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 13,
};

const systemGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 16,
};

const cardStyle: CSSProperties = {
  minHeight: 155,
  padding: 20,
  borderRadius: 20,
  background: "white",
  border: "1px solid",
  boxShadow: "0 10px 28px rgba(15,23,42,0.06)",
};

const cardHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 10,
};

const cardTitleStyle: CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: 18,
};

const statusBadgeStyle: CSSProperties = {
  borderRadius: 999,
  padding: "6px 9px",
  fontSize: 11,
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const messageStyle: CSSProperties = {
  color: "#475569",
  lineHeight: 1.55,
  margin: "18px 0 0",
};

const detailStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 12,
  lineHeight: 1.5,
  margin: "9px 0 0",
  overflowWrap: "anywhere",
};

const actionGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 15,
};

const actionCardStyle: CSSProperties = {
  padding: 19,
  borderRadius: 18,
  border: "1px solid",
  background: "white",
  textDecoration: "none",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 15,
  boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
};

const actionTitleStyle: CSSProperties = {
  color: "#0f172a",
  fontSize: 16,
  fontWeight: 900,
};

const actionDescriptionStyle: CSSProperties = {
  marginTop: 6,
  color: "#64748b",
  fontSize: 13,
  lineHeight: 1.45,
};

const actionValueStyle: CSSProperties = {
  minWidth: 49,
  height: 49,
  borderRadius: 15,
  display: "grid",
  placeItems: "center",
  fontSize: 21,
  fontWeight: 900,
};

const stateBoxStyle: CSSProperties = {
  maxWidth: 1400,
  margin: "0 auto",
  padding: 35,
  borderRadius: 20,
  background: "white",
  textAlign: "center",
  color: "#475569",
};

const errorBoxStyle: CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  padding: 28,
  borderRadius: 20,
  border: "1px solid #fecaca",
  background: "#fef2f2",
  color: "#991b1b",
  display: "grid",
  gap: 12,
};

const retryButtonStyle: CSSProperties = {
  width: "fit-content",
  border: 0,
  borderRadius: 12,
  padding: "10px 14px",
  background: "#991b1b",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};
