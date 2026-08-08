import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const BASE_URL = "https://tedarik-backend.onrender.com";

type ProductImageObject = {
  url?: string;
  imageUrl?: string;
};

type Product = {
  id: string;
  title?: string;
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
  thumbnail?: string | null;
  images?: Array<string | ProductImageObject>;
  price?: number | string;
  basePrice?: number | string;
  unitType?: string;
  moq?: number;
  seller?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
  categoryName?: string;
};

type Category = {
  id: string;
  name: string;
  parentId?: string | null;
};

function decodeCategory(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getTitle(product: Product) {
  return product.title || product.name || "Ürün";
}

function getCategory(product: Product) {
  return product.category?.name || product.categoryName || "Kategori";
}

function getPrice(product: Product) {
  const value = product.price ?? product.basePrice;

  if (value === undefined || value === null || value === "") {
    return "Teklif Al";
  }

  const numeric = Number(value);

  if (Number.isNaN(numeric)) return String(value);

  return `${numeric.toLocaleString("tr-TR")} ₺`;
}

function resolveImage(product: Product) {
  if (Array.isArray(product.images) && product.images.length > 0) {
    const first = product.images[0];

    if (typeof first === "string") {
      return first.startsWith("http") ? first : `${BASE_URL}${first}`;
    }

    if (first?.url) {
      return first.url.startsWith("http") ? first.url : `${BASE_URL}${first.url}`;
    }

    if (first?.imageUrl) {
      return first.imageUrl.startsWith("http")
        ? first.imageUrl
        : `${BASE_URL}${first.imageUrl}`;
    }
  }

  if (product.imageUrl) {
    return product.imageUrl.startsWith("http")
      ? product.imageUrl
      : `${BASE_URL}${product.imageUrl}`;
  }

  if (product.thumbnail) {
    return product.thumbnail.startsWith("http")
      ? product.thumbnail
      : `${BASE_URL}${product.thumbnail}`;
  }

  return "";
}

export default function CategoryPage() {
  const navigate = useNavigate();
  const params = useParams();
  const rawCategoryId = params.id || "";
  const categoryKey = decodeCategory(rawCategoryId);

  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const isProbablyId =
    /^[0-9a-f-]{12,}$/i.test(categoryKey) || categoryKey.length > 24;

  useEffect(() => {
    if (!categoryKey) return;

    async function load() {
      try {
        setLoading(true);

        const [productsRes, categoriesRes] = await Promise.all([
          isProbablyId
            ? fetch(`${BASE_URL}/api/products/category/${categoryKey}`)
            : fetch(`${BASE_URL}/api/products`),
          fetch(`${BASE_URL}/api/categories`),
        ]);

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();

        const safeProducts = Array.isArray(productsData) ? productsData : [];
        const safeCategories = Array.isArray(categoriesData) ? categoriesData : [];

        setAllCategories(safeCategories);

        const foundCategory =
          safeCategories.find((c: Category) => c.id === categoryKey) ||
          safeCategories.find(
            (c: Category) => c.name.toLowerCase() === categoryKey.toLowerCase()
          ) ||
          null;

        setCurrentCategory(foundCategory);

        const children = foundCategory
          ? safeCategories.filter((c: Category) => c.parentId === foundCategory.id)
          : [];

        setChildCategories(children);

        if (isProbablyId) {
          setProducts(safeProducts);
        } else {
          const filteredByName = safeProducts.filter((product: Product) => {
            const text = `${getTitle(product)} ${getCategory(product)}`.toLowerCase();
            return text.includes(categoryKey.toLowerCase());
          });

          setProducts(filteredByName);
        }
      } catch (error) {
        console.error("CATEGORY PAGE ERROR:", error);
        setProducts([]);
        setAllCategories([]);
        setCurrentCategory(null);
        setChildCategories([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [categoryKey, isProbablyId]);

  const shownProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return products;

    return products.filter((product) => {
      const text = `${getTitle(product)} ${getCategory(product)} ${
        product.description || ""
      }`.toLowerCase();

      return text.includes(keyword);
    });
  }, [products, search]);

  const categoryTitle = currentCategory?.name || categoryKey || "Kategori";

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div style={eyebrowStyle}>KATEGORİ</div>

        <h1 style={titleStyle}>{categoryTitle}</h1>

        <p style={descStyle}>
          Bu kategorideki tedarik ürünlerini inceleyin, ürün detaylarına bakın ve
          hızlıca teklif talebi oluşturun.
        </p>

        <div style={searchBoxStyle}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`${categoryTitle} içinde ara...`}
            style={searchInputStyle}
          />

          <button
            type="button"
            onClick={() => {
              if (search.trim()) {
                navigate(`/products?q=${encodeURIComponent(search.trim())}`);
              }
            }}
            style={searchButtonStyle}
          >
            Genel Ara
          </button>
        </div>
      </section>

      {childCategories.length > 0 && (
        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h2 style={sectionTitleStyle}>Alt Kategoriler</h2>
          </div>

          <div style={categoryGridStyle}>
            {childCategories.map((child) => (
              <Link key={child.id} to={`/category/${child.id}`} style={categoryCardStyle}>
                <div style={categoryIconStyle}>{child.name.charAt(0)}</div>
                <strong>{child.name}</strong>
                <span style={mutedTextStyle}>Ürünleri görüntüle</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section style={toolbarStyle}>
        <div>
          <strong>Ürünler</strong>
          <span style={countTextStyle}> {shownProducts.length} ürün</span>
        </div>

        <Link
          to={`/buyer/rfqs/new?category=${encodeURIComponent(categoryTitle)}`}
          style={rfqButtonStyle}
        >
          Bu kategori için teklif iste
        </Link>
      </section>

      {loading ? (
        <div style={emptyStyle}>Yükleniyor...</div>
      ) : shownProducts.length === 0 ? (
        <div style={emptyCardStyle}>
          <h2 style={{ marginTop: 0 }}>Bu kategoride ürün bulunamadı</h2>
          <p style={{ color: "#64748b", lineHeight: 1.7 }}>
            Bu kategoride henüz onaylı ürün bulunmuyor. İsterseniz doğrudan
            teklif talebi oluşturarak tedarikçilerden fiyat alabilirsiniz.
          </p>

          <Link
            to={`/buyer/rfqs/new?category=${encodeURIComponent(categoryTitle)}`}
            style={quoteButtonStyle}
          >
            Teklif Talebi Oluştur
          </Link>
        </div>
      ) : (
        <section style={gridStyle}>
          {shownProducts.map((product) => {
            const image = resolveImage(product);

            return (
              <article key={product.id} style={cardStyle}>
                <Link to={`/product/${product.id}`} style={imageBoxStyle}>
                  {image ? (
                    <img src={image} alt={getTitle(product)} style={imageStyle} />
                  ) : (
                    <div style={placeholderStyle}>
                      <span style={{ fontSize: 42 }}>📦</span>
                      <span>Ürün görseli yok</span>
                    </div>
                  )}
                </Link>

                <div style={cardBodyStyle}>
                  <div style={categoryLabelStyle}>{getCategory(product)}</div>

                  <h3 style={productTitleStyle}>{getTitle(product)}</h3>

                  <p style={productDescStyle}>
                    {product.description || "Toptan alım için uygun ürün."}
                  </p>

                  <div style={priceRowStyle}>
                    <strong style={priceStyle}>{getPrice(product)}</strong>
                    <span style={moqStyle}>
                      MOQ: {product.moq || "-"} {product.unitType || ""}
                    </span>
                  </div>

                  <div style={supplierBadgeStyle}>✔ Doğrulanmış Firma</div>

                  <div style={actionsStyle}>
                    <Link to={`/product/${product.id}`} style={detailButtonStyle}>
                      İncele
                    </Link>

                    <Link
                      to={`/buyer/rfqs/new?productId=${product.id}&product=${encodeURIComponent(
                        getTitle(product)
                      )}`}
                      style={quoteButtonStyle}
                    >
                      Teklif Al
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: 40,
};

const heroStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
  background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
  color: "white",
  borderRadius: 28,
  padding: 32,
  boxShadow: "0 24px 50px rgba(15,23,42,0.18)",
};

const eyebrowStyle: CSSProperties = {
  color: "#93c5fd",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 8,
};

const titleStyle: CSSProperties = {
  fontSize: 42,
  fontWeight: 900,
  margin: "0 0 8px",
};

const descStyle: CSSProperties = {
  color: "#cbd5e1",
  maxWidth: 760,
  lineHeight: 1.7,
  marginBottom: 22,
};

const searchBoxStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  background: "white",
  padding: 8,
  borderRadius: 18,
  maxWidth: 760,
};

const searchInputStyle: CSSProperties = {
  flex: 1,
  border: "none",
  outline: "none",
  padding: "0 14px",
  fontSize: 16,
};

const searchButtonStyle: CSSProperties = {
  border: "none",
  background: "#f97316",
  color: "white",
  padding: "13px 24px",
  borderRadius: 14,
  fontWeight: 900,
  cursor: "pointer",
};

const sectionStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
};

const sectionHeaderStyle: CSSProperties = {
  marginBottom: 14,
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 24,
  color: "#0f172a",
};

const categoryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 14,
};

const categoryCardStyle: CSSProperties = {
  textDecoration: "none",
  background: "white",
  color: "#0f172a",
  border: "1px solid #e5e7eb",
  borderRadius: 18,
  padding: 18,
  boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const categoryIconStyle: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 12,
  background: "#dbeafe",
  color: "#1d4ed8",
  display: "grid",
  placeItems: "center",
  fontWeight: 900,
};

const toolbarStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
};

const countTextStyle: CSSProperties = {
  color: "#64748b",
  fontWeight: 600,
};

const rfqButtonStyle: CSSProperties = {
  textDecoration: "none",
  background: "#16a34a",
  color: "white",
  padding: "11px 16px",
  borderRadius: 12,
  fontWeight: 900,
};

const gridStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 20,
};

const cardStyle: CSSProperties = {
  background: "white",
  borderRadius: 22,
  overflow: "hidden",
  boxShadow: "0 14px 34px rgba(15,23,42,0.10)",
  border: "1px solid #e5e7eb",
};

const imageBoxStyle: CSSProperties = {
  display: "block",
  height: 210,
  background: "#e2e8f0",
  textDecoration: "none",
};

const imageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const placeholderStyle: CSSProperties = {
  height: "100%",
  display: "grid",
  placeItems: "center",
  color: "#64748b",
  fontWeight: 800,
};

const cardBodyStyle: CSSProperties = {
  padding: 18,
};

const categoryLabelStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 8,
};

const productTitleStyle: CSSProperties = {
  minHeight: 52,
  margin: "0 0 10px",
  fontSize: 20,
  color: "#0f172a",
};

const productDescStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 14,
  lineHeight: 1.6,
  minHeight: 44,
};

const priceRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  marginBottom: 12,
};

const priceStyle: CSSProperties = {
  fontSize: 20,
  color: "#0f172a",
};

const moqStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 13,
};

const supplierBadgeStyle: CSSProperties = {
  display: "inline-block",
  background: "#dcfce7",
  color: "#166534",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 12,
};

const actionsStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 6,
};

const detailButtonStyle: CSSProperties = {
  flex: 1,
  textAlign: "center",
  textDecoration: "none",
  background: "#e0f2fe",
  color: "#0369a1",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 900,
};

const quoteButtonStyle: CSSProperties = {
  flex: 1,
  textAlign: "center",
  textDecoration: "none",
  background: "#2563eb",
  color: "white",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 900,
};

const mutedTextStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 13,
};

const emptyStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  color: "#64748b",
};

const emptyCardStyle: CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  background: "white",
  borderRadius: 24,
  padding: 32,
  boxShadow: "0 14px 34px rgba(15,23,42,0.10)",
};