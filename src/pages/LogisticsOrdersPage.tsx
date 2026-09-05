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

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return "";

  return new Date(value).toLocaleString(locale, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function statusBadgeStyle(status: string): CSSProperties {
  if (status === "DELIVERED") {
    return { background: "#dcfce7", color: "#166534" };
  }

  if (status === "IN_TRANSIT") {
    return { background: "#cffafe", color: "#155e75" };
  }

  if (status === "PICKED_UP") {
    return { background: "#dbeafe", color: "#1d4ed8" };
  }

  return { background: "#fef3c7", color: "#92400e" };
}

function ShippingTimeline({
  order,
  t,
  locale,
}: {
  order: any;
  t: any;
  locale: string;
}) {
  const currentIndex = statusIndex[order.status] ?? 0;

  const timelineSteps = [
    {
      key: "CREATED",
      label: t("logisticsOrdersPage.timelineCreated"),
    },
    {
      key: "PENDING_PICKUP",
      label: t("logisticsOrdersPage.timelineCarrierSelected"),
    },
    {
      key: "PICKED_UP",
      label: t("logisticsOrdersPage.timelinePickedUp"),
    },
    {
      key: "IN_TRANSIT",
      label: t("logisticsOrdersPage.timelineInTransit"),
    },
    {
      key: "DELIVERED",
      label: t("logisticsOrdersPage.timelineDelivered"),
    },
  ];

  const stepDate = (key: string) => {
    if (key === "CREATED") return order.createdAt;
    if (key === "PICKED_UP") return order.pickedUpAt;
    if (key === "IN_TRANSIT") return order.shippedAt;
    if (key === "DELIVERED") return order.deliveredAt;
    return order.createdAt;
  };

  return (
    <div style={timelineStyle}>
      {timelineSteps.map((step, index) => {
        const completed =
          step.key === "CREATED" ||
          index <= currentIndex;

        const active =
          (step.key === "PENDING_PICKUP" &&
            order.status === "PENDING_PICKUP") ||
          step.key === order.status;

        return (
          <div key={step.key} style={timelineItemStyle}>
            <div style={timelineRailStyle}>
              <span
                style={{
                  ...timelineDotStyle,
                  background: completed ? "#2563eb" : "#e2e8f0",
                  color: completed ? "#ffffff" : "#94a3b8",
                  boxShadow: active
                    ? "0 0 0 5px rgba(37,99,235,0.14)"
                    : "none",
                }}
              >
                {completed ? "✓" : index + 1}
              </span>

              {index < timelineSteps.length - 1 && (
                <span
                  style={{
                    ...timelineLineStyle,
                    background:
                      index < currentIndex ? "#2563eb" : "#e2e8f0",
                  }}
                />
              )}
            </div>

            <div style={timelineContentStyle}>
              <strong
                style={{
                  color: completed ? "#0f172a" : "#94a3b8",
                }}
              >
                {step.label}
              </strong>

              {completed && stepDate(step.key) && (
                <span style={timelineDateStyle}>
                  {formatDate(stepDate(step.key), locale)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function LogisticsOrdersPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";

  const statusText: Record<string, string> = {
    PENDING_PICKUP: t("logisticsOrdersPage.statusPendingPickup"),
    PICKED_UP: t("logisticsOrdersPage.statusPickedUp"),
    IN_TRANSIT: t("logisticsOrdersPage.statusInTransit"),
    DELIVERED: t("logisticsOrdersPage.statusDelivered"),
  };

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const load = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/shipping/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || t("logisticsOrdersPage.loadFailed"));
        setOrders([]);
        return;
      }

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("SHIPPING ORDERS ERROR:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const action = async (
    id: string,
    type: "pickup" | "transit" | "deliver"
  ) => {
    try {
      setBusyId(id);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API}/shipping/orders/${id}/${type}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message || t("logisticsOrdersPage.actionFailed"));
        return;
      }

      await load();
    } catch (err) {
      console.error("SHIPPING ACTION ERROR:", err);
      alert(t("logisticsOrdersPage.actionError"));
    } finally {
      setBusyId("");
    }
  };

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={emptyStyle}>{t("logisticsOrdersPage.loading")}</div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <div style={eyebrowStyle}>{t("logisticsOrdersPage.eyebrow")}</div>
          <h1 style={heroTitleStyle}>{t("logisticsOrdersPage.title")}</h1>
          <p style={heroTextStyle}>
            {t("logisticsOrdersPage.description")}
          </p>
        </div>

        <div style={heroStatStyle}>
          <span>{t("logisticsOrdersPage.activeTransport")}</span>
          <strong>
            {
              orders.filter(
                (order) => order.status !== "DELIVERED"
              ).length
            }
          </strong>
        </div>
      </section>

      {orders.length === 0 ? (
        <div style={emptyStyle}>
          <h2 style={{ marginTop: 0 }}>
            {t("logisticsOrdersPage.noActiveOrders")}
          </h2>
          <p style={{ color: "#64748b" }}>
            {t("logisticsOrdersPage.noActiveOrdersText")}
          </p>
        </div>
      ) : (
        <section style={ordersGridStyle}>
          {orders.map((order) => (
            <article key={order.id} style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div>
                  <div style={smallLabelStyle}>
                    {t("logisticsOrdersPage.productToTransport")}
                  </div>
                  <h2 style={productTitleStyle}>
                    {order.order?.rfq?.product?.title ||
                      t("logisticsOrdersPage.product")}
                  </h2>
                </div>

                <span
                  style={{
                    ...badgeStyle,
                    ...statusBadgeStyle(order.status),
                  }}
                >
                  {statusText[order.status] || order.status}
                </span>
              </div>

              <div style={routeStyle}>
                <div>
                  <span style={routeLabelStyle}>
                    {t("logisticsOrdersPage.origin")}
                  </span>
                  <strong>
                    {order.shippingRfq?.fromAddress || "-"}
                  </strong>
                </div>

                <span style={routeArrowStyle}>→</span>

                <div>
                  <span style={routeLabelStyle}>
                    {t("logisticsOrdersPage.destination")}
                  </span>
                  <strong>
                    {order.shippingRfq?.toAddress || "-"}
                  </strong>
                </div>
              </div>

              <div style={infoGridStyle}>
                <Info
                  label={t("logisticsOrdersPage.buyer")}
                  value={order.buyer?.name || "-"}
                />
                <Info
                  label={t("logisticsOrdersPage.seller")}
                  value={order.seller?.name || "-"}
                />
                <Info
                  label={t("logisticsOrdersPage.shippingPrice")}
                  value={`${Number(
                    order.shippingQuote?.price || 0
                  ).toLocaleString(locale)} ₺`}
                />
                <Info
                  label={t("logisticsOrdersPage.estimatedDelivery")}
                  value={t("logisticsOrdersPage.deliveryDays", {
                    days: order.shippingQuote?.deliveryDays || "-",
                  })}
                />
                <Info
                  label={t("logisticsOrdersPage.trackingNumber")}
                  value={order.trackingNo || "-"}
                />
                <Info
                  label={t("logisticsOrdersPage.shippingCompany")}
                  value={order.shippingCompany || "-"}
                />
              </div>

              <ShippingTimeline order={order} t={t} locale={locale} />

              <div style={actionsStyle}>
                <Link to="/chat" style={chatButtonStyle}>
                  {t("logisticsOrdersPage.shippingChat")}
                </Link>

                {order.status === "PENDING_PICKUP" && (
                  <button
                    disabled={busyId === order.id}
                    onClick={() => action(order.id, "pickup")}
                    style={primaryActionStyle}
                  >
                    {busyId === order.id
                      ? t("logisticsOrdersPage.processing")
                      : t("logisticsOrdersPage.confirmPickup")}
                  </button>
                )}

                {order.status === "PICKED_UP" && (
                  <button
                    disabled={busyId === order.id}
                    onClick={() => action(order.id, "transit")}
                    style={warningActionStyle}
                  >
                    {busyId === order.id
                      ? t("logisticsOrdersPage.processing")
                      : t("logisticsOrdersPage.confirmTransit")}
                  </button>
                )}

                {order.status === "IN_TRANSIT" && (
                  <button
                    disabled={busyId === order.id}
                    onClick={() => action(order.id, "deliver")}
                    style={successActionStyle}
                  >
                    {busyId === order.id
                      ? t("logisticsOrdersPage.processing")
                      : t("logisticsOrdersPage.confirmDelivered")}
                  </button>
                )}

                {order.status === "DELIVERED" && (
                  <div style={deliveredStyle}>
                    {t("logisticsOrdersPage.completed")}
                  </div>
                )}
              </div>
            </article>
          ))}
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
  maxWidth: 1100,
  margin: "0 auto 24px",
  padding: 30,
  borderRadius: 26,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  color: "#ffffff",
  background: "linear-gradient(135deg, #0f172a, #0f766e)",
  boxShadow: "0 22px 48px rgba(15,23,42,0.18)",
};

const eyebrowStyle: CSSProperties = {
  color: "#99f6e4",
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 8,
};

const heroTitleStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: 36,
  fontWeight: 900,
};

const heroTextStyle: CSSProperties = {
  maxWidth: 650,
  margin: 0,
  color: "#ccfbf1",
  lineHeight: 1.6,
};

const heroStatStyle: CSSProperties = {
  minWidth: 130,
  padding: 16,
  borderRadius: 18,
  display: "grid",
  gap: 5,
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.16)",
};

const ordersGridStyle: CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  display: "grid",
  gap: 20,
};

const cardStyle: CSSProperties = {
  padding: 24,
  borderRadius: 24,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  boxShadow: "0 14px 34px rgba(15,23,42,0.09)",
};

const cardHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  marginBottom: 18,
};

const smallLabelStyle: CSSProperties = {
  color: "#0f766e",
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 5,
};

const productTitleStyle: CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: 25,
  fontWeight: 900,
};

const badgeStyle: CSSProperties = {
  padding: "7px 11px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const routeStyle: CSSProperties = {
  marginBottom: 18,
  padding: 16,
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  alignItems: "center",
  gap: 14,
  borderRadius: 18,
  background: "#f0fdfa",
  border: "1px solid #99f6e4",
  color: "#134e4a",
};

const routeLabelStyle: CSSProperties = {
  display: "block",
  marginBottom: 4,
  color: "#0f766e",
  fontSize: 11,
  fontWeight: 900,
};

const routeArrowStyle: CSSProperties = {
  color: "#0f766e",
  fontSize: 24,
  fontWeight: 900,
};

const infoGridStyle: CSSProperties = {
  marginBottom: 22,
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

const timelineStyle: CSSProperties = {
  marginBottom: 22,
  padding: 18,
  borderRadius: 18,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
};

const timelineItemStyle: CSSProperties = {
  minHeight: 56,
  display: "grid",
  gridTemplateColumns: "32px 1fr",
  gap: 12,
};

const timelineRailStyle: CSSProperties = {
  position: "relative",
  display: "flex",
  justifyContent: "center",
};

const timelineDotStyle: CSSProperties = {
  position: "relative",
  zIndex: 2,
  width: 28,
  height: 28,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  fontSize: 12,
  fontWeight: 900,
};

const timelineLineStyle: CSSProperties = {
  position: "absolute",
  top: 28,
  bottom: 0,
  width: 3,
  borderRadius: 999,
};

const timelineContentStyle: CSSProperties = {
  display: "grid",
  alignContent: "start",
  gap: 4,
  paddingTop: 4,
};

const timelineDateStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 12,
};

const actionsStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
};

const baseButtonStyle: CSSProperties = {
  minHeight: 44,
  padding: "11px 15px",
  border: "none",
  borderRadius: 12,
  color: "#ffffff",
  fontWeight: 900,
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const chatButtonStyle: CSSProperties = {
  ...baseButtonStyle,
  color: "#1d4ed8",
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
};

const primaryActionStyle: CSSProperties = {
  ...baseButtonStyle,
  background: "#2563eb",
};

const warningActionStyle: CSSProperties = {
  ...baseButtonStyle,
  background: "#d97706",
};

const successActionStyle: CSSProperties = {
  ...baseButtonStyle,
  background: "#16a34a",
};

const deliveredStyle: CSSProperties = {
  padding: "11px 15px",
  borderRadius: 12,
  color: "#166534",
  background: "#dcfce7",
  fontWeight: 900,
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
