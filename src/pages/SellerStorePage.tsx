import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3002/api";

export default function SellerStorePage() {
  const { id } = useParams();

  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompany();
  }, [id]);

  const loadCompany = async () => {
    try {
      const res = await fetch(`${API}/company/${id}/public`);
      const data = await res.json();

      setCompany(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 40 }}>Yükleniyor...</div>;
  }

  if (!company) {
    return <div style={{ padding: 40 }}>Şirket bulunamadı</div>;
  }

  return (
    <main
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            height: 220,
            background:
              "linear-gradient(135deg, #2563eb, #1e40af)",
          }}
        />

        <div style={{ padding: 24 }}>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 900,
              marginBottom: 12,
            }}
          >
            {company.name}
          </h1>
          {company.verified && (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      background: "#dcfce7",
      color: "#166534",
      padding: "8px 14px",
      borderRadius: 999,
      fontWeight: 800,
      marginBottom: 20,
    }}
  >
    ✔ Onaylı Tedarikçi
  </div>
)}
          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            <div>⭐ {company.rating}</div>
            <div>🛒 {company.completedDeals} satış</div>
            <div>💬 {company.reviewCount} yorum</div>
            <div>
              📍 {company.city || "Türkiye"}
            </div>
          </div>

          <p
            style={{
              color: "#475569",
              lineHeight: 1.7,
              marginBottom: 32,
            }}
          >
            {company.description ||
              "Şirket açıklaması henüz eklenmedi."}
          </p>

          <h2
            style={{
              fontSize: 28,
              fontWeight: 900,
              marginBottom: 20,
            }}
          >
            Ürünler
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill,minmax(260px,1fr))",
              gap: 20,
            }}
          >
            {company.products?.map((product: any) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 18,
                    overflow: "hidden",
                    background: "white",
                  }}
                >
                  {product.imageUrl ? (
  <img
    src={
      product.imageUrl.startsWith("http")
        ? product.imageUrl
        : `http://localhost:3002${product.imageUrl}`
    }
    alt={product.title}
    style={{
      width: "100%",
      height: 180,
      objectFit: "cover",
      background: "#f8fafc",
    }}
  />
) : (
  <div
    style={{
      height: 180,
      background: "#f1f5f9",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 48,
    }}
  >
    📦
  </div>
)}

                  <div style={{ padding: 16 }}>
                    <strong>{product.title}</strong>

                    <div
                      style={{
                        marginTop: 8,
                        color: "#2563eb",
                        fontWeight: 800,
                      }}
                    >
                      ₺{Number(product.basePrice || 0).toLocaleString("tr-TR")}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}