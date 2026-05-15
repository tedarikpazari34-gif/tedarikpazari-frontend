import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";

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

function formatPrice(value: string | number) {
  const numeric = Number(value);

  if (Number.isNaN(numeric)) {
    return String(value);
  }

  return `${numeric.toLocaleString("tr-TR")} ₺`;
}

function statusLabel(status: string) {
  if (status === "SENT") return "Bekliyor";
  if (status === "ACCEPTED") return "Kabul edildi";
  if (status === "REJECTED") return "Reddedildi";

  return status || "-";
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
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadQuotes = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Tekliflerinizi görmek için giriş yapın.");
        return;
      }

      const res = await fetch(`${API}/quotes/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Teklifler alınamadı");
        return;
      }

      setQuotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Teklifler alınamadı");
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
          Teklifler yükleniyor...
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <div style={eyebrowStyle}>SATICI PANELİ</div>

          <h1 style={titleStyle}>Tekliflerim</h1>

          <p style={descStyle}>
            Gönderdiğiniz teklifleri, durumlarını ve satışa dönüşen
            fırsatları tek ekrandan takip edin.
          </p>
        </div>

        <Link to="/seller/rfqs" style={heroButtonStyle}>
          Yeni RFQ Bul
        </Link>
      </section>

      <section style={statsStyle}>
        <Stat
          label="Toplam Teklif"
          value={quotes.length}
        />

        <Stat
          label="Bekleyen"
          value={
            quotes.filter((q) => q.status === "SENT").length
          }
        />

        <Stat
          label="Kabul Edilen"
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
            Henüz teklif yok
          </h2>

          <p style={{ color: "#64748b", lineHeight: 1.7 }}>
            Açık RFQ taleplerine teklif vererek satış
            fırsatlarını değerlendirebilirsiniz.
          </p>

          <Link
            to="/seller/rfqs"
            style={primaryButtonStyle}
          >
            RFQ Taleplerini Gör
          </Link>
        </div>
      ) : (
        <section style={gridStyle}>
          {quotes.map((q) => (
            <article key={q.id} style={cardStyle}>
              <div style={cardTopStyle}>
                <div>
                  <div style={smallLabelStyle}>
                    Teklif Verilen Ürün
                  </div>

                  <h2 style={cardTitleStyle}>
                    {q.rfq?.product?.title || "Ürün"}
                  </h2>
                </div>

                <span
                  style={{
                    ...badgeStyle,
                    ...statusStyle(q.status),
                  }}
                >
                  {statusLabel(q.status)}
                </span>
              </div>

              <div style={infoGridStyle}>
                <Info
                  label="Buyer"
                  value={q.rfq?.buyer?.name || "-"}
                />

                <Info
                  label="Miktar"
                  value={`${q.rfq?.quantity || "-"} ${
                    q.rfq?.product?.unitType || ""
                  }`}
                />

                <Info
                  label="Fiyat"
                  value={formatPrice(q.unitPrice)}
                />

                <Info
                  label="Teslim"
                  value={
                    q.deliveryDays
                      ? `${q.deliveryDays} gün`
                      : "-"
                  }
                />
              </div>

              <div style={noteBoxStyle}>
                <strong>Teklif Notu</strong>

                <p>
                  {q.sellerNote || "Not eklenmemiş."}
                </p>
              </div>

              {q.status === "ACCEPTED" && (
                <div style={acceptedBoxStyle}>
                  ✅ Satışa dönüştü
                </div>
              )}

              {q.status === "REJECTED" && (
                <div style={rejectedBoxStyle}>
                  ❌ Teklif reddedildi
                </div>
              )}

              {q.status === "SENT" && (
                <div style={pendingBoxStyle}>
                  ⏳ Buyer yanıtı bekleniyor
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