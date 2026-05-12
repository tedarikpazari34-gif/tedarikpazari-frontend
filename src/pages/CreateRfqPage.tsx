import { useEffect, useState, type CSSProperties } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const BASE_URL = "https://tedarik-backend.onrender.com";

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
        const res = await fetch(
          `${BASE_URL}/api/products/${productId}`
        );

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
        setError("Lütfen giriş yapın");
        return;
      }

      const res = await fetch(`${BASE_URL}/api/rfqs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          quantity: Number(quantity),
          targetPrice: targetPrice
            ? Number(targetPrice)
            : undefined,
          note,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "RFQ oluşturulamadı");
        return;
      }

      setSuccess("Teklif talebi başarıyla gönderildi");

      setTimeout(() => {
        navigate("/buyer/rfqs");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("İşlem sırasında hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Teklif Talebi Oluştur</h1>

        {product && (
          <div style={productBoxStyle}>
            <strong>{product.title}</strong>

            {product.basePrice && (
              <p style={{ marginTop: 8 }}>
                Başlangıç fiyatı:
                {" "}
                {Number(product.basePrice).toLocaleString("tr-TR")} ₺
              </p>
            )}
          </div>
        )}

        {success && (
          <div style={successStyle}>{success}</div>
        )}

        {error && (
          <div style={errorStyle}>{error}</div>
        )}

        <div style={fieldStyle}>
          <label>Miktar</label>

          <input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label>Hedef Fiyat (Opsiyonel)</label>

          <input
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label>Not</label>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={textareaStyle}
          />
        </div>

        <button
          onClick={createRfq}
          disabled={loading}
          style={buttonStyle}
        >
          {loading
            ? "Gönderiliyor..."
            : "Teklif Talebi Gönder"}
        </button>
      </div>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f1f5f9",
  padding: 40,
};

const cardStyle: CSSProperties = {
  maxWidth: 700,
  margin: "0 auto",
  background: "white",
  borderRadius: 24,
  padding: 40,
  boxShadow: "0 20px 50px rgba(15,23,42,0.1)",
};

const titleStyle: CSSProperties = {
  fontSize: 34,
  fontWeight: 900,
  marginBottom: 28,
};

const productBoxStyle: CSSProperties = {
  background: "#f8fafc",
  padding: 20,
  borderRadius: 16,
  marginBottom: 24,
};

const fieldStyle: CSSProperties = {
  marginBottom: 20,
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const inputStyle: CSSProperties = {
  height: 50,
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  padding: "0 16px",
  fontSize: 15,
};

const textareaStyle: CSSProperties = {
  minHeight: 140,
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  padding: 16,
  fontSize: 15,
};

const buttonStyle: CSSProperties = {
  width: "100%",
  height: 56,
  border: "none",
  borderRadius: 16,
  background: "#2563eb",
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