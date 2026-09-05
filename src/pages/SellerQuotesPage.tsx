import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

type Quote = {
  id: string;
  unitPrice: string | number;
  deliveryDays?: number;
  sellerNote?: string | null;
  status: string;
  createdAt: string;
  rfq?: {
    id: string;
    quantity: number;
    title?: string | null;
    product?: {
      title?: string;
      unitType?: string;
    };
    buyer?: {
      name?: string;
    };
  };
};

const API = "https://tedarik-backend.onrender.com/api";

function formatPrice(value: string | number, locale: string) {
  const numeric = Number(value);

  if (Number.isNaN(numeric)) {
    return String(value);
  }

  return `${numeric.toLocaleString(locale)} ₺`;
}

function statusLabel(status: string, t: any) {
  if (status === "SENT") return t("sellerQuotesPage.pending");
  if (status === "ACCEPTED") return t("sellerQuotesPage.accepted");
  if (status === "REJECTED") return t("sellerQuotesPage.rejected");

  return status || "-";
}

function unitLabel(value: string | undefined, t: any) {
  if (!value) return "";

  const labels: Record<string, string> = {
    "Adet": t("sellerQuotesPage.piece"),
    "adet": t("sellerQuotesPage.piece"),
    "Koli": t("sellerQuotesPage.box"),
    "koli": t("sellerQuotesPage.box"),
    "Paket": t("sellerQuotesPage.package"),
    "paket": t("sellerQuotesPage.package"),
    "Kilogram": t("sellerQuotesPage.kilogram"),
    "kg": t("sellerQuotesPage.kilogramShort"),
    "Kg": t("sellerQuotesPage.kilogramShort"),
    "Litre": t("sellerQuotesPage.litre"),
    "litre": t("sellerQuotesPage.litre"),
    "Metre": t("sellerQuotesPage.meter"),
    "metre": t("sellerQuotesPage.meter"),
    "Ton": t("sellerQuotesPage.ton"),
    "ton": t("sellerQuotesPage.ton"),
    "Palet": t("sellerQuotesPage.pallet"),
    "palet": t("sellerQuotesPage.pallet"),
  };

  return labels[value] || value;
}

function statusStyle(status: string): CSSProperties {
  if (status === "ACCEPTED") {
    return {
      background: "#dcfce7",
      color: "#166534",
    };
  }

  if (status === "REJECTED") {
    return {
      background: "#fee2e2",
      color: "#991b1b",
    };
  }

  return {
    background: "#dbeafe",
    color: "#1d4ed8",
  };
}

export default function SellerQuotesPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";

  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= 768
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadQuotes = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError(t("sellerQuotesPage.loginRequired"));
        return;
      }

      const res = await fetch(`${API}/quotes/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || t("sellerQuotesPage.loadFailed"));
        return;
      }

      setQuotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(t("sellerQuotesPage.loadFailed"));
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={emptyCardStyle}>
          {t("sellerQuotesPage.loading")}
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section
        style={{
          ...heroStyle,
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          padding: isMobile ? 24 : 32,
        }}
      >
        <div>
          <div style={eyebrowStyle}>{t("sellerQuotesPage.eyebrow")}</div>

          <h1 style={titleStyle}>{t("sellerQuotesPage.title")}</h1>

          <p style={descStyle}>
            {t("sellerQuotesPage.description")}
          </p>
        </div>

        <Link
          to="/seller/rfqs"
          style={{
            ...heroButtonStyle,
            width: isMobile ? "100%" : "auto",
            boxSizing: "border-box",
            textAlign: "center",
            marginTop: isMobile ? 16 : 0,
          }}
        >
          {t("sellerQuotesPage.findRfq")}
        </Link>
      </section>

      <section style={statsStyle}>
        <Stat
          label={t("sellerQuotesPage.totalQuotes")}
          value={quotes.length}
        />

        <Stat
          label={t("sellerQuotesPage.pendingQuotes")}
          value={
            quotes.filter((q) => q.status === "SENT").length
          }
        />

        <Stat
          label={t("sellerQuotesPage.acceptedQuotes")}
          value={
            quotes.filter((q) => q.status === "ACCEPTED").length
          }
        />
      </section>

      {error ? (
        <div style={errorCardStyle}>
          {error}
        </div>
      ) : quotes.length === 0 ? (
        <div style={emptyCardStyle}>
          <h2 style={{ marginTop: 0 }}>
            {t("sellerQuotesPage.emptyTitle")}
          </h2>

          <p style={{ color: "#64748b", lineHeight: 1.7 }}>
            {t("sellerQuotesPage.emptyText")}
          </p>

          <Link
            to="/seller/rfqs"
            style={primaryButtonStyle}
          >
            {t("sellerQuotesPage.viewRfqs")}
          </Link>
        </div>
      ) : (
        <section style={gridStyle}>
          {quotes.map((q) => (
            <article key={q.id} style={cardStyle}>
              <div style={cardTopStyle}>
                <div>
                  <div style={smallLabelStyle}>
                    {t("sellerQuotesPage.requestLabel")}
                  </div>

                  <h2 style={cardTitleStyle}>
                    {q.rfq?.product?.title ||
                      q.rfq?.title ||
                      t("sellerQuotesPage.buyingRequest")}
                  </h2>
                </div>

                <span
                  style={{
                    ...badgeStyle,
                    ...statusStyle(q.status),
                  }}
                >
                  {statusLabel(q.status, t)}
                </span>
              </div>

              <div style={infoGridStyle}>
                <Info
                  label={t("sellerQuotesPage.buyer")}
                  value={q.rfq?.buyer?.name || "-"}
                />

                <Info
                  label={t("sellerQuotesPage.quantity")}
                  value={`${q.rfq?.quantity || "-"} ${
                    unitLabel(q.rfq?.product?.unitType, t)
                  }`}
                />

                <Info
                  label={t("sellerQuotesPage.price")}
                  value={formatPrice(q.unitPrice, locale)}
                />

                <Info
                  label={t("sellerQuotesPage.delivery")}
                  value={
                    q.deliveryDays
                      ? t("sellerQuotesPage.dayCount", {
                          count: q.deliveryDays,
                        })
                      : "-"
                  }
                />
              </div>

              <div style={noteBoxStyle}>
                <strong>{t("sellerQuotesPage.quoteNote")}</strong>

                <p>
                  {q.sellerNote || t("sellerQuotesPage.noNote")}
                </p>
              </div>

              {q.status === "ACCEPTED" && (
                <div style={acceptedBoxStyle}>
                  {t("sellerQuotesPage.convertedToSale")}
                </div>
              )}

              {q.status === "REJECTED" && (
                <div style={rejectedBoxStyle}>
                  {t("sellerQuotesPage.quoteRejected")}
                </div>
              )}

              {q.status === "SENT" && (
                <div style={pendingBoxStyle}>
                  {t("sellerQuotesPage.waitingBuyer")}
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div style={statCardStyle}>
      <span style={statLabelStyle}>
        {label}
      </span>

      <strong style={statValueStyle}>
        {value}
      </strong>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
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
  background:
    "linear-gradient(135deg, #0f172a, #1e3a8a)",
  color: "white",
  borderRadius: 28,
  padding: 32,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  boxShadow:
    "0 24px 50px rgba(15,23,42,0.18)",
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

const heroButtonStyle: CSSProperties = {
  textDecoration: "none",
  background: "#22c55e",
  color: "white",
  padding: "13px 18px",
  borderRadius: 14,
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const statsStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
};

const statCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 20,
  padding: 20,
  boxShadow:
    "0 12px 28px rgba(15,23,42,0.08)",
};

const statLabelStyle: CSSProperties = {
  display: "block",
  color: "#64748b",
  fontWeight: 800,
  marginBottom: 8,
};

const statValueStyle: CSSProperties = {
  fontSize: 30,
  color: "#0f172a",
};

const gridStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fill, minmax(320px, 1fr))",
  gap: 20,
};

const cardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 22,
  padding: 22,
  boxShadow:
    "0 14px 34px rgba(15,23,42,0.10)",
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

const badgeStyle: CSSProperties = {
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

const acceptedBoxStyle: CSSProperties = {
  background: "#dcfce7",
  color: "#166534",
  padding: 13,
  borderRadius: 14,
  fontWeight: 900,
};

const rejectedBoxStyle: CSSProperties = {
  background: "#fee2e2",
  color: "#991b1b",
  padding: 13,
  borderRadius: 14,
  fontWeight: 900,
};

const pendingBoxStyle: CSSProperties = {
  background: "#eff6ff",
  color: "#1d4ed8",
  padding: 13,
  borderRadius: 14,
  fontWeight: 900,
};

const emptyCardStyle: CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 24,
  padding: 32,
  boxShadow:
    "0 14px 34px rgba(15,23,42,0.10)",
};

const errorCardStyle: CSSProperties = {
  ...emptyCardStyle,
  color: "#991b1b",
};

const primaryButtonStyle: CSSProperties = {
  display: "inline-block",
  textDecoration: "none",
  background: "#2563eb",
  color: "white",
  padding: "12px 16px",
  borderRadius: 12,
  fontWeight: 900,
  marginTop: 10,
};