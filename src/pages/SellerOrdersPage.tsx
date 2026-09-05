import { useEffect, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";

type Order = {
  id: string;
  status: string;
  totalAmount?: number | string;
  commissionAmount?: number | string;
  rfq?: {
    quantity?: number;
    title?: string | null;
    product?: {
      title?: string;
    };
  };
  quote?: {
    unitPrice?: number | string;
  };
  buyer?: {
    id?: string;
    name?: string;
    companyName?: string;
    email?: string;
  };
};

const API = "https://tedarik-backend.onrender.com/api";

function formatPrice(value: number | string | undefined, locale: string) {
  const numeric = Number(value || 0);
  return `${numeric.toLocaleString(locale)} ₺`;
}

function statusLabel(status: string, t: any) {
  if (status === "PENDING_PAYMENT") return t("sellerOrdersPage.pendingPayment");
  if (status === "PAID") return t("sellerOrdersPage.paid");
  if (status === "PREPARING") return t("sellerOrdersPage.preparing");
  if (status === "SHIPPED") return t("sellerOrdersPage.shipped");
  if (status === "COMPLETED") return t("sellerOrdersPage.completed");
  if (status === "CANCELLED") return t("sellerOrdersPage.cancelled");
  return status || "-";
}

function statusStyle(status: string): CSSProperties {
  if (status === "PAID") return { background: "#dbeafe", color: "#1d4ed8" };
  if (status === "PREPARING") return { background: "#ede9fe", color: "#6d28d9" };
  if (status === "SHIPPED") return { background: "#cffafe", color: "#155e75" };
  if (status === "COMPLETED") return { background: "#dcfce7", color: "#166534" };
  if (status === "PENDING_PAYMENT") return { background: "#fef3c7", color: "#92400e" };
  return { background: "#e5e7eb", color: "#374151" };
}

export default function SellerOrdersPage() {
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

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError(t("sellerOrdersPage.loginRequired"));
        setOrders([]);
        return;
      }

      const res = await fetch(`${API}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || t("sellerOrdersPage.loadFailed"));
        setOrders([]);
        return;
      }

      const safeOrders = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setOrders(safeOrders);
    } catch (err) {
      console.error("ORDER LOAD ERROR:", err);
      setError(t("sellerOrdersPage.loadFailed"));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrepare = async (orderId: string) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/orders/${orderId}/prepare`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message || t("sellerOrdersPage.prepareFailed"));
        return;
      }

      alert(t("sellerOrdersPage.prepareSuccess"));
      loadOrders();
    } catch (err) {
      console.error("PREPARE ERROR:", err);
      alert(t("sellerOrdersPage.prepareError"));
    }
  };

  const handleShip = async (orderId: string) => {
  const shippingCompany = window.prompt(
    t("sellerOrdersPage.shippingCompanyPrompt"),
    "Yurtiçi Kargo"
  );

  if (!shippingCompany?.trim()) {
    return;
  }

  const shippingTrackingNo = window.prompt(
    t("sellerOrdersPage.trackingNoPrompt")
  );

  if (!shippingTrackingNo?.trim()) {
    return;
  }

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert(t("sellerOrdersPage.loginShort"));
      return;
    }

    const res = await fetch(`${API}/orders/${orderId}/ship`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        shippingCompany: shippingCompany.trim(),
        shippingTrackingNo: shippingTrackingNo.trim(),
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      alert(data?.message || t("sellerOrdersPage.shippingFailed"));
      return;
    }

    alert(t("sellerOrdersPage.shippingSuccess"));
    await loadOrders();
  } catch (err) {
    console.error("SHIP ERROR:", err);
    alert(t("sellerOrdersPage.shippingError"));
  }
};
  const handleOpenDispute = async (orderId: string) => {
    const reason = window.prompt(t("sellerOrdersPage.disputeReasonPrompt"));

    if (!reason?.trim()) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert(t("sellerOrdersPage.loginShort"));
        return;
      }

      const res = await fetch(`${API}/disputes/${orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: reason.trim(),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message || t("sellerOrdersPage.disputeFailed"));
        return;
      }

      alert(t("sellerOrdersPage.disputeSuccess"));
      loadOrders();
    } catch (err) {
      console.error("DISPUTE ERROR:", err);
      alert(t("sellerOrdersPage.disputeError"));
    }
  };
  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={emptyCardStyle}>{t("sellerOrdersPage.loading")}</div>
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
          <div style={eyebrowStyle}>{t("sellerOrdersPage.eyebrow")}</div>
          <h1 style={titleStyle}>{t("sellerOrdersPage.title")}</h1>
          <p style={descStyle}>
            {t("sellerOrdersPage.description")}
          </p>
        </div>

        <div
          style={{
            ...heroStatStyle,
            width: isMobile ? "100%" : "auto",
            minWidth: isMobile ? 0 : 160,
            boxSizing: "border-box",
            marginTop: isMobile ? 16 : 0,
          }}
        >
          <span>{t("sellerOrdersPage.totalOrders")}</span>
          <strong>{orders.length}</strong>
        </div>
      </section>

      <section style={statsStyle}>
        <Stat label={t("sellerOrdersPage.paidStat")} value={orders.filter((o) => o.status === "PAID").length} />
        <Stat label={t("sellerOrdersPage.preparingStat")} value={orders.filter((o) => o.status === "PREPARING").length} />
        <Stat label={t("sellerOrdersPage.shippedStat")} value={orders.filter((o) => o.status === "SHIPPED").length} />
      </section>

      {error ? (
        <div style={errorCardStyle}>{error}</div>
      ) : orders.length === 0 ? (
        <div style={emptyCardStyle}>
          <h2 style={{ marginTop: 0 }}>{t("sellerOrdersPage.emptyTitle")}</h2>
          <p style={{ color: "#64748b", lineHeight: 1.7 }}>
            {t("sellerOrdersPage.emptyText")}
          </p>
        </div>
      ) : (
        <section style={gridStyle}>
          {orders.map((o) => (
            <article key={o.id} style={cardStyle}>
              <div style={cardTopStyle}>
                <div>
                  <div style={smallLabelStyle}>{t("sellerOrdersPage.orderRequest")}</div>
                  <h2 style={cardTitleStyle}>
                    {o.rfq?.product?.title ||
                      o.rfq?.title ||
                      t("sellerOrdersPage.buyingRequest")}
                  </h2>
                </div>

                <span style={{ ...badgeStyle, ...statusStyle(o.status) }}>
                  {statusLabel(o.status, t)}
                </span>
              </div>

              <div style={infoGridStyle}>
                <Info label={t("sellerOrdersPage.buyer")} value={o.buyer?.name || o.buyer?.companyName || "-"} />
                <Info label={t("sellerOrdersPage.quantity")} value={o.rfq?.quantity || "-"} />
                <Info label={t("sellerOrdersPage.unitPrice")} value={formatPrice(o.quote?.unitPrice, locale)} />
                <Info label={t("sellerOrdersPage.total")} value={formatPrice(o.totalAmount, locale)} />
              </div>

              <div style={commissionBoxStyle}>
                <span>{t("sellerOrdersPage.platformCommission")}</span>
                <strong>{formatPrice(o.commissionAmount, locale)}</strong>
              </div>

              <div style={actionsStyle}>
                {o.status === "PAID" && (
                  <button onClick={() => handlePrepare(o.id)} style={orangeButtonStyle}>
                    {t("sellerOrdersPage.startPreparing")}
                  </button>
                )}

                {o.status === "PREPARING" && (
                  <>
                    <button onClick={() => handleShip(o.id)} style={blueButtonStyle}>
                      {t("sellerOrdersPage.shipOrder")}
                    </button>

                    <button
                      onClick={async () => {
                        const ok = window.confirm(
                          t("sellerOrdersPage.selfDeliveryConfirm")
                        );

                        if (!ok) return;

                        try {
                          const token = localStorage.getItem("token");

                          const res = await fetch(
                            `${API}/orders/${o.id}/self-delivery`,
                            {
                              method: "POST",
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            }
                          );

                          const data = await res.json().catch(() => null);

                          if (!res.ok) {
                            alert(data?.message || t("sellerOrdersPage.operationFailed"));
                            return;
                          }

                          alert(t("sellerOrdersPage.selfDeliverySuccess"));
                          loadOrders();
                        } catch (err) {
                          console.error("SELF DELIVERY ERROR:", err);
                          alert(t("sellerOrdersPage.operationError"));
                        }
                      }}
                      style={orangeButtonStyle}
                    >
                      {t("sellerOrdersPage.readyForDelivery")}
                    </button>
                  </>
                )}

                {o.status !== "PAID" && o.status !== "PREPARING" && (
                  <div style={passiveActionStyle}>
                    {t("sellerOrdersPage.noActionRequired")}
                  </div>
                )}

                {!o.status.includes("CANCELLED") && (
                  <button
                    onClick={() => handleOpenDispute(o.id)}
                    style={disputeButtonStyle}
                  >
                    {t("sellerOrdersPage.openDispute")}
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={statCardStyle}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
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

const heroStatStyle: CSSProperties = {
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 20,
  padding: 20,
  minWidth: 160,
  display: "grid",
  gap: 6,
};

const statsStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
};

const statCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 20,
  padding: 20,
  boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
  display: "grid",
  gap: 8,
  color: "#0f172a",
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

const commissionBoxStyle: CSSProperties = {
  background: "#f0fdf4",
  color: "#166534",
  border: "1px solid #bbf7d0",
  borderRadius: 14,
  padding: 14,
  marginBottom: 16,
  display: "grid",
  gap: 4,
};

const actionsStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const orangeButtonStyle: CSSProperties = {
  border: "none",
  background: "#f59e0b",
  color: "white",
  padding: "12px 16px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 900,
};

const blueButtonStyle: CSSProperties = {
  border: "none",
  background: "#2563eb",
  color: "white",
  padding: "12px 16px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 900,
};

const passiveActionStyle: CSSProperties = {
  background: "#f1f5f9",
  color: "#64748b",
  padding: "12px 16px",
  borderRadius: 12,
  fontWeight: 900,
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
};
const disputeButtonStyle: CSSProperties = {
  border: "none",
  background: "#dc2626",
  color: "white",
  padding: "12px 16px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 900,
};