import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { unitLabel } from "../lib/unitLabel";

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
  country?: string | null;
  city?: string | null;
  unitType: string;
  moq: number;
  basePrice: string;
  leadTimeDays?: number | null;
  stockType?: string | null;
  vatRate?: number | null;
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

function stockTypeLabel(value: string | null | undefined, t: any) {
  if (!value) return "-";

  const labels: Record<string, string> = {
    "Stoktan": t("productDetailPage.inStock"),
    "STOKTAN": t("productDetailPage.inStock"),
    "STOCK": t("productDetailPage.inStock"),
    "Üretim": t("productDetailPage.production"),
    "URETIM": t("productDetailPage.production"),
    "Sipariş Üzerine": t("productDetailPage.madeToOrder"),
    "SIPARIS_UZERINE": t("productDetailPage.madeToOrder"),
    "ON_DEMAND": t("productDetailPage.madeToOrder"),
  };

  return labels[value] || value;
}

function resolveImageUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
}

export default function ProductDetailPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";

  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const productId = params.id as string;
  const isSellerPreview = location.pathname.startsWith("/seller/products/") && location.pathname.endsWith("/view");

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mainImageError, setMainImageError] = useState(false);
  const [thumbErrors, setThumbErrors] = useState<Record<string, boolean>>({});
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isCompared, setIsCompared] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState("1");
  const [addedToCart, setAddedToCart] = useState(false);

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

        const token = localStorage.getItem("token");
        const url = isSellerPreview
          ? `${BASE_URL}/api/products/mine/${productId}`
          : `${BASE_URL}/api/products/${productId}?lang=${encodeURIComponent(i18n.language)}`;

        const res = await fetch(url, {
          headers:
            isSellerPreview && token
              ? { Authorization: `Bearer ${token}` }
              : undefined,
        });
        const data = await res.json();

        if (!res.ok) {
          setProduct(null);
          return;
        }

        setProduct(data);

        const initialQuantity = Math.max(Number(data.moq || 1), 1);
        setQuantity(initialQuantity);
        setQuantityInput(String(initialQuantity));
      } catch (error) {
        console.error("PRODUCT DETAIL ERROR:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId, i18n.language, isSellerPreview]);

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

        if (product.category?.id) {
          const similarRes = await fetch(
            `${BASE_URL}/api/products?categoryId=${encodeURIComponent(
              product.category.id
            )}&lang=${encodeURIComponent(i18n.language)}`
          );

          const similarData = await similarRes.json().catch(() => []);

          setSimilarProducts(
            Array.isArray(similarData)
              ? similarData
                  .filter((item: Product) => item.id !== product.id)
                  .slice(0, 4)
              : []
          );
        } else {
          setSimilarProducts([]);
        }
      } catch (error) {
        console.error("RELATED PRODUCTS ERROR:", error);
        setSimilarProducts([]);
      }
    }

    loadRelatedProducts();
  }, [product, i18n.language]);

  const toggleFavorite = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      navigate("/login");
      return;
    }

    if (role !== "BUYER") {
      alert(t("productDetailPage.favoriteBuyerOnly"));
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
        alert(data?.message || t("productDetailPage.favoriteFailed"));
        return;
      }

      setIsFavorite((current) => !current);
    } catch (error) {
      console.error("PRODUCT FAVORITE ERROR:", error);
      alert(t("productDetailPage.favoriteError"));
    } finally {
      setFavoriteLoading(false);
    }
  };

  const addToCart = () => {
    if (!product) return;

    if (quantity < product.moq) {
      alert(t("productDetailPage.cartInvalidQuantity"));
      return;
    }

    try {
      const raw = localStorage.getItem("tedarikCart");
      const current = raw ? JSON.parse(raw) : [];
      const cart = Array.isArray(current) ? current : [];

      const existingIndex = cart.findIndex(
        (item: any) => item.productId === product.id
      );

      const item = {
        productId: product.id,
        title: product.title,
        quantity,
        moq: Math.max(Number(product.moq || 1), 1),
        unitType: product.unitType,
        unitPrice: Number(product.basePrice || 0),
        sellerId: product.seller?.id || null,
        imageUrl: product.imageUrl || product.images?.[0]?.url || null,
      };

      if (existingIndex >= 0) {
        cart[existingIndex] = item;
      } else {
        cart.push(item);
      }

      localStorage.setItem("tedarikCart", JSON.stringify(cart));
      window.dispatchEvent(new Event("tedarik-cart-changed"));
      setAddedToCart(true);
    } catch (error) {
      console.error("ADD TO CART ERROR:", error);
    }
  };

  const buyNow = () => {
    if (!product) return;

    if (quantity < product.moq) {
      alert(t("productDetailPage.cartInvalidQuantity"));
      return;
    }

    addToCart();
    navigate("/cart");
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
          alert(t("productDetailPage.compareLimit"));
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
        <div style={loadingCardStyle}>{t("productDetailPage.loading")}</div>
      </main>
    );
  }

  if (!product) {
    return (
      <main style={pageStyle}>
        <div style={loadingCardStyle}>
          <h1 style={{ marginTop: 0 }}>{t("productDetailPage.notFound")}</h1>
          <p>{t("productDetailPage.notFoundText")}</p>
          <Link to="/" style={secondaryButtonStyle}>
            {t("productDetailPage.backHome")}
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
            t("productDetailPage.seoDescription", { title: product.title })
          }
        />
        <link
          rel="canonical"
          href={`https://xn--tedarikpazar-d5b.com/product/${product.id}`}
        />
        <meta property="og:title" content={product.title} />
        <meta
          property="og:description"
          content={product.description || t("productDetailPage.seoOgDescription")}
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
                <div style={emptyTextStyle}>{t("productDetailPage.noImage")}</div>
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
            {product.category?.name || t("productDetailPage.category")}
          </div>

          <div style={badgeRowStyle}>
            <span
              style={{
                ...approvalBadgeStyle,
                background: product.isApproved ? "#dcfce7" : "#fef3c7",
                color: product.isApproved ? "#166534" : "#92400e",
              }}
            >
              {product.isApproved
                ? t("productDetailPage.approved")
                : t("productDetailPage.approvalPending")}
            </span>
          </div>

          <h1 style={titleStyle}>{product.title}</h1>

          <p style={descriptionStyle}>
            {product.description || t("productDetailPage.noDescription")}
          </p>

          <div style={purchaseBoxStyle}>
            <div style={purchaseHeaderStyle}>
              <div>
                <span style={purchaseLabelStyle}>{t("productDetailPage.wholesalePurchase")}</span>
                <strong style={purchasePriceStyle}>
                  {Number(product.basePrice || 0).toLocaleString(locale)} ₺
                </strong>
                <span style={vatIncludedPurchaseStyle}>
                  KDV dahil
                </span>
              </div>

              <span style={purchaseUnitStyle}>/ {unitLabel(product.unitType, t)}</span>
            </div>

            <div style={purchaseFeatureGridStyle}>
              <div style={purchaseFeatureStyle}>
                <span>{t("productDetailPage.minimumOrder")}</span>
                <strong>
                  {product.moq} {unitLabel(product.unitType, t)}
                </strong>
              </div>

              <div style={purchaseFeatureStyle}>
                <span>Kargoya hazırlama</span>
                <strong>
                  {product.leadTimeDays
                    ? `En geç ${product.leadTimeDays} iş günü içinde kargoya verilir`
                    : "Kargoya hazırlama süresi için bilgi alın"}
                </strong>
              </div>

              <div style={purchaseFeatureStyle}>
                <span>{t("productDetailPage.stockStatus")}</span>
                <strong>
                  {product.stockType
                    ? stockTypeLabel(product.stockType, t)
                    : t("productDetailPage.getInformation")}
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
                  ? t("productDetailPage.processing")
                  : isFavorite
                    ? t("productDetailPage.inFavorites")
                    : t("productDetailPage.addFavorite")}
              </button>

            </div>

              <div
                style={{
                  marginTop: 18,
                  paddingTop: 18,
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 20,
                    alignItems: "flex-end",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        marginBottom: 8,
                        color: "#334155",
                      }}
                    >
                      {t("productDetailPage.quantity")}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <button
                        type="button"
                        aria-label="Miktarı azalt"
                        onClick={() => {
                          const minimum = Math.max(
                            Number(product.moq || 1),
                            1
                          );
                          const next = Math.max(minimum, quantity - 1);

                          setQuantity(next);
                          setQuantityInput(String(next));
                        }}
                        disabled={
                          quantity <= Math.max(Number(product.moq || 1), 1)
                        }
                        style={{
                          width: 44,
                          height: 44,
                          border: "1px solid #cbd5e1",
                          borderRadius: 10,
                          background: "#ffffff",
                          fontSize: 20,
                          fontWeight: 800,
                          cursor:
                            quantity <= Math.max(Number(product.moq || 1), 1)
                              ? "not-allowed"
                              : "pointer",
                          opacity:
                            quantity <= Math.max(Number(product.moq || 1), 1)
                              ? 0.45
                              : 1,
                        }}
                      >
                        −
                      </button>

                      <input
                        type="number"
                        min={product.moq}
                        step={1}
                        inputMode="numeric"
                        value={quantityInput}
                        onChange={(e) => {
                          const value = e.target.value;
                          setQuantityInput(value);

                          if (value === "") return;

                          const next = Number(value);
                          if (Number.isInteger(next) && next > 0) {
                            setQuantity(next);
                          }
                        }}
                        onBlur={() => {
                          const minimum = Math.max(
                            Number(product.moq || 1),
                            1
                          );
                          const parsed = Number(quantityInput);
                          const normalized =
                            Number.isInteger(parsed) && parsed >= minimum
                              ? parsed
                              : minimum;

                          setQuantity(normalized);
                          setQuantityInput(String(normalized));
                        }}
                        style={{
                          width: 96,
                          height: 44,
                          boxSizing: "border-box",
                          padding: "8px 10px",
                          border: "1px solid #94a3b8",
                          borderRadius: 10,
                          textAlign: "center",
                          fontSize: 16,
                          fontWeight: 800,
                          color: "#0f172a",
                        }}
                      />

                      <button
                        type="button"
                        aria-label="Miktarı artır"
                        onClick={() => {
                          const next = quantity + 1;
                          setQuantity(next);
                          setQuantityInput(String(next));
                        }}
                        style={{
                          width: 44,
                          height: 44,
                          border: "1px solid #cbd5e1",
                          borderRadius: 10,
                          background: "#ffffff",
                          fontSize: 20,
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        +
                      </button>
                    </div>

                    <div
                      style={{
                        marginTop: 7,
                        fontSize: 12,
                        color: "#64748b",
                      }}
                    >
                      Minimum sipariş:{" "}
                      <strong>
                        {product.moq} {unitLabel(product.unitType, t)}
                      </strong>
                    </div>
                  </div>

                  <div
                    style={{
                      minWidth: 190,
                      textAlign: "right",
                    }}
                  >
                    <div
                      style={{
                        marginBottom: 4,
                        fontSize: 12,
                        color: "#64748b",
                      }}
                    >
                      {quantity} {unitLabel(product.unitType, t)} ×{" "}
                      {Number(product.basePrice || 0).toLocaleString(locale)} ₺
                    </div>

                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#475569",
                      }}
                    >
                      Toplam ödeme
                    </div>

                    <div
                      style={{
                        marginTop: 2,
                        fontSize: 24,
                        lineHeight: 1.2,
                        fontWeight: 900,
                        color: "#0f172a",
                      }}
                    >
                      {Number(
                        Number(product.basePrice || 0) * quantity
                      ).toLocaleString(locale)}{" "}
                      ₺
                    </div>

                    <div
                      style={{
                        marginTop: 3,
                        fontSize: 11,
                        color: "#64748b",
                      }}
                    >
                      KDV dahil
                    </div>
                  </div>
                </div>
              </div>
          </div>

          <div style={actionsStyle}>
            <button
              type="button"
              onClick={buyNow}
              style={buyNowButtonStyle}
            >
              Hemen Al
            </button>

            <button
              type="button"
              onClick={addToCart}
              style={primaryButtonStyle}
            >
              {addedToCart
                ? t("productDetailPage.addedToCart")
                : t("productDetailPage.addToCart")}
            </button>

            {addedToCart && (
              <button
                type="button"
                onClick={() => navigate("/cart")}
                style={secondaryButtonStyle}
              >
                {t("productDetailPage.viewCart")}
              </button>
            )}
          </div>
        </div>
      </section>

      <section style={productDetailsSectionStyle}>
        <div style={productDetailsHeaderStyle}>
          <span style={productDetailsEyebrowStyle}>ÜRÜN DETAYLARI</span>
          <h2 style={productDetailsTitleStyle}>Ürün Bilgileri</h2>
          <p style={productDetailsDescriptionStyle}>
            {product.description || "Bu ürün için henüz ayrıntılı açıklama eklenmemiş."}
          </p>
        </div>

        <div style={productDetailsContentStyle}>
          <div style={productSpecsCardStyle}>
            <h3 style={productSpecsTitleStyle}>Ürün Özellikleri</h3>

            <div style={productSpecsGridStyle}>
              <div style={productSpecItemStyle}>
                <span style={productSpecLabelStyle}>Kategori</span>
                <strong style={productSpecValueStyle}>
                  {product.category?.name || "-"}
                </strong>
              </div>

              <div style={productSpecItemStyle}>
                <span style={productSpecLabelStyle}>Satış Birimi</span>
                <strong style={productSpecValueStyle}>
                  {unitLabel(product.unitType, t)}
                </strong>
              </div>

              <div style={productSpecItemStyle}>
                <span style={productSpecLabelStyle}>Minimum Sipariş</span>
                <strong style={productSpecValueStyle}>
                  {product.moq} {unitLabel(product.unitType, t)}
                </strong>
              </div>

              <div style={productSpecItemStyle}>
                <span style={productSpecLabelStyle}>KDV</span>
                <strong style={productSpecValueStyle}>
                  %{Number(product.vatRate || 0)}
                </strong>
              </div>

              <div style={productSpecItemStyle}>
                <span style={productSpecLabelStyle}>Stok Durumu</span>
                <strong style={productSpecValueStyle}>
                  {product.stockType
                    ? stockTypeLabel(product.stockType, t)
                    : "Bilgi alın"}
                </strong>
              </div>

              <div style={productSpecItemStyle}>
                <span style={productSpecLabelStyle}>Hazırlama Süresi</span>
                <strong style={productSpecValueStyle}>
                  {product.leadTimeDays
                    ? `${product.leadTimeDays} iş günü`
                    : "Bilgi alın"}
                </strong>
              </div>
            </div>
          </div>

        </div>
      </section>

      {similarProducts.length > 0 && (
        <ProductCollection
          title={t("productDetailPage.similarProducts")}
          description={t("productDetailPage.sameCategoryAlternatives", {
            category:
              product.category?.name || t("productDetailPage.sameCategory"),
          })}
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
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";

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
                    {item.category?.name || t("productDetailPage.product")}
                  </span>

                  <h3 style={collectionProductTitleStyle}>{item.title}</h3>

                  <div style={collectionFooterStyle}>
                    <strong style={collectionPriceStyle}>
                      {Number(item.basePrice || 0).toLocaleString(locale)} ₺
                    </strong>

                    <span style={collectionMoqStyle}>
                      {t("productDetailPage.minimumShort")} {item.moq || 1}{" "}
                      {unitLabel(item.unitType || "adet", t)}
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
  background: "#f7f9fb",
  padding: window.innerWidth < 700 ? "18px 12px" : "30px 24px 48px",
  width: "100%",
  maxWidth: "100%",
  overflowX: "hidden",
};

const containerStyle: CSSProperties = {
  maxWidth: 1360,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns:
    window.innerWidth < 900 ? "1fr" : "minmax(0, 0.86fr) minmax(0, 1.14fr)",
  gap: window.innerWidth < 900 ? 20 : 30,
  alignItems: "start",
};

const gallerySectionStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  minWidth: 0,
  width: "100%",
  maxWidth: "100%",
};

const mainImageBoxStyle: CSSProperties = {
  background: "#ffffff",
  borderRadius: window.innerWidth < 700 ? 14 : 16,
  overflow: "hidden",
  minHeight: window.innerWidth < 700 ? 320 : 540,
  boxShadow: "0 8px 24px rgba(11,61,110,0.06)",
  border: "1px solid #dfe7ee",
  width: "100%",
  maxWidth: "100%",
};

const mainImageStyle: CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  height: window.innerWidth < 700 ? 320 : 540,
  objectFit: "contain",
  display: "block",
  background: "#ffffff",
  padding: window.innerWidth < 700 ? 10 : 18,
  boxSizing: "border-box",
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
  background: "#ffffff",
  borderRadius: window.innerWidth < 700 ? 14 : 16,
  padding: window.innerWidth < 700 ? 20 : 28,
  boxShadow: "0 8px 24px rgba(11,61,110,0.06)",
  border: "1px solid #dfe7ee",
};

const categoryStyle: CSSProperties = {
  color: "#16A34A",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 10,
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


const approvalBadgeStyle: CSSProperties = {
  padding: "7px 11px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
};

const titleStyle: CSSProperties = {
  fontSize: window.innerWidth < 700 ? 27 : 34,
  lineHeight: 1.18,
  fontWeight: 900,
  margin: "0 0 12px",
  color: "#0B3D6E",
  letterSpacing: -0.5,
};

const descriptionStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 14,
  lineHeight: 1.65,
  margin: "0 0 20px",
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
  height: 54,
  border: "none",
  borderRadius: 12,
  background: "linear-gradient(135deg, #16B83E 0%, #22C55E 100%)",
  color: "#ffffff",
  fontSize: 16,
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 8px 18px rgba(22,184,62,0.20)",
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
  height: 190,
  objectFit: "contain",
  display: "block",
  boxSizing: "border-box",
  padding: 12,
  background: "#ffffff",
  borderBottom: "1px solid #eef2f6",
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
  textAlign: "end",
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

const vatIncludedPurchaseStyle: CSSProperties = {
  display: "block",
  marginTop: 5,
  color: "#64748b",
  fontSize: 12,
  fontWeight: 700,
};

const buyNowButtonStyle: CSSProperties = {
  flex: 1,
  minWidth: 190,
  height: 54,
  border: "1.5px solid #0B3D6E",
  borderRadius: 12,
  background: "#ffffff",
  color: "#0B3D6E",
  fontSize: 16,
  fontWeight: 900,
  cursor: "pointer",
};

const productDetailsSectionStyle: CSSProperties = {
  maxWidth: 1360,
  margin: "28px auto 0",
  padding: window.innerWidth < 700 ? 20 : 28,
  background: "#ffffff",
  border: "1px solid #dfe7ee",
  borderRadius: 16,
  boxShadow: "0 8px 24px rgba(11,61,110,0.05)",
};

const productDetailsHeaderStyle: CSSProperties = {
  paddingBottom: 22,
  borderBottom: "1px solid #e8eef3",
};

const productDetailsEyebrowStyle: CSSProperties = {
  display: "block",
  marginBottom: 7,
  color: "#16A34A",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.2,
};

const productDetailsTitleStyle: CSSProperties = {
  margin: 0,
  color: "#0B3D6E",
  fontSize: window.innerWidth < 700 ? 24 : 28,
  lineHeight: 1.2,
  fontWeight: 900,
};

const productDetailsDescriptionStyle: CSSProperties = {
  maxWidth: 900,
  margin: "12px 0 0",
  color: "#475569",
  fontSize: 14,
  lineHeight: 1.75,
};

const productDetailsContentStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 22,
  paddingTop: 24,
  alignItems: "start",
  width: "100%",
};

const productSpecsCardStyle: CSSProperties = {
  minWidth: 0,
};

const productSpecsTitleStyle: CSSProperties = {
  margin: "0 0 16px",
  color: "#0f172a",
  fontSize: 18,
  fontWeight: 900,
};

const productSpecsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: window.innerWidth < 700 ? "1fr" : "1fr 1fr",
  borderTop: "1px solid #e5eaf0",
  borderLeft: "1px solid #e5eaf0",
};

const productSpecItemStyle: CSSProperties = {
  minHeight: 66,
  padding: "13px 16px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: 5,
  borderRight: "1px solid #e5eaf0",
  borderBottom: "1px solid #e5eaf0",
  background: "#ffffff",
};

const productSpecLabelStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 12,
  fontWeight: 700,
};

const productSpecValueStyle: CSSProperties = {
  color: "#0B3D6E",
  fontSize: 14,
  fontWeight: 900,
};
