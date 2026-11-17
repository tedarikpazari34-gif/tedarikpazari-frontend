import BuyerDisputesPanel from "../components/buyer/BuyerDisputesPanel";
import BuyerDisputeAction from "../components/buyer/BuyerDisputeAction";
import InvoiceList from "../components/InvoiceList";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { useTranslation } from "react-i18next";
import { unitLabel } from "../lib/unitLabel";
import BuyerPaymentIssueInfo from "../components/BuyerPaymentIssueInfo";

type Order = {
  id: string;
  status: string;
  totalAmount?: number | string;
  commissionAmount?: number | string;
  quantity?: number | null;
  unitPriceSnapshot?: number | string | null;
  productTitleSnapshot?: string | null;
  productSkuSnapshot?: string | null;
  unitTypeSnapshot?: string | null;
  variantName?: string | null;
  variantSku?: string | null;

  product?: {
    id?: string;
    title?: string;
    unitType?: string | null;
    basePrice?: number | string;
  } | null;

  shippingTrackingNo?: string | null;
  shippingCompany?: string | null;
  shippingMethod?: "CARGO" | "FREIGHT" | null;
  shippingDispatchNo?: string | null;
  shippedAt?: string | null;

  rfq?: {
    quantity?: number;
    unitType?: string | null;
    title?: string | null;
    product?: {
      title?: string;
    };
  };

  quote?: {
    unitPrice?: number | string;
    deliveryDays?: number;
    sellerNote?: string | null;
  };
};

const API =
  import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

type AttemptResult =
  | "SUCCESS"
  | "FAILED"
  | "REVIEW"
  | "PENDING"
  | "UNKNOWN";

async function getBuyerAttemptStatus(
  orderId: string,
  attemptId: string
): Promise<AttemptResult> {
  const validId = /^[A-Za-z0-9_-]{1,128}$/;

  if (!validId.test(orderId) || !validId.test(attemptId)) {
    return "UNKNOWN";
  }

  const token = localStorage.getItem("token");
  if (!token) return "UNKNOWN";

  try {
    const response = await fetch(
      `${API}/payments/iyzico/attempts/${encodeURIComponent(attemptId)}/status`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );

    if (!response.ok) return "UNKNOWN";

    const data = await response.json();

    if (
      data?.orderId !== orderId ||
      data?.paymentAttemptId !== attemptId
    ) {
      return "UNKNOWN";
    }

    if (
      data.status === "SUCCESS" ||
      data.status === "FAILED" ||
      data.status === "REVIEW" ||
      data.status === "PENDING"
    ) {
      return data.status;
    }

    return "UNKNOWN";
  } catch {
    return "UNKNOWN";
  }
}

function statusLabel(
  status: string,
  shippingCompany: string | null | undefined,
  t: (key: string) => string
) {
  switch (status) {
    case "PENDING_PAYMENT":
      return t("buyerOrdersPage.pendingPayment");

    case "PAID":
      return t("buyerOrdersPage.paid");

    case "PREPARING":
      return t("buyerOrdersPage.preparing");

    case "SHIPPED":
      return shippingCompany === "Kendi Teslimatım"
        ? t("buyerOrdersPage.readyForDelivery")
        : t("buyerOrdersPage.shipped");

    case "COMPLETED":
      return t("buyerOrdersPage.completed");

    default:
      return status;
  }
}

function statusStyle(status: string): CSSProperties {
  switch (status) {
    case "PENDING_PAYMENT":
      return {
        background: "#fef3c7",
        color: "#92400e",
      };

    case "PAID":
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
      };

    case "PREPARING":
      return {
        background: "#ede9fe",
        color: "#6d28d9",
      };

    case "SHIPPED":
      return {
        background: "#cffafe",
        color: "#155e75",
      };

    case "COMPLETED":
      return {
        background: "#dcfce7",
        color: "#166534",
      };

    default:
      return {
        background: "#e5e7eb",
        color: "#374151",
      };
  }
}

export default function BuyerOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoadingId, setPaymentLoadingId] = useState("");
  const [activePaymentAttemptId, setActivePaymentAttemptId] = useState("");
  const paymentPopupRef = useRef<Window | null>(null);
  const [paymentNotice, setPaymentNotice] = useState<
    { type: "success" | "error" | "info"; message: string } | null
  >(null);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError(t("buyerOrdersPage.loginRequired"));
        return;
      }

      const res = await fetch(`${API}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || t("buyerOrdersPage.loadFailed"));
        setOrders([]);
        return;
      }

      const safeOrders = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setOrders(
        safeOrders.filter((order: Order) => order.status !== "CANCELLED")
      );
    } catch (err) {
      console.error(err);
      setError(t("buyerOrdersPage.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (!payment) return;

    const orderId = searchParams.get("orderId") || "";
    const attemptId = searchParams.get("paymentAttemptId") || "";
    let cancelled = false;

    const applyResult = async () => {
      const verifiedStatus =
        await getBuyerAttemptStatus(orderId, attemptId);

      if (cancelled) return;

      const verified = verifiedStatus === "SUCCESS";

      setPaymentNotice(
        verified
          ? {
              type: "success",
              message: t("buyerOrdersPage.paymentSuccessMessage"),
            }
          : verifiedStatus === "FAILED"
          ? {
              type: "error",
              message: t("buyerOrdersPage.paymentFailedMessage"),
            }
          : {
              type: "info",
              message: t(
                verifiedStatus === "REVIEW"
                  ? "buyerOrdersPage.paymentReviewMessage"
                  : verifiedStatus === "PENDING"
                  ? "buyerOrdersPage.paymentPendingMessage"
                  : "buyerOrdersPage.paymentUnknownMessage"
              ),
            }
      );

      await loadOrders();
      if (cancelled) return;

      if (window.opener) {
        window.opener.postMessage(
          {
            type: "IYZICO_PAYMENT_RESULT",
            orderId,
            paymentAttemptId: attemptId,
            payment: verifiedStatus === "SUCCESS"
              ? "success"
              : verifiedStatus === "FAILED"
              ? "failed"
              : "review",
          },
          window.location.origin
        );

        window.setTimeout(() => window.close(), 900);
      }

      const next = new URLSearchParams(searchParams);
      next.delete("payment");
      next.delete("orderId");
      next.delete("paymentAttemptId");
      setSearchParams(next, { replace: true });
    };

    void applyResult();

    return () => {
      cancelled = true;
    };
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const handlePaymentMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!paymentPopupRef.current ||
          event.source !== paymentPopupRef.current) return;
      if (event.data?.type !== "IYZICO_PAYMENT_RESULT") return;

      const orderId = String(event.data?.orderId ?? "");
      const attemptId = String(event.data?.paymentAttemptId ?? "");

      if (
        !orderId ||
        orderId !== paymentLoadingId ||
        !attemptId ||
        attemptId !== activePaymentAttemptId
      ) {
        return;
      }

      const verifiedStatus =
        await getBuyerAttemptStatus(orderId, attemptId);

      const verified = verifiedStatus === "SUCCESS";

      setPaymentNotice(
        verified
          ? {
              type: "success",
              message: t("buyerOrdersPage.paymentSuccessMessage"),
            }
          : verifiedStatus === "FAILED"
          ? {
              type: "error",
              message: t("buyerOrdersPage.paymentFailedShort"),
            }
          : {
              type: "info",
              message: t(
                verifiedStatus === "REVIEW"
                  ? "buyerOrdersPage.paymentReviewMessage"
                  : verifiedStatus === "PENDING"
                  ? "buyerOrdersPage.paymentPendingMessage"
                  : "buyerOrdersPage.paymentUnknownMessage"
              ),
            }
      );

      setPaymentLoadingId("");
      setActivePaymentAttemptId("");
      await loadOrders();
    };

    window.addEventListener("message", handlePaymentMessage);

    return () => {
      window.removeEventListener("message", handlePaymentMessage);
    };
  }, [paymentLoadingId, activePaymentAttemptId]);

  const handleAction = async (
    orderId: string,
    action: string
  ) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API}/orders/${orderId}/${action}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message || t("buyerOrdersPage.actionFailed"));
        return;
      }

      alert(t("buyerOrdersPage.actionSuccess"));
     await loadOrders();
    } catch (err) {
      console.error(err);
      alert(t("buyerOrdersPage.requestError"));
    }
  };

  const handleIyzicoPayment = async (orderId: string) => {
    if (paymentLoadingId) return;

    try {
      setPaymentLoadingId(orderId);
      setPaymentNotice(null);

      const token = localStorage.getItem("token");

      if (!token) {
        alert(t("buyerOrdersPage.paymentLoginRequired"));
        return;
      }

      const res = await fetch(
        `${API}/payments/iyzico/${orderId}/initialize`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message || t("buyerOrdersPage.iyzicoStartFailed"));
        return;
      }

      const returnedAttemptId = String(data?.paymentAttemptId ?? "");

      if (!/^[A-Za-z0-9_-]{1,128}$/.test(returnedAttemptId)) {
        setPaymentLoadingId("");
        alert(t("buyerOrdersPage.iyzicoStartFailed"));
        return;
      }

      setActivePaymentAttemptId(returnedAttemptId);

      if (Capacitor.isNativePlatform()) {
        if (!data?.paymentPageUrl) {
          setPaymentLoadingId("");
          alert(t("buyerOrdersPage.mobilePaymentMissing"));
          return;
        }

        const browserListener = await Browser.addListener(
          "browserFinished",
          async () => {
            await browserListener.remove();
            setPaymentLoadingId("");
            loadOrders();
          }
        );

        await Browser.open({
          url: data.paymentPageUrl,
          presentationStyle: "fullscreen",
        });

        return;
      }

      if (!data?.checkoutFormContent) {
        alert(t("buyerOrdersPage.iyzicoFormMissing"));
        return;
      }

      const paymentWindow = window.open(
        "",
        "iyzico-payment",
        "width=520,height=760,scrollbars=yes,resizable=yes"
      );

      if (!paymentWindow) {
        alert(t("buyerOrdersPage.popupBlocked"));
        return;
      }

      paymentPopupRef.current = paymentWindow;
      paymentWindow.document.open();
      paymentWindow.document.write(`
        <!doctype html>
        <html lang="tr">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>${t("buyerOrdersPage.paymentTitle")}</title>
          </head>
          <body>
            ${data.checkoutFormContent}
          </body>
        </html>
      `);
      paymentWindow.document.close();

      const popupWatcher = window.setInterval(() => {
        if (paymentWindow.closed) {
          window.clearInterval(popupWatcher);
          setPaymentLoadingId("");
          loadOrders();
        }
      }, 700);
    } catch (err) {
      console.error("IYZICO PAYMENT ERROR:", err);
      setPaymentLoadingId("");
      alert(t("buyerOrdersPage.paymentStartError"));
    }
  };

  const startOrderChat = async (orderId: string) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/chat/order/${orderId}/thread`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data?.message || t("buyerOrdersPage.chatFailed"));
      return;
    }

    window.location.href = "/chat";
  } catch (err) {
    console.error("START ORDER CHAT ERROR:", err);
    alert(t("buyerOrdersPage.chatFailed"));
  }
};
  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={emptyCardStyle}>
          {t("buyerOrdersPage.loading")}
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <div style={eyebrowStyle}>
            {t("buyerOrdersPage.buyerPanel")}
          </div>

          <h1 style={titleStyle}>
            {t("buyerOrdersPage.title")}
          </h1>

          <p style={descStyle}>
            {t("buyerOrdersPage.description")}
          </p>
        </div>
      </section>

      {paymentNotice && (
        <div
          style={{
            ...paymentNoticeStyle,
            ...(paymentNotice.type === "success"
              ? paymentSuccessStyle
              : paymentNotice.type === "error"
              ? paymentErrorStyle
              : {}),
          }}
        >
          <strong>
            {paymentNotice.type === "success"
              ? t("buyerOrdersPage.paymentSuccess")
              : paymentNotice.type === "error"
              ? t("buyerOrdersPage.paymentFailed")
              : t("buyerOrdersPage.paymentVerificationTitle")}
          </strong>

          <span>{paymentNotice.message}</span>
        </div>
      )}

      <InvoiceList role="BUYER" />

      {error ? (
        <div style={errorCardStyle}>
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div style={emptyCardStyle}>
          <h2 style={{ marginTop: 0 }}>
            {t("buyerOrdersPage.noOrders")}
          </h2>

          <p style={{ color: "#64748b" }}>
            {t("buyerOrdersPage.noOrdersText")}
          </p>
        </div>
      ) : (
        <section style={gridStyle}>
          {orders.map((o) => (
            <article key={o.id} style={cardStyle}>
              <div style={cardTopStyle}>
                <div>
                  <div style={smallLabelStyle}>
                    {t("buyerOrdersPage.orderRequest")}
                  </div>

                  <h2 style={cardTitleStyle}>
                    {o.productTitleSnapshot ||
                      o.product?.title ||
                      o.rfq?.product?.title ||
                      o.rfq?.title ||
                      t("buyerOrdersPage.buyingRequest")}
                  </h2>
                  {!o.productTitleSnapshot && Boolean(o.product?.title) && (
                    <p
                      role="note"
                      style={{
                        color: "#92400e",
                        fontSize: 12,
                        lineHeight: 1.5,
                        margin: "6px 0 0"
                      }}
                    >
                      {t("buyerOrdersPage.currentProductInfoNotice")}
                    </p>
                  )}
                  {(o.productSkuSnapshot || o.variantName || o.variantSku) && (
                    <div style={{
                      fontSize: 12,
                      color: "#64748b",
                      marginTop: 4,
                      overflowWrap: "anywhere"
                    }}>
                      {[
                        o.productSkuSnapshot
                          ? `SKU: ${o.productSkuSnapshot}` : null,
                        o.variantName,
                        o.variantSku
                          ? `V-SKU: ${o.variantSku}` : null
                      ].filter(Boolean).join(" · ")}
                    </div>
                  )}
                </div>

                <span
                  style={{
                    ...badgeStyle,
                    ...statusStyle(o.status),
                  }}
                >
                  {statusLabel(o.status, o.shippingCompany, t)}
                </span>
              </div>

              <div style={infoGridStyle}>
                <Info
                  label={t("buyerOrdersPage.quantity")}
                  value={
                    o.quantity
                      ? `${o.quantity} ${unitLabel(o.unitTypeSnapshot ?? o.product?.unitType, t)}`
                      : o.rfq?.quantity
                        ? `${o.rfq.quantity} ${unitLabel(o.rfq.unitType, t)}`
                        : "-"
                  }
                />

                <Info
                  label={t("buyerOrdersPage.unitPrice")}
                  value={`${Number(
                    o.unitPriceSnapshot ??
                      (o.quantity && Number(o.quantity) > 0
                        ? Number(o.totalAmount || 0) / Number(o.quantity)
                        : (o.quote?.unitPrice ?? 0))
                  ).toLocaleString(locale)} ₺`}
                />

                <Info
                  label={t("buyerOrdersPage.delivery")}
                  value={
                    o.quote?.deliveryDays
                      ? t("buyerOrdersPage.days", { count: o.quote.deliveryDays })
                      : "-"
                  }
                />

                <Info
                  label={t("buyerOrdersPage.total")}
                  value={`${Number(
                    o.totalAmount || 0
                  ).toLocaleString(locale)} ₺`}
                />
              </div>

              <div style={noteBoxStyle}>
                <strong>{t("buyerOrdersPage.sellerNote")}</strong>

                <p>
                  {o.quote?.sellerNote ||
                    t("buyerOrdersPage.noNote")}
                </p>
              </div>

              {(o.status === "SHIPPED" || (o.status === "COMPLETED" && Boolean(o.shippingCompany || o.shippingTrackingNo || o.shippingDispatchNo))) && (
                <div style={shippingBoxStyle}>
                  {o.shippingCompany === "Kendi Teslimatım" ? (
                    <>
                      <div>🤝 {t("buyerOrdersPage.delivery")}: {t("buyerOrdersPage.selfDelivery")}</div>
                      <div>
                        {t("buyerOrdersPage.deliveryStatus")}: {o.status === "COMPLETED"
                          ? statusLabel(o.status, o.shippingCompany, t)
                          : t("buyerOrdersPage.readyForDelivery")}
                      </div>
                      <div>
                        {t("buyerOrdersPage.readyDate")}:{" "}
                        {o.shippedAt
                          ? new Date(o.shippedAt).toLocaleString(locale)
                          : "-"}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        🚚{" "}
                        {o.shippingMethod === "FREIGHT"
                          ? t("adminOrdersPage.freight")
                          : t("adminOrdersPage.cargo")}
                        : {o.shippingCompany || "-"}
                      </div>

                      <div>
                        {o.shippingMethod === "FREIGHT"
                          ? t("adminOrdersPage.trackingNo")
                          : t("buyerOrdersPage.trackingNo")}
                        :{" "}
                        {o.shippingTrackingNo || "-"}
                      </div>

                      {o.shippingDispatchNo && (
                        <div>
                          {t("adminOrdersPage.dispatchNo")}: {o.shippingDispatchNo}
                        </div>
                      )}

                      <div>
                        {t("buyerOrdersPage.shippingDate")}:{" "}
                        {o.shippedAt
                          ? new Date(o.shippedAt).toLocaleString(locale)
                          : "-"}
                      </div>
                    </>
                  )}
                </div>
              )}
              {o.status === "COMPLETED" && (
  <div style={{ marginTop: 12 }}>
    <Link
      to={`/reviews/new?orderId=${o.id}`}
      style={{
        display: "inline-block",
        padding: "10px 14px",
        background: "#f59e0b",
        color: "white",
        textDecoration: "none",
        borderRadius: 8,
        fontWeight: 700,
      }}
    >
      ⭐ {t("buyerOrdersPage.reviewSeller")}
    </Link>
  </div>
)}
              {["PAID", "PREPARING", "SHIPPED", "COMPLETED"].includes(
                o.status
              ) && (
                <BuyerPaymentIssueInfo orderId={o.id} />
              )}

              {["PAID", "PREPARING", "SHIPPED"].includes(o.status) && (
                <BuyerDisputeAction orderId={o.id} />
              )}

              <div style={actionsStyle}>

  <button
    style={chatButtonStyle}
    onClick={() => startOrderChat(o.id)}
  >
    💬 {t("buyerOrdersPage.message")}
  </button>

  {o.status === "PENDING_PAYMENT" && (
                  <button
                    style={{
                      ...blueButtonStyle,
                      opacity:
                        paymentLoadingId === o.id ? 0.65 : 1,
                      cursor:
                        paymentLoadingId === o.id
                          ? "not-allowed"
                          : "pointer",
                    }}
                    disabled={paymentLoadingId === o.id}
                    onClick={() =>
                      handleIyzicoPayment(o.id)
                    }
                  >
                    {paymentLoadingId === o.id
                      ? t("buyerOrdersPage.openingPayment")
                      : t("buyerOrdersPage.pay")}
                  </button>
                )}

                {o.status === "PENDING_PAYMENT" && (
                  <button
                    style={cancelButtonStyle}
                    onClick={() => {
                      const confirmed = window.confirm(
                        "Bu ödeme bekleyen siparişi iptal etmek istediğinize emin misiniz?"
                      );
                      if (confirmed) {
                        handleAction(o.id, "cancel");
                      }
                    }}
                  >
                    Siparişi İptal Et
                  </button>
                )}

                {o.status === "SHIPPED" && (
                  <button
                    style={greenButtonStyle}
                    onClick={() =>
                      handleAction(
                        o.id,
                        "complete"
                      )
                    }
                  >
                    {t("buyerOrdersPage.received")}
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      )}
      <BuyerDisputesPanel />
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
    "linear-gradient(135deg, #0f172a, #2563eb)",
  color: "white",
  borderRadius: 28,
  padding: 32,
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
  color: "#cbd5e1",
  maxWidth: 720,
  lineHeight: 1.7,
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
  borderRadius: 24,
  padding: 24,
  border: "1px solid #e2e8f0",
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
  margin: 0,
  fontSize: 22,
  fontWeight: 900,
  color: "#0f172a",
};

const badgeStyle: CSSProperties = {
  borderRadius: 999,
  padding: "7px 11px",
  fontSize: 12,
  fontWeight: 900,
};

const infoGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginBottom: 16,
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
  marginBottom: 16,
  color: "#334155",
};

const shippingBoxStyle: CSSProperties = {
  background: "#ecfeff",
  border: "1px solid #a5f3fc",
  color: "#155e75",
  borderRadius: 14,
  padding: 14,
  marginBottom: 16,
  display: "grid",
  gap: 6,
};

const actionsStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
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

const cancelButtonStyle: CSSProperties = {
  border: "1px solid #dc2626",
  background: "white",
  color: "#dc2626",
  padding: "12px 16px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 900,
};

const greenButtonStyle: CSSProperties = {
  border: "none",
  background: "#16a34a",
  color: "white",
  padding: "12px 16px",
  borderRadius: 12,
  cursor: "pointer",
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
const chatButtonStyle: CSSProperties = {
  border: "1px solid #bfdbfe",
  background: "#eff6ff",
  color: "#1d4ed8",
  padding: "12px 16px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 900,
};
const paymentNoticeStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 20px",
  padding: "15px 17px",
  display: "flex",
  flexDirection: "column",
  gap: 5,
  borderRadius: 15,
  border: "1px solid",
  lineHeight: 1.55,
};

const paymentSuccessStyle: CSSProperties = {
  color: "#166534",
  background: "#f0fdf4",
  borderColor: "#bbf7d0",
};

const paymentErrorStyle: CSSProperties = {
  color: "#991b1b",
  background: "#fef2f2",
  borderColor: "#fecaca",
};
