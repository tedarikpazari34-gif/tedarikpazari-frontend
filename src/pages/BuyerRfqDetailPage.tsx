import { useEffect, useState, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";

type RFQ = {
  id: string;
  quantity: number;
  note?: string | null;
  status: string;
  createdAt?: string;
  product?: { title?: string };
};

type Quote = {
  id: string;
  rfqId?: string;
  unitPrice?: string | number;
  deliveryDays?: number;
  sellerNote?: string | null;
  status?: string;
  rfq?: { id?: string };
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

  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
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

console.log("RFQ ID URL:", id);
console.log("RFQ DATA:", rfqData);

const found = Array.isArray(rfqData)
  ? rfqData.find((item: RFQ) => item.id === id)
  : null;

console.log("FOUND RFQ:", found);

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

  const bestQuote = quotes
    .filter((quote) => quote.unitPrice !== undefined && quote.unitPrice !== null)
    .sort((a, b) => Number(a.unitPrice) - Number(b.unitPrice))[0];

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

        <Link to="/buyer/rfqs" style={backButtonStyle}>
          Taleplerime Dön
        </Link>
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

        <Link to="/products" style={secondaryLinkStyle}>
          Yeni ürün keşfet
        </Link>
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
          {quotes.map((quote) => (
            <article key={quote.id} style={quoteCardStyle}>
              <div style={quoteTopStyle}>
                <div>
                  <div style={smallLabelStyle}>Tedarikçi Teklifi</div>
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
                  label="Birim Fiyat"
                  value={formatPrice(quote.unitPrice)}
                  compact
                />
              </div>

              <div style={sellerNoteStyle}>
                <strong>Satıcı Notu</strong>
                <p>{quote.sellerNote || "Satıcı notu eklenmemiş."}</p>
              </div>

              {quote.status === "SENT" ? (
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
          ))}
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
