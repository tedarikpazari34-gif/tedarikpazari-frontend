import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const API =
  import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

const statusIndex: Record<string, number> = {
  PENDING_PICKUP: 1,
  PICKED_UP: 2,
  IN_TRANSIT: 3,
  DELIVERED: 4,
};

function BuyerTimeline({ order }: { order: any }) {
  const { t } = useTranslation();
  const currentIndex = statusIndex[order.status] ?? 0;

  const timelineSteps = [
    t("buyerShippingQuotesPage.timelineRequestCreated"),
    t("buyerShippingQuotesPage.timelineCarrierSelected"),
    t("buyerShippingQuotesPage.timelinePickedUp"),
    t("buyerShippingQuotesPage.timelineInTransit"),
    t("buyerShippingQuotesPage.timelineDelivered"),
  ];

  return (
    <div style={timelineStyle}>
      {timelineSteps.map((label, index) => {
        const completed = index <= currentIndex;

        return (
          <div key={label} style={timelineItemStyle}>
            <span
              style={{
                ...dotStyle,
                background: completed ? "#2563eb" : "#e2e8f0",
                color: completed ? "#ffffff" : "#94a3b8",
              }}
            >
              {completed ? "✓" : index + 1}
            </span>

            <strong
              style={{
                color: completed ? "#0f172a" : "#94a3b8",
              }}
            >
              {label}
            </strong>
          </div>
        );
      })}
    </div>
  );
}

export default function BuyerShippingQuotesPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";

  const [quotes, setQuotes] = useState<any[]>([]);
  const [shippingOrders, setShippingOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState("");

  const load = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const [quotesRes, ordersRes] = await Promise.all([
        fetch(`${API}/shipping/buyer`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API}/shipping/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const [quotesData, ordersData] = await Promise.all([
        quotesRes.json(),
        ordersRes.json(),
      ]);

      if (!quotesRes.ok) {
        alert(quotesData?.message || t("buyerShippingQuotesPage.quotesFailed"));
        setQuotes([]);
      } else {
        setQuotes(Array.isArray(quotesData) ? quotesData : []);
      }

      if (ordersRes.ok) {
        setShippingOrders(
          Array.isArray(ordersData) ? ordersData : []
        );
      } else {
        setShippingOrders([]);
      }
    } catch (err) {
      console.error("BUYER SHIPPING ERROR:", err);
      setQuotes([]);
      setShippingOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const acceptQuote = async (quoteId: string) => {
    try {
      setAcceptingId(quoteId);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API}/shipping/quote/${quoteId}/accept`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message || t("buyerShippingQuotesPage.selectFailed"));
        return;
      }

      alert(t("buyerShippingQuotesPage.selectSuccess"));
      await load();
    } catch (err) {
      console.error("ACCEPT SHIPPING QUOTE ERROR:", err);
      alert(t("buyerShippingQuotesPage.actionError"));
    } finally {
      setAcceptingId("");
    }
  };

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={emptyStyle}>{t("buyerShippingQuotesPage.loading")}</div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <div style={eyebrowStyle}>{t("buyerShippingQuotesPage.panel")}</div>
          <h1 style={titleStyle}>{t("buyerShippingQuotesPage.title")}</h1>
          <p style={descStyle}>
            {t("buyerShippingQuotesPage.description")}
          </p>
        </div>
      </section>

      {quotes.length === 0 ? (
        <div style={emptyStyle}>
          <h2 style={{ marginTop: 0 }}>
            {t("buyerShippingQuotesPage.noQuotes")}
          </h2>
          <p style={{ color: "#64748b" }}>
            {t("buyerShippingQuotesPage.noQuotesText")}
          </p>
        </div>
      ) : (
        <section style={gridStyle}>
          {quotes.map((quote) => {
            const shippingOrder = shippingOrders.find(
              (order) =>
                order.shippingQuoteId === quote.id ||
                order.shippingQuote?.id === quote.id
            );

            return (
              <article key={quote.id} style={cardStyle}>
                <div style={cardTopStyle}>
                  <div>
                    <div style={smallLabelStyle}>{t("buyerShippingQuotesPage.shippingQuote")}</div>
                    <h2 style={companyTitleStyle}>
                      {quote.company?.name ||
                        quote.company?.companyName ||
                        t("buyerShippingQuotesPage.logisticsCompany")}
                    </h2>
                  </div>

                  <span
                    style={{
                      ...badgeStyle,
                      ...(quote.status === "ACCEPTED"
                        ? acceptedBadgeStyle
                        : quote.status === "REJECTED"
                        ? rejectedBadgeStyle
                        : sentBadgeStyle),
                    }}
                  >
                    {quote.status === "ACCEPTED"
                      ? t("buyerShippingQuotesPage.selected")
                      : quote.status === "REJECTED"
                      ? t("buyerShippingQuotesPage.rejected")
                      : t("buyerShippingQuotesPage.quoteReceived")}
                  </span>
                </div>

                <div style={infoGridStyle}>
                  <Info
                    label={t("buyerShippingQuotesPage.product")}
                    value={
                      quote.rfq?.order?.rfq?.product?.title || "-"
                    }
                  />
                  <Info
                    label={t("buyerShippingQuotesPage.shippingCost")}
                    value={`${Number(
                      quote.price || 0
                    ).toLocaleString(locale)} ₺`}
                  />
                  <Info
                    label={t("buyerShippingQuotesPage.deliveryTime")}
                    value={
                      quote.deliveryDays
                        ? t("buyerShippingQuotesPage.days", {
                            count: quote.deliveryDays,
                          })
                        : "-"
                    }
                  />
                </div>

                <div style={noteStyle}>
                  <strong>{t("buyerShippingQuotesPage.carrierNote")}</strong>
                  <p>{quote.note || t("buyerShippingQuotesPage.noNote")}</p>
                </div>

                {quote.status === "SENT" && (
                  <button
                    onClick={() => acceptQuote(quote.id)}
                    disabled={acceptingId === quote.id}
                    style={{
                      ...acceptButtonStyle,
                      opacity:
                        acceptingId === quote.id ? 0.65 : 1,
                    }}
                  >
                    {acceptingId === quote.id
                      ? t("buyerShippingQuotesPage.selecting")
                      : t("buyerShippingQuotesPage.selectCarrier")}
                  </button>
                )}

                {quote.status === "ACCEPTED" && shippingOrder && (
                  <div style={trackingPanelStyle}>
                    <div style={trackingHeaderStyle}>
                      <div>
                        <span style={trackingLabelStyle}>
                          {t("buyerShippingQuotesPage.tracking")}
                        </span>
                        <strong>
                          {shippingOrder.trackingNo || "-"}
                        </strong>
                      </div>

                      <Link to="/chat" style={chatLinkStyle}>
                        {t("buyerShippingQuotesPage.shippingChat")}
                      </Link>
                    </div>

                    <BuyerTimeline order={shippingOrder} />
                  </div>
                )}

                {quote.status === "ACCEPTED" && !shippingOrder && (
                  <div style={acceptedNoticeStyle}>
                    {t("buyerShippingQuotesPage.preparingOrder")}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </main>
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
    <div style={infoStyle}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: 40,
  background: "#f8fafc",
};

const heroStyle: CSSProperties = {
  maxWidth: 1000,
  margin: "0 auto 24px",
  padding: 30,
  borderRadius: 26,
  color: "#ffffff",
  background: "linear-gradient(135deg, #0f172a, #1d4ed8)",
  boxShadow: "0 22px 48px rgba(15,23,42,0.18)",
};

const eyebrowStyle: CSSProperties = {
  color: "#bfdbfe",
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 8,
};

const titleStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: 36,
  fontWeight: 900,
};

const descStyle: CSSProperties = {
  maxWidth: 680,
  margin: 0,
  color: "#dbeafe",
  lineHeight: 1.6,
};

const gridStyle: CSSProperties = {
  maxWidth: 1000,
  margin: "0 auto",
  display: "grid",
  gap: 18,
};

const cardStyle: CSSProperties = {
  padding: 22,
  borderRadius: 22,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  boxShadow: "0 12px 30px rgba(15,23,42,0.09)",
};

const cardTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 14,
  marginBottom: 16,
};

const smallLabelStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 5,
};

const companyTitleStyle: CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: 24,
  fontWeight: 900,
};

const badgeStyle: CSSProperties = {
  padding: "7px 11px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const acceptedBadgeStyle: CSSProperties = {
  background: "#dcfce7",
  color: "#166534",
};

const rejectedBadgeStyle: CSSProperties = {
  background: "#fee2e2",
  color: "#991b1b",
};

const sentBadgeStyle: CSSProperties = {
  background: "#fef3c7",
  color: "#92400e",
};

const infoGridStyle: CSSProperties = {
  marginBottom: 14,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 10,
};

const infoStyle: CSSProperties = {
  minWidth: 0,
  padding: 12,
  display: "grid",
  gap: 5,
  borderRadius: 14,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  color: "#64748b",
  fontSize: 12,
};

const noteStyle: CSSProperties = {
  marginBottom: 14,
  padding: 14,
  borderRadius: 14,
  color: "#334155",
  background: "#f8fafc",
};

const acceptButtonStyle: CSSProperties = {
  width: "100%",
  minHeight: 46,
  border: "none",
  borderRadius: 13,
  color: "#ffffff",
  background: "#16a34a",
  fontWeight: 900,
  cursor: "pointer",
};

const trackingPanelStyle: CSSProperties = {
  marginTop: 16,
  padding: 16,
  borderRadius: 18,
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
};

const trackingHeaderStyle: CSSProperties = {
  marginBottom: 16,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const trackingLabelStyle: CSSProperties = {
  display: "block",
  marginBottom: 4,
  color: "#2563eb",
  fontSize: 11,
  fontWeight: 900,
};

const chatLinkStyle: CSSProperties = {
  padding: "9px 12px",
  borderRadius: 11,
  color: "#ffffff",
  background: "#2563eb",
  textDecoration: "none",
  fontWeight: 900,
  fontSize: 13,
};

const timelineStyle: CSSProperties = {
  display: "grid",
  gap: 9,
};

const timelineItemStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "28px 1fr",
  alignItems: "center",
  gap: 10,
};

const dotStyle: CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  fontSize: 11,
  fontWeight: 900,
};

const acceptedNoticeStyle: CSSProperties = {
  marginTop: 14,
  padding: 12,
  borderRadius: 12,
  color: "#166534",
  background: "#dcfce7",
  fontWeight: 800,
};

const emptyStyle: CSSProperties = {
  maxWidth: 700,
  margin: "30px auto",
  padding: 30,
  borderRadius: 22,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
};
