import { useEffect, useState, type CSSProperties } from "react";

const API =
  import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("tr-TR");
}

function deliveryText(value?: string | null) {
  const labels: Record<string, string> = {
    ACIL: "Acil",
    "1_3_GUN": "1–3 gün",
    "1_HAFTA": "1 hafta",
    ESNEK: "Esnek",
  };

  return value ? labels[value] || value : "-";
}

export default function ShippingPage() {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const load = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/shipping/open`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message || "Nakliye talepleri alınamadı");
        setRfqs([]);
        return;
      }

      setRfqs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("LOAD ERROR:", error);
      setRfqs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sendQuote = async (rfqId: string) => {
    try {
      const price = prompt("Teklif fiyatı gir:");
      if (!price) return;

      const deliveryDays = prompt("Teslim süresi kaç gün?");
      if (!deliveryDays) return;

      const note = prompt("Not ekle (opsiyonel):") || "";

      setBusyId(rfqId);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/shipping/quote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rfqId,
          price: Number(price),
          deliveryDays: Number(deliveryDays),
          note,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message || "Teklif gönderilemedi");
        return;
      }

      alert("Nakliye teklifi gönderildi ✅");
      await load();
    } catch (error) {
      console.error("SEND QUOTE ERROR:", error);
      alert("İşlem sırasında hata oluştu");
    } finally {
      setBusyId("");
    }
  };

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={emptyStyle}>Nakliye talepleri yükleniyor...</div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <div style={eyebrowStyle}>LOJİSTİK PAZARI</div>
          <h1 style={titleStyle}>Açık Nakliye Talepleri</h1>
          <p style={heroTextStyle}>
            Rota, yük özellikleri ve teslimat beklentilerini inceleyerek
            uygun taşımalara teklif verin.
          </p>
        </div>

        <div style={countStyle}>
          <span>Açık Talep</span>
          <strong>{rfqs.length}</strong>
        </div>
      </section>

      {rfqs.length === 0 ? (
        <div style={emptyStyle}>
          <h2 style={{ marginTop: 0 }}>Açık nakliye talebi yok</h2>
          <p style={{ color: "#64748b" }}>
            Yeni talepler yayınlandığında burada görünecek.
          </p>
        </div>
      ) : (
        <section style={gridStyle}>
          {rfqs.map((rfq) => (
            <article key={rfq.id} style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div>
                  <div style={smallLabelStyle}>TAŞINACAK ÜRÜN</div>
                  <h2 style={productTitleStyle}>
                    {rfq.order?.rfq?.product?.title || "Ürün"}
                  </h2>
                </div>

                <span style={statusStyle}>
                  {rfq.status === "OPEN" ? "Teklife Açık" : rfq.status}
                </span>
              </div>

              <div style={routeStyle}>
                <div>
                  <span style={routeLabelStyle}>Yükleme</span>
                  <strong>
                    {rfq.fromCity || "-"}
                    {rfq.fromDistrict ? ` / ${rfq.fromDistrict}` : ""}
                  </strong>
                  <small>{rfq.fromOpenAddress || rfq.fromAddress || "-"}</small>
                </div>

                <span style={arrowStyle}>→</span>

                <div>
                  <span style={routeLabelStyle}>Teslimat</span>
                  <strong>
                    {rfq.toCity || "-"}
                    {rfq.toDistrict ? ` / ${rfq.toDistrict}` : ""}
                  </strong>
                  <small>{rfq.toOpenAddress || rfq.toAddress || "-"}</small>
                </div>
              </div>

              <div style={infoGridStyle}>
                <Info label="Araç Tipi" value={rfq.vehicleType || "-"} />
                <Info
                  label="Ağırlık"
                  value={
                    rfq.weight
                      ? `${Number(rfq.weight).toLocaleString("tr-TR")} kg`
                      : "-"
                  }
                />
                <Info
                  label="Hacim"
                  value={rfq.volume ? `${rfq.volume} m³` : "-"}
                />
                <Info
                  label="Palet"
                  value={rfq.palletCount ?? "-"}
                />
                <Info
                  label="Koli"
                  value={rfq.packageCount ?? "-"}
                />
                <Info
                  label="Yükleme Tarihi"
                  value={formatDate(rfq.loadingDate)}
                />
                <Info
                  label="Teslim İsteği"
                  value={
                    rfq.requestedDeliveryDate
                      ? formatDate(rfq.requestedDeliveryDate)
                      : deliveryText(rfq.deliveryExpectation)
                  }
                />
                <Info
                  label="Teklif Sayısı"
                  value={rfq.quotes?.length || 0}
                />
              </div>

              <div style={featureGridStyle}>
                {rfq.isFragile && <Feature>📦 Kırılabilir</Feature>}
                {rfq.isDangerous && <Feature>⚠️ Tehlikeli Madde</Feature>}
                {rfq.coldChain && <Feature>❄️ Soğuk Zincir</Feature>}
                {!rfq.stackable && <Feature>⬆️ Üst Üste Konulamaz</Feature>}
                {rfq.needForklift && <Feature>🏗️ Forklift Gerekli</Feature>}
                {rfq.needCrane && <Feature>🏗️ Vinç Gerekli</Feature>}
              </div>

              {rfq.note && (
                <div style={noteStyle}>
                  <strong>Yükleme Notu</strong>
                  <p>{rfq.note}</p>
                </div>
              )}

              <button
                onClick={() => sendQuote(rfq.id)}
                disabled={busyId === rfq.id}
                style={{
                  ...quoteButtonStyle,
                  opacity: busyId === rfq.id ? 0.65 : 1,
                }}
              >
                {busyId === rfq.id
                  ? "Teklif gönderiliyor..."
                  : "💰 Nakliye Teklifi Ver"}
              </button>
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

function Feature({ children }: { children: React.ReactNode }) {
  return <span style={featureStyle}>{children}</span>;
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: "40px 20px",
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
  flexWrap: "wrap",
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

const titleStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: 36,
  fontWeight: 900,
};

const heroTextStyle: CSSProperties = {
  maxWidth: 680,
  margin: 0,
  color: "#ccfbf1",
  lineHeight: 1.6,
};

const countStyle: CSSProperties = {
  minWidth: 120,
  padding: 16,
  display: "grid",
  gap: 4,
  borderRadius: 18,
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.16)",
};

const gridStyle: CSSProperties = {
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
  gap: 16,
  alignItems: "flex-start",
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
  fontSize: 24,
  fontWeight: 900,
};

const statusStyle: CSSProperties = {
  padding: "7px 11px",
  borderRadius: 999,
  background: "#dcfce7",
  color: "#166534",
  fontSize: 12,
  fontWeight: 900,
};

const routeStyle: CSSProperties = {
  marginBottom: 18,
  padding: 16,
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  gap: 14,
  alignItems: "center",
  borderRadius: 18,
  background: "#f0fdfa",
  border: "1px solid #99f6e4",
};

const routeLabelStyle: CSSProperties = {
  display: "block",
  color: "#0f766e",
  fontSize: 11,
  fontWeight: 900,
  marginBottom: 4,
};

const arrowStyle: CSSProperties = {
  fontSize: 24,
  color: "#0f766e",
  fontWeight: 900,
};

const infoGridStyle: CSSProperties = {
  marginBottom: 16,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
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

const featureGridStyle: CSSProperties = {
  marginBottom: 14,
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const featureStyle: CSSProperties = {
  padding: "7px 10px",
  borderRadius: 999,
  background: "#fef3c7",
  color: "#92400e",
  fontSize: 12,
  fontWeight: 800,
};

const noteStyle: CSSProperties = {
  marginBottom: 14,
  padding: 14,
  borderRadius: 14,
  background: "#f8fafc",
  color: "#334155",
};

const quoteButtonStyle: CSSProperties = {
  width: "100%",
  minHeight: 48,
  border: "none",
  borderRadius: 13,
  background: "#0f766e",
  color: "#ffffff",
  fontSize: 15,
  fontWeight: 900,
  cursor: "pointer",
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
