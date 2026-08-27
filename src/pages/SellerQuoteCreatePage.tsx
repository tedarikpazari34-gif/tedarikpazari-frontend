import { useEffect, useState, type CSSProperties } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const API = "https://tedarik-backend.onrender.com/api";

export default function CreateQuotePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const rfqIdFromUrl = searchParams.get("rfqId") || "";

  const [rfqId, setRfqId] = useState(rfqIdFromUrl);
  const [price, setPrice] = useState("");
  const [days, setDays] = useState("3");
  const [note, setNote] = useState("");
  const [rfqData, setRfqData] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadRfq = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token || !rfqIdFromUrl) return;

        const res = await fetch(`${API}/rfqs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok || !Array.isArray(data)) return;

        const found = data.find((item: any) => item.id === rfqIdFromUrl);

        if (found) {
          setRfqData(found);
        }
      } catch (err) {
        console.error("RFQ LOAD ERROR:", err);
      }
    };

    loadRfq();
  }, [rfqIdFromUrl]);

  const generateAiQuote = async () => {
    try {
      setAiLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Teklif hazırlamak için giriş yapmalısınız.");
        return;
      }

      if (!rfqData) {
        setError("Talep bilgileri henüz yüklenmedi.");
        return;
      }

      const res = await fetch(`${API}/ai/quote-draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: rfqData.product?.title || rfqData.title || "",
          quantity: rfqData.quantity,
          unitType: rfqData.unitType,
          note: rfqData.note || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "AI teklif taslağı oluşturulamadı.");
        return;
      }

      if (data.deliveryDays) {
        setDays(String(data.deliveryDays));
      }

      if (data.sellerNote) {
        setNote(String(data.sellerNote));
      }
    } catch (err) {
      console.error("AI QUOTE ERROR:", err);
      setError("AI teklif hazırlama sırasında hata oluştu.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!rfqId.trim()) {
      setError("RFQ ID bulunamadı.");
      return;
    }

    if (!price || Number(price) <= 0) {
      setError("Geçerli bir fiyat girin.");
      return;
    }

    if (!days || Number(days) < 1) {
      setError("Teslim süresi en az 1 gün olmalı.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Teklif vermek için giriş yapmalısınız.");
        return;
      }

      const res = await fetch(`${API}/quotes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rfqId,
          unitPrice: Number(price),
          deliveryDays: Number(days),
          sellerNote: note,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || data?.error || "Teklif gönderilemedi.");
        return;
      }

      setSuccess("Teklif başarıyla gönderildi.");

      setTimeout(() => {
        navigate("/seller/quotes");
      }, 1000);
    } catch (err) {
      console.error("QUOTE CREATE ERROR:", err);
      setError("Teklif gönderilirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <Link to="/seller/rfqs" style={backLinkStyle}>
          ← Gelen taleplere dön
        </Link>

        <div>
          <div style={heroBadgeStyle}>SATICI TEKLİF FORMU</div>

          <h1 style={heroTitleStyle}>Alıcı talebine teklif verin</h1>

          <p style={heroTextStyle}>
            Fiyatınızı, teslim sürenizi ve teklif notunuzu girerek alıcıya hızlıca
            dönüş yapın.
          </p>
        </div>

        <div style={benefitGridStyle}>
          <div style={benefitStyle}>✓ Hızlı teklif gönderimi</div>
          <div style={benefitStyle}>✓ RFQ bazlı satış fırsatı</div>
          <div style={benefitStyle}>✓ Siparişe dönüşen teklif akışı</div>
        </div>
      </section>

      <section style={cardStyle}>
        <div style={cardHeaderStyle}>
          <div>
            <div style={eyebrowStyle}>TEKLİF BİLGİLERİ</div>
            <h2 style={titleStyle}>Teklif Ver</h2>
          </div>

          <Link to="/seller/quotes" style={secondaryLinkStyle}>
            Tekliflerim
          </Link>
        </div>

        {error && <div style={errorStyle}>{error}</div>}
        {success && <div style={successStyle}>{success}</div>}

        <label style={fieldStyle}>
          <span style={labelStyle}>RFQ ID</span>
          <input
            style={inputStyle}
            value={rfqId}
            onChange={(e) => setRfqId(e.target.value)}
            placeholder="RFQ ID"
          />
        </label>

        <div style={aiBoxStyle}>
          <div style={aiBadgeStyle}>✨ AI DESTEKLİ</div>

          <h3 style={aiTitleStyle}>AI ile Teklif Hazırla</h3>

          <p style={aiTextStyle}>
            AI, alıcının talebini analiz ederek teslim süresi ve profesyonel
            teklif notu hazırlasın. Fiyatı siz belirleyin.
          </p>

          <button
            type="button"
            onClick={generateAiQuote}
            disabled={aiLoading}
            style={{
              ...aiButtonStyle,
              opacity: aiLoading ? 0.65 : 1,
              cursor: aiLoading ? "not-allowed" : "pointer",
            }}
          >
            {aiLoading ? "AI hazırlanıyor..." : "✨ AI ile Teklif Hazırla"}
          </button>
        </div>

        <div style={gridStyle}>
          <label style={fieldStyle}>
            <span style={labelStyle}>Birim Fiyat (₺) *</span>
            <input
              type="number"
              style={inputStyle}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Örn: 250"
            />
          </label>

          <label style={fieldStyle}>
            <span style={labelStyle}>Teslim Süresi (Gün) *</span>
            <input
              type="number"
              min="1"
              style={inputStyle}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="Örn: 3"
            />
          </label>
        </div>

        <label style={fieldStyle}>
          <span style={labelStyle}>Satıcı Notu</span>
          <textarea
            style={textareaStyle}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Stok durumu, teslimat koşulları, minimum sipariş veya özel açıklamalar..."
          />
        </label>

        <div style={summaryBoxStyle}>
          <strong>Teklif Özeti</strong>
          <span>
            {price ? `${Number(price).toLocaleString("tr-TR")} ₺` : "Fiyat girilmedi"} ·{" "}
            {days || "-"} gün teslim
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            ...buttonStyle,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Gönderiliyor..." : "Teklifi Gönder"}
        </button>
      </section>
    </main>
  );
}

const aiBoxStyle: CSSProperties = {
  background: "linear-gradient(135deg, #eff6ff, #f5f3ff)",
  border: "1px solid #c7d2fe",
  borderRadius: 18,
  padding: 18,
  marginBottom: 20,
};

const aiBadgeStyle: CSSProperties = {
  display: "inline-block",
  background: "#4f46e5",
  color: "white",
  borderRadius: 999,
  padding: "6px 10px",
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 10,
};

const aiTitleStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: 21,
  color: "#0f172a",
  fontWeight: 900,
};

const aiTextStyle: CSSProperties = {
  margin: "0 0 14px",
  color: "#475569",
  lineHeight: 1.6,
};

const aiButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: 12,
  padding: "12px 16px",
  background: "#4f46e5",
  color: "white",
  fontWeight: 900,
};

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, rgba(37,99,235,0.24), transparent 32%), #f8fafc",
  padding: window.innerWidth < 700 ? 12 : 32,
  display: "grid",
  gridTemplateColumns: window.innerWidth < 700 ? "1fr" : "0.85fr 1.15fr",
  gap: window.innerWidth < 700 ? 16 : 28,
  width: "100%",
  maxWidth: "100%",
  overflowX: "hidden",
};

const heroStyle: CSSProperties = {
  borderRadius: 30,
  padding: 34,
  color: "white",
  backgroundImage:
    "linear-gradient(180deg, rgba(15,23,42,0.38), rgba(15,23,42,0.92)), url('/images/hero-b2b.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  minHeight: "calc(100vh - 64px)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  boxShadow: "0 24px 60px rgba(15,23,42,0.22)",
};

const backLinkStyle: CSSProperties = {
  color: "#dbeafe",
  textDecoration: "none",
  fontWeight: 900,
};

const heroBadgeStyle: CSSProperties = {
  display: "inline-block",
  width: "fit-content",
  background: "rgba(59,130,246,0.24)",
  border: "1px solid rgba(147,197,253,0.28)",
  padding: "8px 13px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 16,
};

const heroTitleStyle: CSSProperties = {
  fontSize: 46,
  lineHeight: 1.05,
  fontWeight: 900,
  margin: "0 0 12px",
};

const heroTextStyle: CSSProperties = {
  color: "#dbeafe",
  lineHeight: 1.7,
  fontSize: 17,
};

const benefitGridStyle: CSSProperties = {
  display: "grid",
  gap: 10,
};

const benefitStyle: CSSProperties = {
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.14)",
  padding: 14,
  borderRadius: 16,
  fontWeight: 800,
};

const cardStyle: CSSProperties = {
  background: "white",
  borderRadius: 30,
  padding: 34,
  boxShadow: "0 24px 60px rgba(15,23,42,0.12)",
  border: "1px solid #e2e8f0",
};

const cardHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "start",
  marginBottom: 24,
};

const eyebrowStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 8,
};

const titleStyle: CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: 34,
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

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: window.innerWidth < 700 ? "1fr" : "1fr 1fr",
  gap: 14,
};

const fieldStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  marginBottom: 16,
};

const labelStyle: CSSProperties = {
  color: "#334155",
  fontSize: 14,
  fontWeight: 900,
};

const inputStyle: CSSProperties = {
  height: 52,
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  padding: "0 15px",
  fontSize: 15,
  outline: "none",
};

const textareaStyle: CSSProperties = {
  minHeight: 150,
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  padding: 15,
  fontSize: 15,
  outline: "none",
  resize: "vertical",
};

const summaryBoxStyle: CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 15,
  display: "grid",
  gap: 5,
  color: "#334155",
  marginBottom: 18,
};

const buttonStyle: CSSProperties = {
  width: "100%",
  height: 56,
  border: "none",
  borderRadius: 16,
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  color: "white",
  fontSize: 16,
  fontWeight: 900,
};

const successStyle: CSSProperties = {
  background: "#dcfce7",
  color: "#166534",
  padding: 14,
  borderRadius: 12,
  marginBottom: 16,
};

const errorStyle: CSSProperties = {
  background: "#fee2e2",
  color: "#991b1b",
  padding: 14,
  borderRadius: 12,
  marginBottom: 16,
};