import { useEffect, useState, type CSSProperties } from "react";
import SellerLayout from "../components/SellerLayout";

const BASE_URL = "https://tedarik-backend.onrender.com";

type Product = {
  id: string;
  title: string;
  imageUrl?: string | null;
  description?: string | null;
  unitType: string;
  moq: number;
  basePrice: string;
  leadTimeDays: number;
  stockType: string;
  vatRate: number;
  rfqEnabled: boolean;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
  category?: {
    id: string;
    name: string;
  };
};

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Lütfen tekrar giriş yapın");
        setProducts([]);
        return;
      }

      const res = await fetch(`${BASE_URL}/api/products/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Ürünler yüklenemedi");
        setProducts([]);
        return;
      }

      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("SELLER PRODUCTS ERROR:", err);
      setError("Ürünler alınırken hata oluştu");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <SellerLayout title="Ürünlerim">
      <main style={pageStyle}>
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>Ürünlerim</h1>
            <p style={subtitleStyle}>
              Satıcı hesabınıza ait ürünleri buradan yönetin.
            </p>
          </div>

          <a href="/seller/products/new" style={addButtonStyle}>
            + Yeni Ürün Ekle
          </a>
        </div>

        {loading && <div style={infoBoxStyle}>Ürünler yükleniyor...</div>}

        {!loading && error && <div style={errorBoxStyle}>{error}</div>}

        {!loading && !error && products.length === 0 && (
          <div style={emptyStyle}>
            <h2 style={{ marginTop: 0 }}>Henüz ürününüz yok</h2>
            <p>İlk ürününüzü ekleyerek satıcı panelinizi kullanmaya başlayın.</p>
            <a href="/seller/products/new" style={addButtonStyle}>
              İlk Ürünü Ekle
            </a>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div style={gridStyle}>
            {products.map((product) => (
              <article key={product.id} style={cardStyle}>
                <div style={imageWrapStyle}>
                  {product.imageUrl ? (
                    <img
                      src={`${BASE_URL}${product.imageUrl}`}
                      alt={product.title}
                      style={imageStyle}
                    />
                  ) : (
                    <div style={imagePlaceholderStyle}>Ürün Görseli Yok</div>
                  )}

                  <span
                    style={{
                      ...statusBadgeStyle,
                      ...(product.isApproved
                        ? approvedBadgeStyle
                        : pendingBadgeStyle),
                    }}
                  >
                    {product.isApproved ? "Onaylı" : "Onay Bekliyor"}
                  </span>
                </div>

                <div style={contentStyle}>
                  <div style={categoryStyle}>
                    {product.category?.name || "Kategori yok"}
                  </div>

                  <h2 style={productTitleStyle}>{product.title}</h2>

                  <p style={descriptionStyle}>
                    {product.description || "Açıklama girilmemiş."}
                  </p>

                  <div style={priceStyle}>
                    {Number(product.basePrice || 0).toLocaleString("tr-TR")} ₺
                  </div>

                  <div style={detailsGridStyle}>
                    <Info label="Birim" value={product.unitType} />
                    <Info label="MOQ" value={product.moq} />
                    <Info label="Tedarik" value={`${product.leadTimeDays} gün`} />
                    <Info label="KDV" value={`%${product.vatRate}`} />
                  </div>

                  <div style={badgeRowStyle}>
                    <span
                      style={{
                        ...smallBadgeStyle,
                        background: product.rfqEnabled ? "#dbeafe" : "#e5e7eb",
                        color: product.rfqEnabled ? "#1d4ed8" : "#374151",
                      }}
                    >
                      {product.rfqEnabled ? "RFQ Açık" : "RFQ Kapalı"}
                    </span>

                    <span
                      style={{
                        ...smallBadgeStyle,
                        background: product.isActive ? "#dcfce7" : "#fee2e2",
                        color: product.isActive ? "#166534" : "#991b1b",
                      }}
                    >
                      {product.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </div>

                  <div style={actionsStyle}>
                    <a href={`/product/${product.id}`} style={viewButtonStyle}>
                      Ürünü Gör
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </SellerLayout>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={infoItemStyle}>
      <span style={infoLabelStyle}>{label}</span>
      <strong style={infoValueStyle}>{value}</strong>
    </div>
  );
}

const pageStyle: CSSProperties = {
  padding: "10px 0 40px",
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 26,
  gap: 20,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 34,
  fontWeight: 900,
  color: "#0f172a",
};

const subtitleStyle: CSSProperties = {
  marginTop: 8,
  color: "#64748b",
};

const addButtonStyle: CSSProperties = {
  background: "#2563eb",
  color: "white",
  textDecoration: "none",
  padding: "13px 18px",
  borderRadius: 14,
  fontWeight: 800,
  boxShadow: "0 10px 25px rgba(37,99,235,0.25)",
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: 22,
};

const cardStyle: CSSProperties = {
  background: "white",
  borderRadius: 22,
  overflow: "hidden",
  border: "1px solid #e2e8f0",
  boxShadow: "0 16px 35px rgba(15,23,42,0.08)",
};

const imageWrapStyle: CSSProperties = {
  position: "relative",
  height: 210,
  background: "#e2e8f0",
};

const imageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const imagePlaceholderStyle: CSSProperties = {
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#64748b",
  fontWeight: 800,
};

const statusBadgeStyle: CSSProperties = {
  position: "absolute",
  top: 14,
  right: 14,
  padding: "7px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
};

const approvedBadgeStyle: CSSProperties = {
  background: "#dcfce7",
  color: "#166534",
};

const pendingBadgeStyle: CSSProperties = {
  background: "#fef3c7",
  color: "#92400e",
};

const contentStyle: CSSProperties = {
  padding: 22,
};

const categoryStyle: CSSProperties = {
  color: "#2563eb",
  fontWeight: 800,
  fontSize: 13,
  marginBottom: 8,
};

const productTitleStyle: CSSProperties = {
  fontSize: 22,
  fontWeight: 900,
  color: "#0f172a",
  margin: "0 0 10px",
};

const descriptionStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 14,
  minHeight: 42,
  lineHeight: 1.5,
};

const priceStyle: CSSProperties = {
  fontSize: 26,
  fontWeight: 900,
  color: "#16a34a",
  margin: "18px 0",
};

const detailsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};

const infoItemStyle: CSSProperties = {
  background: "#f8fafc",
  padding: 12,
  borderRadius: 12,
};

const infoLabelStyle: CSSProperties = {
  display: "block",
  color: "#64748b",
  fontSize: 12,
  marginBottom: 4,
};

const infoValueStyle: CSSProperties = {
  color: "#0f172a",
  fontSize: 14,
};

const badgeRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  marginTop: 16,
  flexWrap: "wrap",
};

const smallBadgeStyle: CSSProperties = {
  padding: "7px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
};

const actionsStyle: CSSProperties = {
  marginTop: 18,
  display: "flex",
  justifyContent: "space-between",
};

const viewButtonStyle: CSSProperties = {
  display: "inline-block",
  width: "100%",
  textAlign: "center",
  background: "#0f172a",
  color: "white",
  textDecoration: "none",
  padding: "12px 14px",
  borderRadius: 12,
  fontWeight: 800,
};

const infoBoxStyle: CSSProperties = {
  background: "white",
  padding: 22,
  borderRadius: 16,
  color: "#334155",
};

const errorBoxStyle: CSSProperties = {
  background: "#fee2e2",
  color: "#991b1b",
  padding: 16,
  borderRadius: 16,
};

const emptyStyle: CSSProperties = {
  background: "white",
  borderRadius: 20,
  padding: 36,
  boxShadow: "0 14px 30px rgba(15,23,42,0.08)",
};