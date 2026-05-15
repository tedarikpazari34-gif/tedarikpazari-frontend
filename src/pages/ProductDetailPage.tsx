import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const BASE_URL = "https://tedarik-backend.onrender.com";

type ProductImage = {
  id: string;
  url: string;
  sortOrder: number;
  isCover: boolean;
};

type Product = {
  id: string;
  title: string;
  imageUrl?: string | null;
  description?: string | null;
  unitType: string;
  moq: number;
  basePrice: string;
  leadTimeDays?: number | null;
  stockType?: string | null;
  vatRate?: number | null;
  rfqEnabled: boolean;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
  category?: {
    id: string;
    name: string;
  };
  images?: ProductImage[];
};

function getCategoryIcon(categoryName?: string) {
  if (!categoryName) return "📦";

  const name = categoryName.toLowerCase();

  if (name.includes("elektrik") || name.includes("aydınlatma")) return "💡";
  if (name.includes("temizlik") || name.includes("hijyen")) return "🧴";
  if (name.includes("gıda") || name.includes("kahve") || name.includes("horeca")) return "☕";
  if (name.includes("otomotiv") || name.includes("fren") || name.includes("motor")) return "🚗";
  if (name.includes("vida") || name.includes("alet") || name.includes("hırdavat")) return "🔩";

  return "📦";
}

function resolveImageUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
}

export default function ProductDetailPage() {
  const params = useParams();
  const navigate = useNavigate();

  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mainImageError, setMainImageError] = useState(false);
  const [thumbErrors, setThumbErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;

      try {
        setLoading(true);

        const res = await fetch(`${BASE_URL}/api/products/${productId}`);
        const data = await res.json();

        if (!res.ok) {
          setProduct(null);
          return;
        }

        setProduct(data);
      } catch (error) {
        console.error("PRODUCT DETAIL ERROR:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  const galleryImages = useMemo(() => {
    if (!product) return [];

    const imageSet = new Set<string>();

    if (product.imageUrl) {
      imageSet.add(product.imageUrl);
    }

    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (img?.url) {
          imageSet.add(img.url);
        }
      });
    }

    return Array.from(imageSet);
  }, [product]);

  useEffect(() => {
    if (galleryImages.length > 0) {
      setSelectedImage(galleryImages[0]);
      setMainImageError(false);
    } else {
      setSelectedImage(null);
      setMainImageError(false);
    }
  }, [galleryImages]);

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={loadingCardStyle}>Ürün yükleniyor...</div>
      </main>
    );
  }

  if (!product) {
    return (
      <main style={pageStyle}>
        <div style={loadingCardStyle}>
          <h1 style={{ marginTop: 0 }}>Ürün bulunamadı</h1>
          <p>Bu ürün yayında olmayabilir veya kaldırılmış olabilir.</p>
          <Link to="/" style={secondaryButtonStyle}>
            Ana sayfaya dön
          </Link>
        </div>
      </main>
    );
  }

  const icon = getCategoryIcon(product.category?.name);
  const mainImageUrl = resolveImageUrl(selectedImage);

  return (
    <main style={pageStyle}>
      <section style={containerStyle}>
        <div style={gallerySectionStyle}>
          <div style={mainImageBoxStyle}>
            {mainImageUrl && !mainImageError ? (
              <img
                src={mainImageUrl}
                alt={product.title}
                style={mainImageStyle}
                onError={() => setMainImageError(true)}
              />
            ) : (
              <div style={emptyImageStyle}>
                <div style={emptyIconStyle}>{icon}</div>
                <div style={emptyTextStyle}>Ürün görseli yok</div>
              </div>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div style={thumbGridStyle}>
              {galleryImages.map((img, index) => {
                const thumbUrl = resolveImageUrl(img);
                const thumbKey = `${img}-${index}`;
                const active = selectedImage === img;

                return (
                  <button
                    key={thumbKey}
                    type="button"
                    onClick={() => {
                      setSelectedImage(img);
                      setMainImageError(false);
                    }}
                    style={{
                      ...thumbButtonStyle,
                      borderColor: active ? "#2563eb" : "#e2e8f0",
                    }}
                  >
                    {thumbUrl && !thumbErrors[thumbKey] ? (
                      <img
                        src={thumbUrl}
                        alt={`${product.title} ${index + 1}`}
                        style={thumbImageStyle}
                        onError={() =>
                          setThumbErrors((prev) => ({
                            ...prev,
                            [thumbKey]: true,
                          }))
                        }
                      />
                    ) : (
                      <div style={thumbFallbackStyle}>{icon}</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div style={infoSectionStyle}>
          <div style={categoryStyle}>
            {product.category?.name || "Kategori"}
          </div>

          <div style={badgeRowStyle}>
            <span style={verifiedBadgeStyle}>✔ Verified Supplier</span>

            {product.rfqEnabled && <span style={rfqBadgeStyle}>RFQ Uygun</span>}

            <span
              style={{
                ...approvalBadgeStyle,
                background: product.isApproved ? "#dcfce7" : "#fef3c7",
                color: product.isApproved ? "#166534" : "#92400e",
              }}
            >
              {product.isApproved ? "Onaylı" : "Onay Bekliyor"}
            </span>
          </div>

          <h1 style={titleStyle}>{product.title}</h1>

          <p style={descriptionStyle}>
            {product.description || "Bu ürün için açıklama eklenmemiş."}
          </p>

          <div style={priceBlockStyle}>
            <div style={priceLabelStyle}>Başlangıç fiyatı</div>
            <div style={priceStyle}>
              {Number(product.basePrice || 0).toLocaleString("tr-TR")} ₺
            </div>
            <div style={unitStyle}>/ {product.unitType}</div>
          </div>

          <div style={infoGridStyle}>
            <InfoBox label="Birim" value={product.unitType} />
            <InfoBox label="MOQ" value={product.moq} />
            <InfoBox
              label="Teslim süresi"
              value={product.leadTimeDays ? `${product.leadTimeDays} gün` : "-"}
            />
            <InfoBox label="Stok tipi" value={product.stockType || "-"} />
            <InfoBox
              label="KDV"
              value={
                product.vatRate !== null && product.vatRate !== undefined
                  ? `%${product.vatRate}`
                  : "-"
              }
            />
            <InfoBox label="Tedarikçi" value="Verified Supplier" green />
          </div>

          <div style={noticeStyle}>
            <strong>Platform Güvenceli Tedarik</strong>
            <p style={{ marginBottom: 0 }}>
              Tedarikçi bilgileri, güvenli ticaret akışını korumak amacıyla
              teklif veya sipariş sürecine kadar gizlenir.
            </p>
          </div>
          <div style={supplierCardStyle}>
  <div>
    <div style={supplierTitleStyle}>Tedarikçi Profili</div>
    <div style={supplierNameStyle}>Verified Supplier</div>
    <p style={supplierDescStyle}>
      Bu tedarikçi platform kalite ve güven kontrolünden geçmiştir.
    </p>
  </div>

  <div style={supplierStatsStyle}>
    <span>✓ Güvenli teklif</span>
    <span>✓ B2B satış</span>
    <span>✓ Hızlı dönüş</span>
  </div>
</div>
          <div style={actionsStyle}>
            <button
              type="button"
              onClick={() => {
                if (!product.rfqEnabled) return;
                navigate(
                `/buyer/rfqs/new?productId=${product.id}&product=${encodeURIComponent(product.title)}`
                );
              }}
              disabled={!product.rfqEnabled}
              style={{
                ...primaryButtonStyle,
                opacity: product.rfqEnabled ? 1 : 0.55,
                cursor: product.rfqEnabled ? "pointer" : "not-allowed",
              }}
            >
              {product.rfqEnabled ? "Teklif İste (RFQ)" : "RFQ Kapalı"}
            </button>

            <Link
              to={product.category?.id ? `/category/${product.category.id}` : "/"}
              style={secondaryButtonStyle}
            >
              Kategoriye Dön
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoBox({
  label,
  value,
  green,
}: {
  label: string;
  value: string | number;
  green?: boolean;
}) {
  return (
    <div style={infoBoxStyle}>
      <p style={infoLabelStyle}>{label}</p>
      <p
        style={{
          ...infoValueStyle,
          color: green ? "#16a34a" : "#0f172a",
        }}
      >
        {value}
      </p>
    </div>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f1f5f9",
  padding: "40px 24px",
};

const containerStyle: CSSProperties = {
  maxWidth: 1220,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 28,
};

const gallerySectionStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const mainImageBoxStyle: CSSProperties = {
  background: "white",
  borderRadius: 28,
  overflow: "hidden",
  minHeight: 520,
  boxShadow: "0 20px 50px rgba(15,23,42,0.1)",
  border: "1px solid #e2e8f0",
};

const mainImageStyle: CSSProperties = {
  width: "100%",
  height: 520,
  objectFit: "cover",
  display: "block",
};

const emptyImageStyle: CSSProperties = {
  height: 520,
  background: "linear-gradient(135deg,#f8fafc,#e2e8f0)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "#64748b",
};

const emptyIconStyle: CSSProperties = {
  fontSize: 76,
  marginBottom: 12,
};

const emptyTextStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
};

const thumbGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
  gap: 12,
};

const thumbButtonStyle: CSSProperties = {
  height: 96,
  background: "white",
  border: "3px solid #e2e8f0",
  borderRadius: 18,
  padding: 0,
  overflow: "hidden",
  cursor: "pointer",
};

const thumbImageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const thumbFallbackStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  background: "#f8fafc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 26,
};

const infoSectionStyle: CSSProperties = {
  background: "white",
  borderRadius: 28,
  padding: 36,
  boxShadow: "0 20px 50px rgba(15,23,42,0.1)",
  border: "1px solid #e2e8f0",
};

const categoryStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 14,
  fontWeight: 900,
  marginBottom: 12,
};

const badgeRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 18,
};

const verifiedBadgeStyle: CSSProperties = {
  background: "#dcfce7",
  color: "#166534",
  padding: "7px 11px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
};

const rfqBadgeStyle: CSSProperties = {
  background: "#dbeafe",
  color: "#1d4ed8",
  padding: "7px 11px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
};

const approvalBadgeStyle: CSSProperties = {
  padding: "7px 11px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
};

const titleStyle: CSSProperties = {
  fontSize: 40,
  lineHeight: 1.1,
  fontWeight: 900,
  margin: "0 0 16px",
  color: "#0f172a",
};

const descriptionStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 17,
  lineHeight: 1.7,
  marginBottom: 26,
};

const priceBlockStyle: CSSProperties = {
  marginBottom: 26,
};

const priceLabelStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 14,
  marginBottom: 6,
};

const priceStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 38,
  fontWeight: 900,
};

const unitStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 14,
  marginTop: 4,
};

const infoGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
  marginBottom: 24,
};

const infoBoxStyle: CSSProperties = {
  background: "#f8fafc",
  borderRadius: 18,
  padding: 16,
};

const infoLabelStyle: CSSProperties = {
  margin: "0 0 6px",
  color: "#64748b",
  fontSize: 13,
};

const infoValueStyle: CSSProperties = {
  margin: 0,
  fontWeight: 900,
  fontSize: 16,
};

const noticeStyle: CSSProperties = {
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  color: "#1e3a8a",
  borderRadius: 20,
  padding: 18,
  lineHeight: 1.6,
  marginBottom: 24,
};

const actionsStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
};

const primaryButtonStyle: CSSProperties = {
  flex: 1,
  minWidth: 190,
  height: 52,
  border: "none",
  borderRadius: 16,
  background: "#2563eb",
  color: "white",
  fontSize: 16,
  fontWeight: 900,
};

const secondaryButtonStyle: CSSProperties = {
  flex: 1,
  minWidth: 170,
  height: 52,
  borderRadius: 16,
  border: "1px solid #cbd5e1",
  background: "white",
  color: "#0f172a",
  fontSize: 16,
  fontWeight: 900,
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const loadingCardStyle: CSSProperties = {
  maxWidth: 900,
  margin: "0 auto",
  background: "white",
  borderRadius: 24,
  padding: 32,
  boxShadow: "0 20px 50px rgba(15,23,42,0.1)",
};
const supplierCardStyle: CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 20,
  padding: 18,
  marginBottom: 24,
};

const supplierTitleStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 6,
};

const supplierNameStyle: CSSProperties = {
  color: "#0f172a",
  fontSize: 20,
  fontWeight: 900,
  marginBottom: 8,
};

const supplierDescStyle: CSSProperties = {
  color: "#64748b",
  lineHeight: 1.6,
  margin: 0,
};

const supplierStatsStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginTop: 14,
  color: "#166534",
  fontSize: 13,
  fontWeight: 800,
};