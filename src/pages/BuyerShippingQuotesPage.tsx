import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";

const API =
  import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

const statusIndex: Record<string, number> = {
  PENDING_PICKUP: 1,
  PICKED_UP: 2,
  IN_TRANSIT: 3,
  DELIVERED: 4,
};

const timelineSteps = [
  "Talep oluşturuldu",
  "Nakliyeci seçildi",
  "Yük teslim alındı",
  "Araç yola çıktı",
  "Teslim edildi",
];

function BuyerTimeline({ order }: { order: any }) {
  const currentIndex = statusIndex[order.status] ?? 0;

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
        alert(quotesData?.message || "Teklifler alınamadı");
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
        alert(data?.message || "Nakliye seçilemedi");
        return;
      }

      alert("Nakliye firması seçildi ✅");
      await load();
    } catch (err) {
      console.error("ACCEPT SHIPPING QUOTE ERROR:", err);
      alert("İşlem sırasında hata oluştu");
    } finally {
      setAcceptingId("");
    }
  };

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={emptyStyle}>Nakliye teklifleri yükleniyor...</div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <div style={eyebrowStyle}>ALICI LOJİSTİK PANELİ</div>
          <h1 style={titleStyle}>Nakliye Tekliflerim</h1>
          <p style={descStyle}>
            Nakliye tekliflerini karşılaştırın, taşıyıcıyı seçin ve
            teslimat sürecini adım adım takip edin.
          </p>
        </div>
      </section>

      {quotes.length === 0 ? (
        <div style={emptyStyle}>
          <h2 style={{ marginTop: 0 }}>Henüz nakliye teklifi yok</h2>
          <p style={{ color: "#64748b" }}>
            Lojistik firmaları teklif verdiğinde burada görünecek.
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
                    <div style={smallLabelStyle}>NAKLİYE TEKLİFİ</div>
                    <h2 style={companyTitleStyle}>
                      {quote.company?.name ||
                        quote.company?.companyName ||
                        "Lojistik Firması"}
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
                      ? "Seçildi"
                      : quote.status === "REJECTED"
                      ? "Reddedildi"
                      : "Teklif Geldi"}
                  </span>
                </div>

                <div style={infoGridStyle}>
                  <Info
                    label="Ürün"
                    value={
                      quote.rfq?.order?.rfq?.product?.title || "-"
                    }
                  />
                  <Info
                    label="Nakliye Bedeli"
                    value={`${Number(
                      quote.price || 0
                    ).toLocaleString("tr-TR")} ₺`}
                  />
                  <Info
                    label="Teslim Süresi"
                    value={`${quote.deliveryDays || "-"} gün`}
                  />
                </div>

                <div style={noteStyle}>
                  <strong>Nakliyeci Notu</strong>
                  <p>{quote.note || "Not eklenmemiş."}</p>
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
                      ? "Nakliyeci seçiliyor..."
                      : "Nakliyeciyi Seç"}
                  </button>
                )}

                {quote.status === "ACCEPTED" && shippingOrder && (
                  <div style={trackingPanelStyle}>
                    <div style={trackingHeaderStyle}>
                      <div>
                        <span style={trackingLabelStyle}>
                          TAŞIMA TAKİBİ
                        </span>
                        <strong>
                          {shippingOrder.trackingNo || "-"}
                        </strong>
                      </div>

                      <Link to="/chat" style={chatLinkStyle}>
                        💬 Nakliye Sohbeti
                      </Link>
                    </div>

                    <BuyerTimeline order={shippingOrder} />
                  </div>
                )}

                {quote.status === "ACCEPTED" && !shippingOrder && (
                  <div style={acceptedNoticeStyle}>
                    ✅ Nakliye firması seçildi. Taşıma siparişi
                    hazırlanıyor.
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
