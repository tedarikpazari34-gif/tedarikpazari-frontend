import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

type RFQ = {
  id: string;
  quantity: number;
  title?: string | null;
  unitType?: string | null;
  deliveryCountry?: string | null;
  deliveryCity?: string | null;
  note?: string | null;
  status: string;
  createdAt?: string;
  product?: {
    title?: string;
  };
};

const API = "https://tedarik-backend.onrender.com/api";

function getStatusLabel(status: string, t: (key: string) => string) {
  const value = status?.toUpperCase();

  if (value === "OPEN") return t("buyerRfqsPage.statusOpen");
  if (value === "PENDING") return t("buyerRfqsPage.statusPending");
  if (value === "CLOSED") return t("buyerRfqsPage.statusClosed");
  if (value === "APPROVED") return t("buyerRfqsPage.statusApproved");
  if (value === "REJECTED") return t("buyerRfqsPage.statusRejected");

  return status || t("buyerRfqsPage.noStatus");
}
function getStatusStyle(status: string): CSSProperties {
  const value = status?.toUpperCase();

  if (value === "OPEN" || value === "APPROVED") {
    return {
      background: "#dcfce7",
      color: "#166534",
    };
  }

  if (value === "PENDING") {
    return {
      background: "#fef3c7",
      color: "#92400e",
    };
  }

  if (value === "CLOSED" || value === "REJECTED") {
    return {
      background: "#fee2e2",
      color: "#991b1b",
    };
  }

  return {
    background: "#e0f2fe",
    color: "#0369a1",
  };
}

export default function BuyerRfqsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";

  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRfqs = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError(t("buyerRfqsPage.loginRequired"));
          return;
        }

        const res = await fetch(`${API}/rfqs/mine`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data?.message || t("buyerRfqsPage.loadFailed"));
          return;
        }

        setRfqs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(t("buyerRfqsPage.loadFailed"));
      } finally {
        setLoading(false);
      }
    };

    loadRfqs();
  }, []);
  const startChat = async (rfqId: string) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/chat/rfq/${rfqId}/thread`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data?.message || t("buyerRfqsPage.chatFailed"));
      return;
    }

    window.location.href = "/chat";
  } catch (err) {
    console.error("START CHAT ERROR:", err);
    alert(t("buyerRfqsPage.chatFailed"));
  }
};
  return (
    <main style={page}>
      <section style={hero}>
        <div>
          <div style={eyebrow}>{t("buyerRfqsPage.buyerPanel")}</div>
          <h1 style={heading}>{t("buyerRfqsPage.title")}</h1>
          <p style={description}>
            {t("buyerRfqsPage.description")}
          </p>
        </div>

        <Link to="/buyer/rfqs/new" style={newButton}>
          {t("buyerRfqsPage.newRequest")}
        </Link>
      </section>

      <section style={statsRow}>
        <div style={statCard}>
          <span style={statLabel}>{t("buyerRfqsPage.totalRequests")}</span>
          <strong style={statValue}>{rfqs.length}</strong>
        </div>

        <div style={statCard}>
          <span style={statLabel}>{t("buyerRfqsPage.openRequests")}</span>
          <strong style={statValue}>
            {rfqs.filter((r) => r.status?.toUpperCase() === "OPEN").length}
          </strong>
        </div>

        <div style={statCard}>
          <span style={statLabel}>{t("buyerRfqsPage.pendingRequests")}</span>
          <strong style={statValue}>
            {rfqs.filter((r) => r.status?.toUpperCase() === "PENDING").length}
          </strong>
        </div>
      </section>

      {loading ? (
        <div style={emptyCard}>{t("buyerRfqsPage.loading")}</div>
      ) : error ? (
        <div style={errorCard}>
          <strong>{t("buyerRfqsPage.problem")}</strong>
          <span>{error}</span>
          <Link to="/login" style={loginLink}>
            {t("buyerRfqsPage.login")}
          </Link>
        </div>
      ) : rfqs.length === 0 ? (
        <div style={emptyCard}>
          <h2 style={{ marginTop: 0 }}>{t("buyerRfqsPage.noRequests")}</h2>
          <p style={{ color: "#64748b", lineHeight: 1.7 }}>
            {t("buyerRfqsPage.noRequestsText")}
          </p>
          <Link to="/products" style={primaryLink}>
            {t("buyerRfqsPage.discoverProducts")}
          </Link>
        </div>
      ) : (
        <section style={grid}>
          {rfqs.map((rfq) => (
            <article key={rfq.id} style={card}>
              <div style={cardTop}>
                <div>
                  <div style={productLabel}>{t("buyerRfqsPage.productRequest")}</div>
                  <h2 style={title}>{rfq.product?.title || rfq.title || t("buyerRfqsPage.generalRequest")}</h2>
                </div>

                <span
                  style={{
                    ...statusBadge,
                    ...getStatusStyle(rfq.status),
                  }}
                >
                  {getStatusLabel(rfq.status, t)}
                </span>
              </div>

              <div style={infoGrid}>
                <Info label={t("buyerRfqsPage.quantity")} value={rfq.quantity ? `${rfq.quantity} ${rfq.unitType || ""}`.trim() : "-"} />
                <Info
                  label={t("buyerRfqsPage.delivery")}
                  value={
                    rfq.deliveryCountry || rfq.deliveryCity
                      ? [rfq.deliveryCountry, rfq.deliveryCity].filter(Boolean).join(" / ")
                      : "-"
                  }
                />
                <Info
                  label={t("buyerRfqsPage.date")}
                  value={
                    rfq.createdAt
                      ? new Date(rfq.createdAt).toLocaleDateString(locale)
                      : "-"
                  }
                />
              </div>

              <div style={noteBox}>
                <strong>{t("buyerRfqsPage.note")}</strong>
                <p>{rfq.note || t("buyerRfqsPage.noNote")}</p>
              </div>

              <div style={actions}>
  <Link to={`/buyer/rfqs/${rfq.id}`} style={detailButton}>
    {t("buyerRfqsPage.viewQuotes")}
  </Link>

  <button
    type="button"
    onClick={() => startChat(rfq.id)}
    style={chatButton}
  >
    {t("buyerRfqsPage.message")}
  </button>

  <Link to="/buyer/rfqs/new" style={secondaryButton}>
    {t("buyerRfqsPage.newShort")}
  </Link>
</div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={infoBox}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const page: CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: 40,
};

const hero: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
  background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
  color: "white",
  borderRadius: 28,
  padding: 32,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  boxShadow: "0 24px 50px rgba(15,23,42,0.18)",
};

const eyebrow: CSSProperties = {
  color: "#93c5fd",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 8,
};

const heading: CSSProperties = {
  fontSize: 40,
  fontWeight: 900,
  margin: "0 0 8px",
};

const description: CSSProperties = {
  color: "#cbd5e1",
  maxWidth: 720,
  lineHeight: 1.7,
  margin: 0,
};

const newButton: CSSProperties = {
  textDecoration: "none",
  background: "#22c55e",
  color: "white",
  padding: "13px 18px",
  borderRadius: 14,
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const statsRow: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
};

const statCard: CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 20,
  padding: 20,
  boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
};

const statLabel: CSSProperties = {
  display: "block",
  color: "#64748b",
  fontWeight: 800,
  marginBottom: 8,
};

const statValue: CSSProperties = {
  fontSize: 30,
  color: "#0f172a",
};

const grid: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: 20,
};

const card: CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 22,
  padding: 22,
  boxShadow: "0 14px 34px rgba(15,23,42,0.10)",
};

const cardTop: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "start",
  marginBottom: 18,
};

const productLabel: CSSProperties = {
  color: "#2563eb",
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 6,
};

const title: CSSProperties = {
  fontSize: 21,
  color: "#0f172a",
  margin: 0,
};

const statusBadge: CSSProperties = {
  borderRadius: 999,
  padding: "7px 11px",
  fontSize: 12,
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const infoGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginBottom: 14,
};

const infoBox: CSSProperties = {
  background: "#f8fafc",
  borderRadius: 14,
  padding: 13,
  display: "grid",
  gap: 4,
};

const noteBox: CSSProperties = {
  background: "#f8fafc",
  borderRadius: 14,
  padding: 14,
  color: "#334155",
  marginBottom: 16,
};

const actions: CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const detailButton: CSSProperties = {
  flex: 1,
  textAlign: "center",
  textDecoration: "none",
  background: "#2563eb",
  color: "white",
  padding: "11px 14px",
  borderRadius: 12,
  fontWeight: 900,
};

const secondaryButton: CSSProperties = {
  flex: 1,
  textAlign: "center",
  textDecoration: "none",
  background: "#eff6ff",
  color: "#1d4ed8",
  padding: "11px 14px",
  borderRadius: 12,
  fontWeight: 900,
};

const emptyCard: CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 24,
  padding: 32,
  boxShadow: "0 14px 34px rgba(15,23,42,0.10)",
};

const errorCard: CSSProperties = {
  ...emptyCard,
  color: "#991b1b",
  display: "grid",
  gap: 10,
};

const primaryLink: CSSProperties = {
  display: "inline-block",
  textDecoration: "none",
  background: "#2563eb",
  color: "white",
  padding: "12px 16px",
  borderRadius: 12,
  fontWeight: 900,
  marginTop: 10,
};

const loginLink: CSSProperties = {
  ...primaryLink,
  width: "fit-content",
};
const chatButton: CSSProperties = {
  border: "1px solid #bfdbfe",
  background: "#eff6ff",
  color: "#1d4ed8",
  padding: "12px 14px",
  borderRadius: 14,
  cursor: "pointer",
  fontWeight: 900,
};