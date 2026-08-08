import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Helmet } from "react-helmet-async";
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

  seller?: {
    id: string;
    name?: string;
    verified?: boolean;
    rating?: number;
    reviewCount?: number;
    completedDeals?: number;
    responseTime?: number;
    logo?: string | null;
    city?: string | null;
    country?: string | null;
  };

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
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isCompared, setIsCompared] = useState(false);

  useEffect(() => {
    const loadSavedActions = async () => {
      try {
        const compareRaw = localStorage.getItem("compareProductIds");
        const compareIds = compareRaw ? JSON.parse(compareRaw) : [];

        setIsCompared(
          Array.isArray(compareIds) && compareIds.includes(productId)
        );
      } catch {
        setIsCompared(false);
      }

      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (!token || role !== "BUYER") {
        setIsFavorite(false);
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/api/favorites/ids`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => []);

        if (res.ok && Array.isArray(data)) {
          setIsFavorite(data.includes(productId));
        }
      } catch (error) {
        console.error("PRODUCT FAVORITE STATUS ERROR:", error);
      }
    };

    loadSavedActions();
  }, [productId]);

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

  useEffect(() => {
    async function loadRelatedProducts() {
      if (!product) return;

      try {
        const requests: Promise<Response>[] = [];

        if (product.seller?.id) {
          requests.push(
            fetch(
              `${BASE_URL}/api/products?sellerId=${encodeURIComponent(
                product.seller.id
              )}`
            )
          );
        } else {
          requests.push(Promise.resolve(new Response("[]")));
        }

        if (product.category?.id) {
          requests.push(
            fetch(
              `${BASE_URL}/api/products?categoryId=${encodeURIComponent(
                product.category.id
              )}`
            )
          );
        } else {
          requests.push(Promise.resolve(new Response("[]")));
        }

        const [sellerRes, similarRes] = await Promise.all(requests);

        const sellerData = await sellerRes.json().catch(() => []);
        const similarData = await similarRes.json().catch(() => []);

        setSellerProducts(
          Array.isArray(sellerData)
            ? sellerData.filter((item: Product) => item.id !== product.id).slice(0, 4)
            : []
        );

        setSimilarProducts(
          Array.isArray(similarData)
            ? similarData
                .filter(
                  (item: Product) =>
                    item.id !== product.id &&
                    item.seller?.id !== product.seller?.id
                )
                .slice(0, 4)
            : []
        );
      } catch (error) {
        console.error("RELATED PRODUCTS ERROR:", error);
        setSellerProducts([]);
        setSimilarProducts([]);
      }
    }

    loadRelatedProducts();
  }, [product]);

  const toggleFavorite = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      navigate("/login");
      return;
    }

    if (role !== "BUYER") {
      alert("Favoriler özelliğini yalnızca alıcı hesapları kullanabilir.");
      return;
    }

    try {
      setFavoriteLoading(true);

      const res = await fetch(
        `${BASE_URL}/api/favorites/${productId}`,
        {
          method: isFavorite ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message || "Favori işlemi başarısız.");
        return;
      }

      setIsFavorite((current) => !current);
    } catch (error) {
      console.error("PRODUCT FAVORITE ERROR:", error);
      alert("Favori işlemi sırasında hata oluştu.");
    } finally {
      setFavoriteLoading(false);
    }
  };

  const toggleCompare = () => {
    try {
      const raw = localStorage.getItem("compareProductIds");
      const current: string[] = raw ? JSON.parse(raw) : [];
      const ids = Array.isArray(current) ? current : [];

      if (ids.includes(productId)) {
        const next = ids.filter((id) => id !== productId);
        localStorage.setItem("compareProductIds", JSON.stringify(next));
        setIsCompared(false);
      } else {
        if (ids.length >= 4) {
          alert("En fazla 4 ürün karşılaştırabilirsiniz.");
          return;
        }

        localStorage.setItem(
          "compareProductIds",
          JSON.stringify([...ids, productId])
        );
        setIsCompared(true);
      }

      window.dispatchEvent(new Event("compare-products-changed"));
    } catch (error) {
      console.error("PRODUCT COMPARE ERROR:", error);
    }
  };

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
      <Helmet>
        <title>{product.title} | Tedarik Pazarı</title>
        <meta
          name="description"
          content={
            product.description ||
            `${product.title} için fiyat, minimum sipariş miktarı ve tedarikçi bilgilerini inceleyin.`
          }
        />
        <link
          rel="canonical"
          href={`https://xn--tedarikpazar-d5b.com/product/${product.id}`}
        />
        <meta property="og:title" content={product.title} />
        <meta
          property="og:description"
          content={product.description || "Tedarik Pazarı ürün detayı"}
        />
      </Helmet>

      <section style={containerStyle}>
        <div style={gallerySectionStyle}>
          <div style={mainImageBoxStyle}>
            {mainImageUrl && !mainImageError ? (
              <img
                src={mainImageUrl}
                alt={product.title}
                style={mainImageStyle}
                loading="eager"
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
                        loading="lazy"
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
            <span style={verifiedBadgeStyle}>✔ Doğrulanmış Firma</span>

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
          {product.seller && (
            <div style={sellerCardStyle}>
              <div style={sellerIdentityStyle}>
                <div style={sellerLogoStyle}>
                  {product.seller.logo ? (
                    <img
                      src={resolveImageUrl(product.seller.logo) || ""}
                      alt={product.seller.name || "Satıcı"}
                      style={sellerLogoImageStyle}
                    />
                  ) : (
                    <span>
                      {(product.seller.name || "TP")
                        .split(" ")
                        .slice(0, 2)
                        .map((word) => word[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                  )}
                </div>

                <div>
                  <div style={sellerLabelStyle}>SATICI FİRMA</div>

                  <div style={sellerNameRowStyle}>
                    <strong style={sellerNameStyle}>
                      {product.seller.name || "Satıcı"}
                    </strong>

                    {product.seller.verified && (
                      <span style={sellerVerifiedStyle}>✓ Doğrulandı</span>
                    )}
                  </div>

                  <div style={sellerMetaStyle}>
                    ⭐ {Number(product.seller.rating || 0).toFixed(1)}
                    {" · "}
                    {product.seller.reviewCount || 0} değerlendirme
                    {" · "}
                    {product.seller.completedDeals || 0} satış
                  </div>

                  <div style={sellerLocationStyle}>
                    📍{" "}
                    {[product.seller.city, product.seller.country || "Türkiye"]
                      .filter(Boolean)
                      .join(", ")}
                    {" · "}
                    ⏱{" "}
                    {product.seller.responseTime
                      ? `${product.seller.responseTime} saat yanıt`
                      : "Yanıt süresi ölçülüyor"}
                  </div>
                </div>
              </div>

              <Link
                to={`/store/${product.seller.id}`}
                style={sellerStoreButtonStyle}
              >
                Mağazayı Gör
              </Link>
            </div>
          )}
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
            <InfoBox label="Tedarikçi" value="Doğrulanmış Firma" green />
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
    <div style={supplierNameStyle}>Doğrulanmış Firma</div>
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
          <div style={purchaseBoxStyle}>
            <div style={purchaseHeaderStyle}>
              <div>
                <span style={purchaseLabelStyle}>Toptan satın alma</span>
                <strong style={purchasePriceStyle}>
                  {Number(product.basePrice || 0).toLocaleString("tr-TR")} ₺
                </strong>
              </div>

              <span style={purchaseUnitStyle}>/ {product.unitType}</span>
            </div>

            <div style={purchaseFeatureGridStyle}>
              <div style={purchaseFeatureStyle}>
                <span>📦 Minimum sipariş</span>
                <strong>
                  {product.moq} {product.unitType}
                </strong>
              </div>

              <div style={purchaseFeatureStyle}>
                <span>🚚 Tahmini teslim</span>
                <strong>
                  {product.leadTimeDays
                    ? `${product.leadTimeDays} gün`
                    : "Satıcıya sorun"}
                </strong>
              </div>

              <div style={purchaseFeatureStyle}>
                <span>🏷️ Stok durumu</span>
                <strong>{product.stockType || "Bilgi alın"}</strong>
              </div>

              <div style={purchaseFeatureStyle}>
                <span>🧾 KDV</span>
                <strong>
                  {product.vatRate !== null &&
                  product.vatRate !== undefined
                    ? `%${product.vatRate}`
                    : "Belirtilmedi"}
                </strong>
              </div>
            </div>

            <div style={quickActionGridStyle}>
              <button
                type="button"
                onClick={toggleFavorite}
                disabled={favoriteLoading}
                style={{
                  ...quickActionButtonStyle,
                  color: isFavorite ? "#be123c" : "#334155",
                  background: isFavorite ? "#fff1f2" : "#f8fafc",
                }}
              >
                {favoriteLoading
                  ? "İşleniyor..."
                  : isFavorite
                    ? "♥️ Favorilerde"
                    : "♡ Favoriye Ekle"}
              </button>

              <button
                type="button"
                onClick={toggleCompare}
                style={{
                  ...quickActionButtonStyle,
                  color: isCompared ? "#1d4ed8" : "#334155",
                  background: isCompared ? "#eff6ff" : "#f8fafc",
                }}
              >
                {isCompared
                  ? "✓ Karşılaştırmada"
                  : "⚖️ Karşılaştır"}
              </button>
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

      {product.seller && sellerProducts.length > 0 && (
        <ProductCollection
          title="Bu tedarikçinin diğer ürünleri"
          description={`${product.seller.name || "Satıcı"} tarafından yayınlanan diğer ürünler`}
          products={sellerProducts}
        />
      )}

      {similarProducts.length > 0 && (
        <ProductCollection
          title="Benzer ürünler"
          description={`${product.category?.name || "Aynı kategorideki"} alternatif ürünler`}
          products={similarProducts}
        />
      )}
    </main>
  );
}

function ProductCollection({
  title,
  description,
  products,
}: {
  title: string;
  description: string;
  products: Product[];
}) {
  return (
    <section style={collectionStyle}>
      <div style={collectionHeaderStyle}>
        <div>
          <h2 style={collectionTitleStyle}>{title}</h2>
          <p style={collectionDescriptionStyle}>{description}</p>
        </div>
      </div>

      <div style={collectionGridStyle}>
        {products.map((item) => {
          const image =
            item.images?.find((value) => value.isCover)?.url ||
            item.images?.[0]?.url ||
            item.imageUrl;

          return (
            <Link
              key={item.id}
              to={`/product/${item.id}`}
              style={collectionLinkStyle}
            >
              <article style={collectionCardStyle}>
                {image ? (
                  <img
                    src={resolveImageUrl(image) || ""}
                    alt={item.title}
                    style={collectionImageStyle}
                  />
                ) : (
                  <div style={collectionPlaceholderStyle}>
                    {getCategoryIcon(item.category?.name)}
                  </div>
                )}

                <div style={collectionBodyStyle}>
                  <span style={collectionCategoryStyle}>
                    {item.category?.name || "Ürün"}
                  </span>

                  <h3 style={collectionProductTitleStyle}>{item.title}</h3>

                  <div style={collectionFooterStyle}>
                    <strong style={collectionPriceStyle}>
                      {Number(item.basePrice || 0).toLocaleString("tr-TR")} ₺
                    </strong>

                    <span style={collectionMoqStyle}>
                      Min. {item.moq || 1} {item.unitType || "adet"}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
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
  gridTemplateColumns:
    window.innerWidth < 900 ? "1fr" : "1fr 1fr",
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
  gridTemplateColumns: window.innerWidth < 700 ? "1fr" : "1fr 1fr",
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
  flexDirection: window.innerWidth < 700 ? "column" : "row",
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
const sellerCardStyle: CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 18,
  padding: 18,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  marginBottom: 22,
};

const sellerLabelStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 6,
};

const sellerNameStyle: CSSProperties = {
  color: "#0f172a",
  fontSize: 18,
};

const sellerMetaStyle: CSSProperties = {
  marginTop: 8,
  color: "#64748b",
  fontSize: 13,
  fontWeight: 700,
};

const sellerStoreButtonStyle: CSSProperties = {
  textDecoration: "none",
  background: "#2563eb",
  color: "white",
  padding: "11px 14px",
  borderRadius: 12,
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const sellerIdentityStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  minWidth: 0,
};

const sellerLogoStyle: CSSProperties = {
  width: 62,
  height: 62,
  flexShrink: 0,
  display: "grid",
  placeItems: "center",
  overflow: "hidden",
  borderRadius: 16,
  background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
  color: "#1d4ed8",
  fontSize: 20,
  fontWeight: 900,
};

const sellerLogoImageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const sellerNameRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 8,
};

const sellerVerifiedStyle: CSSProperties = {
  padding: "5px 8px",
  borderRadius: 999,
  background: "#dcfce7",
  color: "#166534",
  fontSize: 11,
  fontWeight: 900,
};

const sellerLocationStyle: CSSProperties = {
  marginTop: 7,
  color: "#64748b",
  fontSize: 12,
  lineHeight: 1.5,
};

const collectionStyle: CSSProperties = {
  maxWidth: 1220,
  margin: "28px auto 0",
  padding: 28,
  borderRadius: 26,
  background: "#ffffff",
  boxShadow: "0 18px 42px rgba(15,23,42,0.08)",
};

const collectionHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  marginBottom: 22,
};

const collectionTitleStyle: CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: "clamp(25px, 4vw, 34px)",
};

const collectionDescriptionStyle: CSSProperties = {
  margin: "7px 0 0",
  color: "#64748b",
};

const collectionGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
  gap: 18,
};

const collectionLinkStyle: CSSProperties = {
  color: "inherit",
  textDecoration: "none",
};

const collectionCardStyle: CSSProperties = {
  height: "100%",
  overflow: "hidden",
  borderRadius: 18,
  border: "1px solid #e2e8f0",
  background: "#ffffff",
};

const collectionImageStyle: CSSProperties = {
  width: "100%",
  height: 170,
  objectFit: "cover",
  background: "#f1f5f9",
};

const collectionPlaceholderStyle: CSSProperties = {
  height: 170,
  display: "grid",
  placeItems: "center",
  background: "#f1f5f9",
  fontSize: 44,
};

const collectionBodyStyle: CSSProperties = {
  padding: 16,
};

const collectionCategoryStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 11,
  fontWeight: 900,
  textTransform: "uppercase",
};

const collectionProductTitleStyle: CSSProperties = {
  margin: "8px 0 16px",
  color: "#0f172a",
  fontSize: 17,
};

const collectionFooterStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 10,
};

const collectionPriceStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 18,
};

const collectionMoqStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 11,
  textAlign: "right",
};

const purchaseBoxStyle: CSSProperties = {
  marginBottom: 24,
  padding: 20,
  borderRadius: 20,
  background: "linear-gradient(145deg, #f8fafc, #eff6ff)",
  border: "1px solid #dbeafe",
};

const purchaseHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 18,
};

const purchaseLabelStyle: CSSProperties = {
  display: "block",
  marginBottom: 5,
  color: "#64748b",
  fontSize: 12,
  fontWeight: 700,
};

const purchasePriceStyle: CSSProperties = {
  display: "block",
  color: "#1d4ed8",
  fontSize: 30,
  fontWeight: 900,
};

const purchaseUnitStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 13,
  fontWeight: 700,
};

const purchaseFeatureGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
  gap: 10,
};

const purchaseFeatureStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 5,
  padding: 12,
  borderRadius: 13,
  background: "#ffffff",
  color: "#64748b",
  fontSize: 12,
};

const quickActionGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 10,
  marginTop: 14,
};

const quickActionButtonStyle: CSSProperties = {
  minHeight: 44,
  padding: "10px 13px",
  border: "1px solid #cbd5e1",
  borderRadius: 12,
  fontSize: 13,
  fontWeight: 900,
  cursor: "pointer",
};
