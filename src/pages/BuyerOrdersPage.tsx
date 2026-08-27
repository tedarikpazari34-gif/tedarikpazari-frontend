import { useEffect, useState, type CSSProperties } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

type Order = {
  id: string;
  status: string;
  totalAmount?: number | string;
  commissionAmount?: number | string;

  shippingTrackingNo?: string | null;
  shippingCompany?: string | null;
  shippedAt?: string | null;

  rfq?: {
    quantity?: number;
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

function statusLabel(status: string, shippingCompany?: string | null) {
  switch (status) {
    case "PENDING_PAYMENT":
      return "Ödeme Bekleniyor";

    case "PAID":
      return "Ödeme Alındı";

    case "PREPARING":
      return "Hazırlanıyor";

    case "SHIPPED":
      return shippingCompany === "Kendi Teslimatım"
        ? "Teslime Hazır"
        : "Kargoda";

    case "COMPLETED":
      return "Tamamlandı";

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoadingId, setPaymentLoadingId] = useState("");
  const [paymentNotice, setPaymentNotice] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Giriş yapmanız gerekiyor");
        return;
      }

      const res = await fetch(`${API}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Siparişler alınamadı");
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
      console.error(err);
      setError("Siparişler alınamadı");
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

    const isSuccess = payment === "success";

    setPaymentNotice({
      type: isSuccess ? "success" : "error",
      message: isSuccess
        ? "Ödemeniz başarıyla doğrulandı. Sipariş durumu güncellendi."
        : "Ödeme tamamlanamadı. Kartınızdan çekim yapıldıysa destek ekibimizle iletişime geçin.",
    });

    loadOrders();

    if (window.opener) {
      window.opener.postMessage(
        {
          type: "IYZICO_PAYMENT_RESULT",
          success: isSuccess,
        },
        window.location.origin
      );

      window.setTimeout(() => window.close(), 900);
    }

    const next = new URLSearchParams(searchParams);
    next.delete("payment");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const handlePaymentMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type !== "IYZICO_PAYMENT_RESULT") return;

      const isSuccess = Boolean(event.data.success);

      setPaymentNotice({
        type: isSuccess ? "success" : "error",
        message: isSuccess
          ? "Ödemeniz başarıyla doğrulandı. Sipariş durumu güncellendi."
          : "Ödeme tamamlanamadı.",
      });

      setPaymentLoadingId("");
      loadOrders();
    };

    window.addEventListener("message", handlePaymentMessage);

    return () => {
      window.removeEventListener("message", handlePaymentMessage);
    };
  }, []);

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
        alert(data?.message || "İşlem başarısız");
        return;
      }

      alert("İşlem başarılı ✅");
     await loadOrders();
    } catch (err) {
      console.error(err);
      alert("İstek hatası");
    }
  };

  const handleIyzicoPayment = async (orderId: string) => {
    if (paymentLoadingId) return;

    try {
      setPaymentLoadingId(orderId);
      setPaymentNotice(null);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Ödeme yapmak için giriş yapmalısınız.");
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
        alert(data?.message || "iyzico ödeme formu başlatılamadı");
        return;
      }

      if (Capacitor.isNativePlatform()) {
        if (!data?.paymentPageUrl) {
          setPaymentLoadingId("");
          alert("Mobil ödeme sayfası alınamadı");
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
        alert("iyzico ödeme formu alınamadı");
        return;
      }

      const paymentWindow = window.open(
        "",
        "iyzico-payment",
        "width=520,height=760,scrollbars=yes,resizable=yes"
      );

      if (!paymentWindow) {
        alert("Ödeme penceresi açılamadı. Tarayıcı popup iznini kontrol edin.");
        return;
      }

      paymentWindow.document.open();
      paymentWindow.document.write(`
        <!doctype html>
        <html lang="tr">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Tedarik Pazarı - Güvenli Ödeme</title>
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
      alert("Ödeme başlatılırken hata oluştu");
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
      alert(data?.message || "Chat başlatılamadı");
      return;
    }

    window.location.href = "/chat";
  } catch (err) {
    console.error("START ORDER CHAT ERROR:", err);
    alert("Chat başlatılamadı");
  }
};
  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={emptyCardStyle}>
          Siparişler yükleniyor...
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <div style={eyebrowStyle}>
            BUYER PANELİ
          </div>

          <h1 style={titleStyle}>
            Siparişlerim
          </h1>

          <p style={descStyle}>
            Siparişlerinizi, ödeme durumlarını,
            kargo süreçlerini ve teslimatları
            tek ekrandan takip edin.
          </p>
        </div>
      </section>

      {paymentNotice && (
        <div
          style={{
            ...paymentNoticeStyle,
            ...(paymentNotice.type === "success"
              ? paymentSuccessStyle
              : paymentErrorStyle),
          }}
        >
          <strong>
            {paymentNotice.type === "success"
              ? "✓ Ödeme başarılı"
              : "⚠ Ödeme başarısız"}
          </strong>

          <span>{paymentNotice.message}</span>
        </div>
      )}

      {error ? (
        <div style={errorCardStyle}>
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div style={emptyCardStyle}>
          <h2 style={{ marginTop: 0 }}>
            Henüz sipariş yok
          </h2>

          <p style={{ color: "#64748b" }}>
            Kabul ettiğiniz teklifler burada
            görünecek.
          </p>
        </div>
      ) : (
        <section style={gridStyle}>
          {orders.map((o) => (
            <article key={o.id} style={cardStyle}>
              <div style={cardTopStyle}>
                <div>
                  <div style={smallLabelStyle}>
                    Sipariş / Talep
                  </div>

                  <h2 style={cardTitleStyle}>
                    {o.rfq?.product?.title ||
                      o.rfq?.title ||
                      "Alım Talebi"}
                  </h2>
                </div>

                <span
                  style={{
                    ...badgeStyle,
                    ...statusStyle(o.status),
                  }}
                >
                  {statusLabel(o.status, o.shippingCompany)}
                </span>
              </div>

              <div style={infoGridStyle}>
                <Info
                  label="Miktar"
                  value={o.rfq?.quantity || "-"}
                />

                <Info
                  label="Birim Fiyat"
                  value={`${Number(
                    o.quote?.unitPrice || 0
                  ).toLocaleString("tr-TR")} ₺`}
                />

                <Info
                  label="Teslim"
                  value={`${
                    o.quote?.deliveryDays || "-"
                  } gün`}
                />

                <Info
                  label="Toplam"
                  value={`${Number(
                    o.totalAmount || 0
                  ).toLocaleString("tr-TR")} ₺`}
                />
              </div>

              <div style={noteBoxStyle}>
                <strong>Satıcı Notu</strong>

                <p>
                  {o.quote?.sellerNote ||
                    "Not bulunmuyor"}
                </p>
              </div>

              {o.status === "SHIPPED" && (
                <div style={shippingBoxStyle}>
                  {o.shippingCompany === "Kendi Teslimatım" ? (
                    <>
                      <div>🤝 Teslimat: Kendi Teslimatım</div>
                      <div>
                        Durum: Teslime Hazır
                      </div>
                      <div>
                        Hazır Olma Tarihi:{" "}
                        {o.shippedAt
                          ? new Date(o.shippedAt).toLocaleString("tr-TR")
                          : "-"}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        🚚 {o.shippingCompany || "-"}
                      </div>

                      <div>
                        Takip No:{" "}
                        {o.shippingTrackingNo || "-"}
                      </div>

                      <div>
                        Çıkış Tarihi:{" "}
                        {o.shippedAt
                          ? new Date(o.shippedAt).toLocaleString("tr-TR")
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
      ⭐ Satıcıyı Değerlendir
    </Link>
  </div>
)}
              <div style={actionsStyle}>

  <button
    style={chatButtonStyle}
    onClick={() => startOrderChat(o.id)}
  >
    💬 Mesajlaş
  </button>

  {["PAID", "PREPARING", "SHIPPED", "COMPLETED"].includes(
    o.status
  ) && (
    <Link
      to={`/buyer/shipping-request?orderId=${o.id}`}
      style={{
        ...shippingButtonStyle,
        textDecoration: "none",
      }}
    >
      🚚 Nakliye Teklifi Al
    </Link>
  )}

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
                      ? "Ödeme açılıyor..."
                      : "💳 Ödeme Yap"}
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
                    ✅ Teslim Aldım
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

const shippingButtonStyle: CSSProperties = {
  border: "none",
  background: "#0f766e",
  color: "white",
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 800,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
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
