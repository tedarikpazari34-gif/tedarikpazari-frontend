import { useEffect, useState, type CSSProperties } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const BASE_URL = "http://localhost:3002";

type Product = {
  id: string;
  title: string;
  imageUrl?: string;
  basePrice?: string;
};

export default function CreateRfqPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const productId = params.get("productId");
  const category = params.get("category");
  const productName = params.get("product");

  const [product, setProduct] = useState<Product | null>(null);

  const [quantity, setQuantity] = useState("100");
  const [targetPrice, setTargetPrice] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;

      try {
        const res = await fetch(`${BASE_URL}/api/products/${productId}`);
        const data = await res.json();

        if (res.ok) {
          setProduct(data);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadProduct();
  }, [productId]);

  const createRfq = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Teklif talebi oluşturmak için lütfen giriş yapın.");
        return;
      }

      const finalNote = [
        category ? `Kategori: ${category}` : "",
        product?.title || productName ? `Ürün: ${product?.title || productName}` : "",
        note,
      ]
        .filter(Boolean)
        .join("\n");

      const res = await fetch(`${BASE_URL}/api/rfqs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          quantity: Number(quantity),
          targetPrice: targetPrice ? Number(targetPrice) : undefined,
          note: finalNote,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Teklif talebi oluşturulamadı");
        return;
      }

      setSuccess("Teklif talebi başarıyla gönderildi.");

      setTimeout(() => {
        navigate("/buyer/rfqs");
      }, 1200);
    } catch (err) {
      console.error(err);
      setError("İşlem sırasında hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const selectedTitle = product?.title || productName || category || "Genel teklif talebi";

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <Link to="/" style={backLinkStyle}>
          ← Ana sayfaya dön
        </Link>

        <div style={heroBadgeStyle}>RFQ / TEKLİF TALEBİ</div>

        <h1 style={heroTitleStyle}>Tedarikçilerden hızlı teklif alın</h1>

        <p style={heroTextStyle}>
          İhtiyacınızı belirtin, uygun satıcılardan fiyat ve teslim süresi teklifi toplayın.
        </p>

        <div style={benefitGridStyle}>
          <div style={benefitStyle}>✓ Doğrulanmış tedarikçiler</div>
          <div style={benefitStyle}>✓ Güvenli teklif süreci</div>
          <div style={benefitStyle}>✓ Tek panelden takip</div>
        </div>
      </section>

      <section style={cardStyle}>
        <div style={cardHeaderStyle}>
          <div>
            <div style={eyebrowStyle}>TEKLİF FORMU</div>
            <h2 style={titleStyle}>Teklif Talebi Oluştur</h2>
          </div>

          <Link to="/products" style={secondaryLinkStyle}>
            Ürünlere dön
          </Link>
        </div>

        <div style={summaryBoxStyle}>
          <div>
            <div style={summaryLabelStyle}>Seçilen ihtiyaç</div>
            <strong style={summaryTitleStyle}>{selectedTitle}</strong>
          </div>

          {product?.basePrice && (
            <div style={pricePillStyle}>
              {Number(product.basePrice).toLocaleString("tr-TR")} ₺ başlangıç
            </div>
          )}
        </div>

        {category && (
          <div style={infoBoxStyle}>
            <strong>Kategori:</strong> {category}
          </div>
        )}

        {success && <div style={successStyle}>{success}</div>}

        {error && <div style={errorStyle}>{error}</div>}

        <div style={gridStyle}>
          <label style={fieldStyle}>
            <span style={labelStyle}>Miktar *</span>
            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              style={inputStyle}
              placeholder="Örn: 100"
            />
          </label>

          <label style={fieldStyle}>
            <span style={labelStyle}>Hedef Fiyat</span>
            <input
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              style={inputStyle}
              placeholder="Opsiyonel"
            />
          </label>
        </div>

        <label style={fieldStyle}>
          <span style={labelStyle}>Ek Not</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={textareaStyle}
            placeholder="Teslimat adresi, ürün özellikleri, marka tercihi, termin süresi gibi detayları yazın."
          />
        </label>

        <div style={noticeStyle}>
          <strong>Platform güvenceli süreç</strong>
          <span>
            Talebiniz ilgili tedarikçilere yönlendirilir. Teklifleri panelinizden takip edebilirsiniz.
          </span>
        </div>

        <button onClick={createRfq} disabled={loading} style={buttonStyle}>
          {loading ? "Gönderiliyor..." : "Teklif Talebi Gönder"}
        </button>
      </section>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, rgba(37,99,235,0.24), transparent 32%), #f8fafc",
  padding: 32,
  display: "grid",
  gridTemplateColumns: "0.8fr 1.2fr",
  gap: 28,
};

const heroStyle: CSSProperties = {
  borderRadius: 30,
  padding: 34,
  color: "white",
  backgroundImage:
    "linear-gradient(180deg, rgba(15,23,42,0.45), rgba(15,23,42,0.92)), url('/images/hero-b2b.jpg')",
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
};

const heroTitleStyle: CSSProperties = {
  fontSize: 46,
  lineHeight: 1.05,
  fontWeight: 900,
  margin: "20px 0 12px",
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

const summaryBoxStyle: CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 20,
  padding: 18,
  display: "flex",
  justifyContent: "space-between",
  gap: 14,
  alignItems: "center",
  marginBottom: 16,
};

const summaryLabelStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 13,
  fontWeight: 800,
  marginBottom: 5,
};

const summaryTitleStyle: CSSProperties = {
  color: "#0f172a",
  fontSize: 20,
};

const pricePillStyle: CSSProperties = {
  background: "#dcfce7",
  color: "#166534",
  borderRadius: 999,
  padding: "9px 12px",
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const infoBoxStyle: CSSProperties = {
  background: "#eff6ff",
  color: "#1e3a8a",
  padding: 14,
  borderRadius: 14,
  marginBottom: 16,
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
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

const noticeStyle: CSSProperties = {
  background: "#f0fdf4",
  border: "1px solid #bbf7d0",
  color: "#166534",
  borderRadius: 16,
  padding: 15,
  display: "grid",
  gap: 4,
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
  cursor: "pointer",
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