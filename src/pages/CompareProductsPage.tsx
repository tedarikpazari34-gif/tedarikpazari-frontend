import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

type ProductImage = {
  id?: string;
  url?: string;
  isCover?: boolean;
  sortOrder?: number;
};

type Product = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  basePrice: string | number;
  unitType: string;
  moq: number;
  leadTimeDays?: number | null;
  stockType?: string | null;
  vatRate?: number | null;
  rfqEnabled?: boolean;
  images?: ProductImage[];
  category?: {
    id?: string;
    name?: string;
  } | null;
  seller?: {
    id?: string;
    name?: string;
    verified?: boolean;
    rating?: number;
    city?: string | null;
    country?: string | null;
  };
};

const API =
  import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

const BACKEND_ORIGIN = API.replace(/\/api\/?$/, "");
const STORAGE_KEY = "compareProductIds";

function resolveImageUrl(value?: string | null) {
  if (!value) return "";

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `${BACKEND_ORIGIN}${value.startsWith("/") ? value : `/${value}`}`;
}

function getImage(product: Product) {
  const cover = product.images?.find((image) => image.isCover)?.url;
  const first = product.images?.[0]?.url;

  return resolveImageUrl(cover || first || product.imageUrl);
}

function readIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

function unitLabel(value: string | undefined, t: any) {
  if (!value) return "";

  const labels: Record<string, string> = {
    "Adet": t("compareProductsPage.piece"),
    "Koli": t("compareProductsPage.box"),
    "Paket": t("compareProductsPage.package"),
    "Kilogram": t("compareProductsPage.kilogram"),
    "Kg": t("compareProductsPage.kilogram"),
    "Ton": t("compareProductsPage.ton"),
    "Litre": t("compareProductsPage.litre"),
    "Metre": t("compareProductsPage.meter"),
    "Palet": t("compareProductsPage.pallet"),
  };

  return labels[value] || value;
}

function stockTypeLabel(value: string | null | undefined, t: any) {
  if (!value) return t("compareProductsPage.notSpecified");

  const labels: Record<string, string> = {
    "Stoktan": t("compareProductsPage.inStock"),
    "STOKTAN": t("compareProductsPage.inStock"),
    "Üretim": t("compareProductsPage.production"),
    "URETIM": t("compareProductsPage.production"),
    "Sipariş Üzerine": t("compareProductsPage.madeToOrder"),
    "SIPARIS_UZERINE": t("compareProductsPage.madeToOrder"),
  };

  return labels[value] || value;
}

export default function CompareProductsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    const ids = readIds();

    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const responses = await Promise.all(
        ids.map(async (id) => {
          const res = await fetch(`${API}/products/${id}`);

          if (!res.ok) return null;

          return (await res.json()) as Product;
        })
      );

      setProducts(
        responses.filter((product): product is Product => Boolean(product))
      );
    } catch (err) {
      console.error("COMPARE LOAD ERROR:", err);
      setError(t("compareProductsPage.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const removeProduct = (productId: string) => {
    const nextIds = readIds().filter((id) => id !== productId);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextIds));
    setProducts((current) =>
      current.filter((product) => product.id !== productId)
    );

    window.dispatchEvent(new Event("compare-products-changed"));
  };

  const clearAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProducts([]);
    window.dispatchEvent(new Event("compare-products-changed"));
  };

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={stateCardStyle}>{t("compareProductsPage.loading")}</div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <div style={eyebrowStyle}>{t("compareProductsPage.eyebrow")}</div>
          <h1 style={titleStyle}>{t("compareProductsPage.title")}</h1>
          <p style={descriptionStyle}>
            {t("compareProductsPage.description")}
          </p>
        </div>

        {products.length > 0 && (
          <button type="button" onClick={clearAll} style={clearButtonStyle}>
            {t("compareProductsPage.clearAll")}
          </button>
        )}
      </section>

      {error ? (
        <div style={stateCardStyle}>{error}</div>
      ) : products.length === 0 ? (
        <div style={stateCardStyle}>
          <div style={{ fontSize: 48 }}>⚖️</div>
          <h2>{t("compareProductsPage.emptyTitle")}</h2>
          <p style={{ color: "#64748b" }}>
            {t("compareProductsPage.emptyText")}
          </p>
          <Link to="/products" style={primaryLinkStyle}>
            {t("compareProductsPage.browseProducts")}
          </Link>
        </div>
      ) : (
        <section style={tableShellStyle}>
          <div
            style={{
              ...comparisonGridStyle,
              gridTemplateColumns: `190px repeat(${products.length}, minmax(230px, 1fr))`,
            }}
          >
            <div style={labelHeaderStyle}>{t("compareProductsPage.product")}</div>

            {products.map((product) => {
              const image = getImage(product);

              return (
                <div key={product.id} style={productHeaderStyle}>
                  <button
                    type="button"
                    onClick={() => removeProduct(product.id)}
                    style={removeButtonStyle}
                    aria-label={t("compareProductsPage.remove")}
                  >
                    ✕
                  </button>

                  <Link to={`/product/${product.id}`} style={productLinkStyle}>
                    {image ? (
                      <img
                        src={image}
                        alt={product.title}
                        style={productImageStyle}
                      />
                    ) : (
                      <div style={placeholderStyle}>📦</div>
                    )}

                    <strong style={productTitleStyle}>{product.title}</strong>
                  </Link>
                </div>
              );
            })}

            <CompareRow
              label={t("compareProductsPage.price")}
              values={products.map(
                (product) =>
                  `${Number(product.basePrice || 0).toLocaleString(locale)} ₺`
              )}
            />

            <CompareRow
              label={t("compareProductsPage.unit")}
              values={products.map((product) =>
                product.unitType ? unitLabel(product.unitType, t) : "-"
              )}
            />

            <CompareRow
              label={t("compareProductsPage.minimumOrder")}
              values={products.map(
                (product) =>
                  `${product.moq || 1} ${unitLabel(product.unitType || "Adet", t)}`
              )}
            />

            <CompareRow
              label={t("compareProductsPage.deliveryTime")}
              values={products.map((product) =>
                product.leadTimeDays
                  ? t("compareProductsPage.days", {
                      count: product.leadTimeDays,
                    })
                  : t("compareProductsPage.notSpecified")
              )}
            />

            <CompareRow
              label={t("compareProductsPage.stockType")}
              values={products.map((product) =>
                stockTypeLabel(product.stockType, t)
              )}
            />

            <CompareRow
              label={t("compareProductsPage.vat")}
              values={products.map((product) =>
                product.vatRate !== null &&
                product.vatRate !== undefined
                  ? `%${product.vatRate}`
                  : t("compareProductsPage.notSpecified")
              )}
            />

            <CompareRow
              label="RFQ"
              values={products.map((product) =>
                product.rfqEnabled
                  ? t("compareProductsPage.quoteAvailable")
                  : t("compareProductsPage.closed")
              )}
            />

            <CompareRow
              label={t("compareProductsPage.supplier")}
              values={products.map(
                (product) =>
                  product.seller?.name || t("compareProductsPage.supplier")
              )}
            />

            <CompareRow
              label={t("compareProductsPage.companyVerification")}
              values={products.map((product) =>
                product.seller?.verified
                  ? t("compareProductsPage.verifiedSupplier")
                  : t("compareProductsPage.standardSupplier")
              )}
            />

            <CompareRow
              label={t("compareProductsPage.sellerRating")}
              values={products.map((product) =>
                Number(product.seller?.rating || 0) > 0
                  ? `⭐ ${Number(product.seller?.rating).toFixed(1)}`
                  : t("compareProductsPage.newSeller")
              )}
            />

            <CompareRow
              label={t("compareProductsPage.location")}
              values={products.map((product) =>
                [
                  product.seller?.city,
                  product.seller?.country || "Türkiye",
                ]
                  .filter(Boolean)
                  .join(", ")
              )}
            />

            <div style={rowLabelStyle}>{t("compareProductsPage.action")}</div>

            {products.map((product) => (
              <div key={`action-${product.id}`} style={cellStyle}>
                <Link
                  to={`/buyer/rfqs/new?productId=${product.id}&product=${encodeURIComponent(
                    product.title
                  )}`}
                  style={quoteButtonStyle}
                >
                  {t("compareProductsPage.requestQuote")}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function CompareRow({
  label,
  values,
}: {
  label: string;
  values: Array<string | number>;
}) {
  return (
    <>
      <div style={rowLabelStyle}>{label}</div>

      {values.map((value, index) => (
        <div key={`${label}-${index}`} style={cellStyle}>
          {value}
        </div>
      ))}
    </>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: "40px 20px 60px",
  background: "#f8fafc",
};

const heroStyle: CSSProperties = {
  maxWidth: 1280,
  margin: "0 auto 24px",
  padding: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 20,
  borderRadius: 28,
  color: "#ffffff",
  background: "linear-gradient(135deg, #0f172a, #0369a1)",
  boxShadow: "0 24px 50px rgba(15,23,42,0.18)",
};

const eyebrowStyle: CSSProperties = {
  color: "#bae6fd",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 1.2,
};

const titleStyle: CSSProperties = {
  margin: "8px 0",
  fontSize: "clamp(32px, 5vw, 48px)",
};

const descriptionStyle: CSSProperties = {
  maxWidth: 760,
  margin: 0,
  color: "#e0f2fe",
  lineHeight: 1.7,
};

const clearButtonStyle: CSSProperties = {
  padding: "12px 17px",
  border: "1px solid rgba(255,255,255,0.25)",
  borderRadius: 12,
  color: "#ffffff",
  background: "rgba(255,255,255,0.12)",
  fontWeight: 900,
  cursor: "pointer",
};

const tableShellStyle: CSSProperties = {
  maxWidth: 1280,
  margin: "0 auto",
  overflowX: "auto",
  borderRadius: 22,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  boxShadow: "0 18px 42px rgba(15,23,42,0.08)",
};

const comparisonGridStyle: CSSProperties = {
  minWidth: 880,
  display: "grid",
};

const labelHeaderStyle: CSSProperties = {
  padding: 20,
  display: "flex",
  alignItems: "center",
  color: "#ffffff",
  background: "#0f172a",
  fontWeight: 900,
};

const productHeaderStyle: CSSProperties = {
  position: "relative",
  padding: 18,
  borderLeft: "1px solid #e2e8f0",
  background: "#f8fafc",
};

const removeButtonStyle: CSSProperties = {
  position: "absolute",
  top: 10,
  right: 10,
  width: 30,
  height: 30,
  border: 0,
  borderRadius: 999,
  color: "#be123c",
  background: "#fee2e2",
  cursor: "pointer",
};

const productLinkStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  color: "#0f172a",
  textDecoration: "none",
};

const productImageStyle: CSSProperties = {
  width: "100%",
  height: 160,
  borderRadius: 14,
  objectFit: "cover",
  background: "#e2e8f0",
};

const placeholderStyle: CSSProperties = {
  height: 160,
  display: "grid",
  placeItems: "center",
  borderRadius: 14,
  background: "#e2e8f0",
  fontSize: 46,
};

const productTitleStyle: CSSProperties = {
  paddingRight: 28,
  fontSize: 17,
  lineHeight: 1.4,
};

const rowLabelStyle: CSSProperties = {
  padding: 17,
  display: "flex",
  alignItems: "center",
  borderTop: "1px solid #e2e8f0",
  color: "#334155",
  background: "#f8fafc",
  fontWeight: 900,
};

const cellStyle: CSSProperties = {
  padding: 17,
  display: "flex",
  alignItems: "center",
  borderTop: "1px solid #e2e8f0",
  borderLeft: "1px solid #e2e8f0",
  color: "#475569",
  lineHeight: 1.5,
};

const quoteButtonStyle: CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 11,
  color: "#ffffff",
  background: "#2563eb",
  textAlign: "center",
  textDecoration: "none",
  fontWeight: 900,
};

const stateCardStyle: CSSProperties = {
  maxWidth: 760,
  margin: "30px auto",
  padding: 38,
  borderRadius: 22,
  background: "#ffffff",
  textAlign: "center",
  boxShadow: "0 18px 42px rgba(15,23,42,0.08)",
};

const primaryLinkStyle: CSSProperties = {
  display: "inline-block",
  marginTop: 12,
  padding: "12px 18px",
  borderRadius: 11,
  color: "#ffffff",
  background: "#0369a1",
  textDecoration: "none",
  fontWeight: 900,
};
