import { useEffect, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";

type Quote = {
  id: string;
  unitPrice?: number | string;
  deliveryDays?: number;
  note?: string | null;
};

type RFQ = {
  id: string;
  quantity: number;
  unitType?: string | null;
  deliveryCountry?: string | null;
  deliveryCity?: string | null;
  note?: string | null;
  status: string;
  product?: {
    title?: string;
  };
  buyer?: {
    name?: string;
  };
  quotes?: Quote[];
};

const API = "https://tedarik-backend.onrender.com/api";

function statusLabel(status: string, t: any) {
  const value = status?.toUpperCase();

  if (value === "OPEN") return t("sellerRfqsPage.statusOpen");
  if (value === "PENDING") return t("sellerRfqsPage.statusPending");
  if (value === "CLOSED") return t("sellerRfqsPage.statusClosed");

  return status || "-";
}

export default function SellerRfqsPage() {
  const { t } = useTranslation();

  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => localStorage.getItem("token") || "";

  const loadRfqs = async () => {
    try {
      setError("");

      const token = getToken();

      if (!token) {
        setError(t("sellerRfqsPage.sessionMissing"));
        setRfqs([]);
        return;
      }

      const res = await fetch(`${API}/rfqs/open`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || t("sellerRfqsPage.loadFailed"));
        setRfqs([]);
        return;
      }

      setRfqs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("RFQ LOAD ERROR:", err);
      setError(t("sellerRfqsPage.loadFailed"));
      setRfqs([]);
    } finally {
      setPageLoading(false);
    }
  };
  const startChat = async (rfqId: string) => {
  try {
    const token = getToken();

    const res = await fetch(`${API}/chat/rfq/${rfqId}/thread`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data?.message || t("sellerRfqsPage.chatFailed"));
      return;
    }

    window.location.href = "/chat";
  } catch (err) {
    console.error("START CHAT ERROR:", err);
    alert(t("sellerRfqsPage.chatFailed"));
  }
};
  useEffect(() => {
    loadRfqs();
  }, []);

  if (pageLoading) {
    return (
      <main style={pageStyle}>
        <div style={emptyCardStyle}>{t("sellerRfqsPage.loading")}</div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <div style={eyebrowStyle}>{t("sellerRfqsPage.eyebrow")}</div>
          <h1 style={titleStyle}>{t("sellerRfqsPage.title")}</h1>
          <p style={descStyle}>
            {t("sellerRfqsPage.description")}
          </p>
        </div>

        <div style={heroStatsStyle}>
          <span>{t("sellerRfqsPage.totalRequests")}</span>
          <strong>{rfqs.length}</strong>
        </div>
      </section>

      {error && <div style={errorCardStyle}>{error}</div>}

      {!error && rfqs.length === 0 ? (
        <div style={emptyCardStyle}>
          <h2 style={{ marginTop: 0 }}>{t("sellerRfqsPage.noOpenRfqs")}</h2>
          <p style={{ color: "#64748b", lineHeight: 1.7 }}>
            {t("sellerRfqsPage.noOpenRfqsText")}
          </p>
        </div>
      ) : (
        <section style={gridStyle}>
          {rfqs.map((rfq) => (
            <article key={rfq.id} style={cardStyle}>
              <div style={cardTopStyle}>
                <div>
                  <div style={smallLabelStyle}>{t("sellerRfqsPage.requestedProduct")}</div>
                  <h2 style={cardTitleStyle}>
                    {rfq.product?.title || t("sellerRfqsPage.generalRequest")}
                  </h2>
                </div>

                <span style={statusBadgeStyle}>{statusLabel(rfq.status, t)}</span>
              </div>

              <div style={infoGridStyle}>
                <Info label={t("sellerRfqsPage.buyer")} value={rfq.buyer?.name || "-"} />
                <Info
                  label={t("sellerRfqsPage.quantity")}
                  value={rfq.quantity ? `${rfq.quantity} ${rfq.unitType || ""}`.trim() : "-"}
                />
                <Info
                  label={t("sellerRfqsPage.delivery")}
                  value={
                    rfq.deliveryCountry || rfq.deliveryCity
                      ? [rfq.deliveryCountry, rfq.deliveryCity].filter(Boolean).join(" / ")
                      : "-"
                  }
                />
                <Info label={t("sellerRfqsPage.existingQuotes")} value={rfq.quotes?.length || 0} />
                <Info label={t("sellerRfqsPage.status")} value={statusLabel(rfq.status, t)} />
              </div>

              <div style={noteBoxStyle}>
                <strong>{t("sellerRfqsPage.requestNote")}</strong>
                <p>{rfq.note || t("sellerRfqsPage.noNote")}</p>
              </div>

              <div style={buttonRowStyle}>
  <button
    onClick={() => {
      window.location.href = `/seller/quotes/create?rfqId=${rfq.id}`;
    }}
    style={quoteButtonStyle}
  >
    {t("sellerRfqsPage.submitQuote")}
  </button>

  <button
    onClick={() => startChat(rfq.id)}
    style={chatButtonStyle}
  >
    {t("sellerRfqsPage.message")}
  </button>
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
    <div style={infoBoxStyle}>
      <span>{label}</span>
      <strong>{value}</strong>
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

const heroStatsStyle: CSSProperties = {
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 20,
  padding: 20,
  minWidth: 160,
  display: "grid",
  gap: 6,
};

const gridStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: 20,
};

const cardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 22,
  padding: 22,
  boxShadow: "0 14px 34px rgba(15,23,42,0.10)",
};

const cardTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "start",
  marginBottom: 18,
};

const smallLabelStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 6,
};

const cardTitleStyle: CSSProperties = {
  color: "#0f172a",
  margin: 0,
  fontSize: 21,
  fontWeight: 900,
};

const statusBadgeStyle: CSSProperties = {
  background: "#dcfce7",
  color: "#166534",
  borderRadius: 999,
  padding: "7px 11px",
  fontSize: 12,
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const infoGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginBottom: 14,
};

const infoBoxStyle: CSSProperties = {
  background: "#f8fafc",
  borderRadius: 14,
  padding: 13,
  display: "grid",
  gap: 4,
  color: "#334155",
};

const noteBoxStyle: CSSProperties = {
  background: "#f8fafc",
  borderRadius: 14,
  padding: 14,
  color: "#334155",
  marginBottom: 16,
};

const quoteButtonStyle: CSSProperties = {
  width: "100%",
  border: "none",
  borderRadius: 14,
  padding: "13px 16px",
  background: "#2563eb",
  color: "white",
  fontWeight: 900,
  fontSize: 15,
  cursor: "pointer",
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
const buttonRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 18,
};

const chatButtonStyle: CSSProperties = {
  flex: 1,
  border: "1px solid #bfdbfe",
  background: "#eff6ff",
  color: "#1d4ed8",
  padding: "12px 14px",
  borderRadius: 14,
  cursor: "pointer",
  fontWeight: 900,
};