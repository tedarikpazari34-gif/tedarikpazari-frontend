import { useEffect, useState, type CSSProperties } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

type RFQ = {
  id: string;
  quantity: number;
  note?: string | null;
  status: string;
  createdAt?: string;
  product?: { id?: string; title?: string };
};

type Quote = {
  id: string;
  rfqId?: string;
  unitPrice?: string | number;
  deliveryDays?: number;
  sellerNote?: string | null;
  status?: string;
  rfq?: { id?: string };
  seller?: {
    id?: string;
    name?: string;
    verified?: boolean;
    rating?: number;
    reviewCount?: number;
    completedDeals?: number;
    responseTime?: number;
    city?: string | null;
    country?: string | null;
    logo?: string | null;
  };
};

const API = "https://tedarik-backend.onrender.com/api";

function formatPrice(value?: string | number) {
  if (value === undefined || value === null || value === "") return "-";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return String(value);
  return `${numeric.toLocaleString("tr-TR")} ₺`;
}

function statusLabel(status?: string) {
  const value = status?.toUpperCase();

  if (value === "SENT") return "Gönderildi";
  if (value === "ACCEPTED") return "Kabul edildi";
  if (value === "REJECTED") return "Reddedildi";
  if (value === "OPEN") return "Açık";
  if (value === "PENDING") return "Beklemede";
  if (value === "CLOSED") return "Kapandı";

  return status || "-";
}

function statusStyle(status?: string): CSSProperties {
  const value = status?.toUpperCase();

  if (value === "ACCEPTED" || value === "OPEN") {
    return { background: "#dcfce7", color: "#166534" };
  }

  if (value === "SENT" || value === "PENDING") {
    return { background: "#fef3c7", color: "#92400e" };
  }

  if (value === "REJECTED" || value === "CLOSED") {
    return { background: "#fee2e2", color: "#991b1b" };
  }

  return { background: "#e0f2fe", color: "#0369a1" };
}

export default function BuyerRfqDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const [quoteSort, setQuoteSort] = useState<"price" | "delivery">("price");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Bu sayfayı görmek için giriş yapmalısınız.");
          setLoading(false);
          return;
        }

        const rfqRes = await fetch(`${API}/rfqs/mine`, {
  headers: { Authorization: `Bearer ${token}` },
});

const rfqData = await rfqRes.json();


const found = Array.isArray(rfqData)
  ? rfqData.find((item: RFQ) => item.id === id)
  : null;


setRfq(found || null);

        const qRes = await fetch(`${API}/quotes/buyer`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (qRes.ok) {
          const qData = await qRes.json();

          const filtered = Array.isArray(qData)
            ? qData.filter(
                (quote: Quote) => quote.rfqId === id || quote.rfq?.id === id
              )
            : [];

          setQuotes(filtered);
        } else {
          setQuotes([]);
        }
      } catch (err) {
        console.error(err);
        setError("Teklif detayları alınamadı.");
        setQuotes([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const closeRfq = async () => {
    if (!rfq || rfq.status === "CLOSED") return;

    const confirmed = window.confirm(
      "Bu teklif talebini kapatmak istediğinize emin misiniz? Kapattıktan sonra yeni teklif alınamaz."
    );

    if (!confirmed) return;

    try {
      setClosing(true);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/rfqs/${rfq.id}/close`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message || "RFQ kapatılamadı.");
        return;
      }

      setRfq((current) =>
        current ? { ...current, status: "CLOSED" } : current
      );

      alert("Teklif talebi kapatıldı.");
    } catch (err) {
      console.error("RFQ CLOSE ERROR:", err);
      alert("RFQ kapatılırken hata oluştu.");
    } finally {
      setClosing(false);
    }
  };

  const copyRfq = () => {
    if (!rfq) return;

    const params = new URLSearchParams();

    if (rfq.product?.id) {
      params.set("productId", rfq.product.id);
    }

    if (rfq.product?.title) {
      params.set("product", rfq.product.title);
    }

    params.set("quantity", String(rfq.quantity || 1));

    if (rfq.note) {
      params.set("note", rfq.note);
    }

    navigate(`/buyer/rfqs/new?${params.toString()}`);
  };

  const acceptQuote = async (quoteId: string) => {
    try {
      setAcceptingId(quoteId);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/orders/from-quote/${quoteId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        alert("Sipariş oluşturulamadı ❌");
        return;
      }

      alert("Teklif kabul edildi ✅");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Hata oluştu ❌");
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={emptyCardStyle}>Teklif detayları yükleniyor...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={pageStyle}>
        <div style={errorCardStyle}>
          <h2 style={{ marginTop: 0 }}>Bir sorun oluştu</h2>
          <p>{error}</p>
          <Link to="/login" style={primaryLinkStyle}>
            Giriş Yap
          </Link>
        </div>
      </main>
    );
  }

  if (!rfq) {
    return (
      <main style={pageStyle}>
        <div style={emptyCardStyle}>
          <h2 style={{ marginTop: 0 }}>RFQ bulunamadı</h2>
          <p>Bu teklif talebi kaldırılmış olabilir veya erişiminiz olmayabilir.</p>
          <Link to="/buyer/rfqs" style={primaryLinkStyle}>
            Taleplerime Dön
          </Link>
        </div>
      </main>
    );
  }

  const pricedQuotes = quotes.filter(
    (quote) => quote.unitPrice !== undefined && quote.unitPrice !== null
  );

  const bestQuote = [...pricedQuotes].sort(
    (a, b) => Number(a.unitPrice) - Number(b.unitPrice)
  )[0];

  const fastestQuote = [...quotes]
    .filter((quote) => quote.deliveryDays !== undefined)
    .sort(
      (a, b) =>
        Number(a.deliveryDays || 0) - Number(b.deliveryDays || 0)
    )[0];

  const sortedQuotes = [...quotes].sort((a, b) => {
    if (quoteSort === "delivery") {
      return (
        Number(a.deliveryDays ?? Number.MAX_SAFE_INTEGER) -
        Number(b.deliveryDays ?? Number.MAX_SAFE_INTEGER)
      );
    }

    return (
      Number(a.unitPrice ?? Number.MAX_SAFE_INTEGER) -
      Number(b.unitPrice ?? Number.MAX_SAFE_INTEGER)
    );
  });

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <div style={eyebrowStyle}>RFQ DETAYI</div>

          <h1 style={titleStyle}>
            {rfq.product?.title || "Genel Teklif Talebi"}
          </h1>

          <p style={descriptionStyle}>
            Gelen teklifleri karşılaştırın, fiyat ve teslim süresine göre en uygun
            teklifi seçin.
          </p>
        </div>

        <div style={heroActionsStyle}>
          <button
            type="button"
            onClick={copyRfq}
            style={copyButtonStyle}
          >
            Talebi Kopyala
          </button>

          {rfq.status === "OPEN" && (
            <button
              type="button"
              onClick={closeRfq}
              disabled={closing}
              style={{
                ...closeButtonStyle,
                opacity: closing ? 0.65 : 1,
              }}
            >
              {closing ? "Kapatılıyor..." : "Talebi Kapat"}
            </button>
          )}

          <Link to="/buyer/rfqs" style={backButtonStyle}>
            Taleplerime Dön
          </Link>
        </div>
      </section>

      <section style={summaryGridStyle}>
        <InfoCard label="Miktar" value={rfq.quantity || "-"} />
        <InfoCard label="RFQ Durumu" value={statusLabel(rfq.status)} />
        <InfoCard label="Gelen Teklif" value={quotes.length} />
        <InfoCard
          label="En İyi Fiyat"
          value={bestQuote ? formatPrice(bestQuote.unitPrice) : "-"}
        />
      </section>

      <section style={detailCardStyle}>
        <div style={detailTopStyle}>
          <div>
            <div style={smallLabelStyle}>Talep Notu</div>
            <p style={noteStyle}>{rfq.note || "Not eklenmemiş."}</p>
          </div>

          <span
            style={{
              ...badgeStyle,
              ...statusStyle(rfq.status),
            }}
          >
            {statusLabel(rfq.status)}
          </span>
        </div>
      </section>

      <section style={quotesHeaderStyle}>
        <div>
          <div style={eyebrowDarkStyle}>TEDARİKÇİ TEKLİFLERİ</div>
          <h2 style={sectionTitleStyle}>Gelen Teklifler</h2>
        </div>

        <div style={quoteHeaderActionsStyle}>
          {quotes.length > 1 && (
            <select
              value={quoteSort}
              onChange={(event) =>
                setQuoteSort(
                  event.target.value as "price" | "delivery"
                )
              }
              style={sortSelectStyle}
            >
              <option value="price">Fiyata göre sırala</option>
              <option value="delivery">Teslim süresine göre sırala</option>
            </select>
          )}

          <Link to="/products" style={secondaryLinkStyle}>
            Yeni ürün keşfet
          </Link>
        </div>
      </section>

      {quotes.length === 0 ? (
        <div style={emptyCardStyle}>
          <h2 style={{ marginTop: 0 }}>Henüz teklif yok</h2>
          <p style={{ color: "#64748b", lineHeight: 1.7 }}>
            Tedarikçiler teklif verdiğinde burada listelenecek.
          </p>
        </div>
      ) : (
        <section style={quoteGridStyle}>
          {sortedQuotes.map((quote) => {
            const totalAmount =
              Number(quote.unitPrice || 0) * Number(rfq.quantity || 0);

            const isBestPrice =
              Boolean(bestQuote) && bestQuote.id === quote.id;

            const isFastest =
              Boolean(fastestQuote) && fastestQuote.id === quote.id;

            return (
            <article
              key={quote.id}
              style={{
                ...quoteCardStyle,
                borderColor: isBestPrice ? "#86efac" : "#e2e8f0",
              }}
            >
              <div style={recommendationRowStyle}>
                {isBestPrice && (
                  <span style={bestPriceBadgeStyle}>🏆 En iyi fiyat</span>
                )}

                {isFastest && (
                  <span style={fastDeliveryBadgeStyle}>
                    ⚡ En hızlı teslim
                  </span>
                )}
              </div>

              <div style={sellerSummaryStyle}>
                <div>
                  <div style={sellerLabelStyle}>TEDARİKÇİ</div>

                  <div style={sellerNameRowStyle}>
                    <strong style={sellerNameStyle}>
                      {quote.seller?.name || "Tedarikçi"}
                    </strong>

                    {quote.seller?.verified && (
                      <span style={verifiedSellerStyle}>
                        ✓ Doğrulandı
                      </span>
                    )}
                  </div>

                  <div style={sellerMetaStyle}>
                    {Number(quote.seller?.rating || 0) > 0
                      ? `⭐ ${Number(quote.seller?.rating).toFixed(1)}`
                      : "⭐ Yeni satıcı"}

                    {quote.seller?.reviewCount
                      ? ` · ${quote.seller.reviewCount} değerlendirme`
                      : ""}

                    {quote.seller?.city
                      ? ` · 📍 ${quote.seller.city}`
                      : ""}
                  </div>
                </div>

                {quote.seller?.id && (
                  <Link
                    to={`/store/${quote.seller.id}`}
                    style={storeLinkStyle}
                  >
                    Mağazayı Gör
                  </Link>
                )}
              </div>

              <div style={quoteTopStyle}>
                <div>
                  <div style={smallLabelStyle}>Birim fiyat</div>
                  <h3 style={priceStyle}>{formatPrice(quote.unitPrice)}</h3>
                </div>

                <span
                  style={{
                    ...badgeStyle,
                    ...statusStyle(quote.status),
                  }}
                >
                  {statusLabel(quote.status)}
                </span>
              </div>

              <div style={quoteInfoGridStyle}>
                <InfoCard
                  label="Teslim Süresi"
                  value={
                    quote.deliveryDays !== undefined
                      ? `${quote.deliveryDays} gün`
                      : "-"
                  }
                  compact
                />

                <InfoCard
                  label="Toplam Tutar"
                  value={formatPrice(totalAmount)}
                  compact
                />
              </div>

              <div style={calculationStyle}>
                {rfq.quantity} adet × {formatPrice(quote.unitPrice)}
                <strong>{formatPrice(totalAmount)}</strong>
              </div>

              <div style={sellerNoteStyle}>
                <strong>Satıcı Notu</strong>
                <p>{quote.sellerNote || "Satıcı notu eklenmemiş."}</p>
              </div>

              {quote.status === "SENT" && rfq.status === "OPEN" ? (
                <button
                  onClick={() => acceptQuote(quote.id)}
                  disabled={acceptingId === quote.id}
                  style={{
                    ...acceptButtonStyle,
                    opacity: acceptingId === quote.id ? 0.7 : 1,
                    cursor:
                      acceptingId === quote.id ? "not-allowed" : "pointer",
                  }}
                >
                  {acceptingId === quote.id
                    ? "Sipariş oluşturuluyor..."
                    : "Teklifi Kabul Et"}
                </button>
              ) : (
                <div style={disabledActionStyle}>
                  Bu teklif için işlem yapılamaz.
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

function InfoCard({
  label,
  value,
  compact,
}: {
  label: string;
  value: string | number;
  compact?: boolean;
}) {
  return (
    <div style={compact ? compactInfoCardStyle : infoCardStyle}>
      <span style={infoLabelStyle}>{label}</span>
      <strong style={infoValueStyle}>{value}</strong>
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
  fontSize: 40,
  fontWeight: 900,
  margin: "0 0 8px",
};

const descriptionStyle: CSSProperties = {
  color: "#cbd5e1",
  maxWidth: 720,
  lineHeight: 1.7,
  margin: 0,
};

const backButtonStyle: CSSProperties = {
  textDecoration: "none",
  background: "#ffffff",
  color: "#0f172a",
  padding: "12px 16px",
  borderRadius: 14,
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const summaryGridStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
};

const infoCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 20,
  padding: 20,
  boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
  display: "grid",
  gap: 8,
};

const compactInfoCardStyle: CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 14,
  display: "grid",
  gap: 5,
};

const infoLabelStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 13,
  fontWeight: 900,
};

const infoValueStyle: CSSProperties = {
  color: "#0f172a",
  fontSize: 22,
};

const detailCardStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 28px",
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 22,
  padding: 24,
  boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
};

const detailTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "start",
};

const smallLabelStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 6,
};

const noteStyle: CSSProperties = {
  color: "#334155",
  lineHeight: 1.7,
  margin: 0,
};

const badgeStyle: CSSProperties = {
  borderRadius: 999,
  padding: "7px 11px",
  fontSize: 12,
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const quotesHeaderStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 18px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
};

const eyebrowDarkStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 8,
};

const sectionTitleStyle: CSSProperties = {
  color: "#0f172a",
  margin: 0,
  fontSize: 30,
  fontWeight: 900,
};

const secondaryLinkStyle: CSSProperties = {
  textDecoration: "none",
  background: "#eff6ff",
  color: "#1d4ed8",
  padding: "11px 14px",
  borderRadius: 13,
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const quoteGridStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: 20,
};

const quoteCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 22,
  padding: 22,
  boxShadow: "0 14px 34px rgba(15,23,42,0.10)",
};

const quoteTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "start",
  marginBottom: 16,
};

const priceStyle: CSSProperties = {
  color: "#0f172a",
  fontSize: 30,
  margin: 0,
  fontWeight: 900,
};

const quoteInfoGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginBottom: 14,
};

const sellerNoteStyle: CSSProperties = {
  background: "#f8fafc",
  borderRadius: 14,
  padding: 14,
  color: "#334155",
  marginBottom: 16,
};

const acceptButtonStyle: CSSProperties = {
  width: "100%",
  border: "none",
  borderRadius: 14,
  padding: "13px 16px",
  background: "#16a34a",
  color: "white",
  fontWeight: 900,
  fontSize: 15,
};

const disabledActionStyle: CSSProperties = {
  background: "#f1f5f9",
  color: "#64748b",
  borderRadius: 14,
  padding: "13px 16px",
  textAlign: "center",
  fontWeight: 800,
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

const primaryLinkStyle: CSSProperties = {
  display: "inline-block",
  textDecoration: "none",
  background: "#2563eb",
  color: "white",
  padding: "12px 16px",
  borderRadius: 12,
  fontWeight: 900,
};

const heroActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  flexWrap: "wrap",
  gap: 10,
};

const copyButtonStyle: CSSProperties = {
  minHeight: 44,
  padding: "11px 15px",
  border: "1px solid rgba(255,255,255,0.28)",
  borderRadius: 13,
  color: "#ffffff",
  background: "rgba(255,255,255,0.12)",
  fontWeight: 900,
  cursor: "pointer",
};

const closeButtonStyle: CSSProperties = {
  minHeight: 44,
  padding: "11px 15px",
  border: "1px solid #fecaca",
  borderRadius: 13,
  color: "#991b1b",
  background: "#fee2e2",
  fontWeight: 900,
  cursor: "pointer",
};

const quoteHeaderActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 10,
};

const sortSelectStyle: CSSProperties = {
  minHeight: 44,
  padding: "0 12px",
  border: "1px solid #cbd5e1",
  borderRadius: 12,
  color: "#334155",
  background: "#ffffff",
  fontWeight: 800,
};

const recommendationRowStyle: CSSProperties = {
  minHeight: 28,
  display: "flex",
  flexWrap: "wrap",
  gap: 7,
  marginBottom: 12,
};

const bestPriceBadgeStyle: CSSProperties = {
  padding: "6px 9px",
  borderRadius: 999,
  color: "#166534",
  background: "#dcfce7",
  fontSize: 11,
  fontWeight: 900,
};

const fastDeliveryBadgeStyle: CSSProperties = {
  padding: "6px 9px",
  borderRadius: 999,
  color: "#1d4ed8",
  background: "#dbeafe",
  fontSize: 11,
  fontWeight: 900,
};

const sellerSummaryStyle: CSSProperties = {
  marginBottom: 16,
  padding: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  borderRadius: 15,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
};

const sellerLabelStyle: CSSProperties = {
  marginBottom: 5,
  color: "#64748b",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: 0.8,
};

const sellerNameRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 7,
};

const sellerNameStyle: CSSProperties = {
  color: "#0f172a",
  fontSize: 16,
};

const verifiedSellerStyle: CSSProperties = {
  padding: "4px 7px",
  borderRadius: 999,
  color: "#166534",
  background: "#dcfce7",
  fontSize: 10,
  fontWeight: 900,
};

const sellerMetaStyle: CSSProperties = {
  marginTop: 6,
  color: "#64748b",
  fontSize: 11,
  lineHeight: 1.5,
};

const storeLinkStyle: CSSProperties = {
  flexShrink: 0,
  padding: "8px 10px",
  borderRadius: 10,
  color: "#1d4ed8",
  background: "#eff6ff",
  textDecoration: "none",
  fontSize: 11,
  fontWeight: 900,
};

const calculationStyle: CSSProperties = {
  marginBottom: 14,
  padding: "12px 14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  borderRadius: 13,
  color: "#475569",
  background: "#f0fdf4",
  border: "1px solid #bbf7d0",
  fontSize: 13,
};
