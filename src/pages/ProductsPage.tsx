import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const API = "http://localhost:3002/api";
const BASE_URL = "http://localhost:3002";

type ProductImageObject = {
  url?: string;
  imageUrl?: string;
};

type Product = {
  id: string;
  title?: string;
  name?: string;
  price?: number | string;
  basePrice?: number | string;
  imageUrl?: string;
  thumbnail?: string;
  images?: Array<string | ProductImageObject>;
  categoryName?: string;
  category?: string | { name?: string } | null;
};

function getProductTitle(product: Product) {
  return product.title || product.name || "Ürün";
}

function getCategory(product: Product) {
  if (product.categoryName) return product.categoryName;

  if (typeof product.category === "string") return product.category;

  if (product.category && typeof product.category === "object") {
    return product.category.name || "Kategori";
  }

  return "Kategori";
}

function getImage(product: Product) {
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

function getPrice(product: Product) {
  const value = product.price ?? product.basePrice;

  if (value === undefined || value === null || value === "") {
    return "Teklif Al";
  }

  const numeric = Number(value);

  if (Number.isNaN(numeric)) {
    return String(value);
  }

  return `${numeric.toLocaleString("tr-TR")} ₺`;
}

export default function ProductsPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const q = params.get("q") || "";

  const [search, setSearch] = useState(q);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minMoq, setMinMoq] = useState("");
  const [city, setCity] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);  
  useEffect(() => {
    setSearch(q);
  }, [q]);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);

        const query = new URLSearchParams();

if (q) query.set("q", q);
if (minPrice) query.set("minPrice", minPrice);
if (maxPrice) query.set("maxPrice", maxPrice);
if (minMoq) query.set("minMoq", minMoq);
if (city) query.set("city", city);
if (verifiedOnly) query.set("verified", "true");

const res = await fetch(`${API}/products?${query.toString()}`);
        const data = await res.json();

        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("PRODUCTS LOAD ERROR:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [q, minPrice, maxPrice, minMoq, city, verifiedOnly]);

  const filteredProducts = useMemo(() => {
  return products;
}, [products]);

  const handleSearch = () => {
    const keyword = search.trim();

    if (!keyword) {
      navigate("/products");
      return;
    }

    navigate(`/products?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <main style={page}>
      <section style={hero}>
        <div>
          <div style={eyebrow}>TEDARİK PAZARI</div>
          <h1 style={title}>Ürün keşfet</h1>
          <p style={desc}>
            Tedarik ürünlerini inceleyin, fiyatları karşılaştırın ve tek tıkla
            teklif talebi oluşturun.
          </p>
        </div>

        <div style={searchBox}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            placeholder="Ürün ara... örn: koli, ampul, eldiven"
            style={searchInput}
          />

          <button onClick={handleSearch} style={searchButton}>
            Ara
          </button>
        </div>
      </section>
      <section style={filterPanel}>
  <input
    value={minPrice}
    onChange={(e) => setMinPrice(e.target.value)}
    placeholder="Min fiyat"
    style={filterInput}
  />

  <input
    value={maxPrice}
    onChange={(e) => setMaxPrice(e.target.value)}
    placeholder="Max fiyat"
    style={filterInput}
  />

  <input
    value={minMoq}
    onChange={(e) => setMinMoq(e.target.value)}
    placeholder="Min MOQ"
    style={filterInput}
  />

  <input
    value={city}
    onChange={(e) => setCity(e.target.value)}
    placeholder="Şehir"
    style={filterInput}
  />

  <label style={checkLabel}>
    <input
      type="checkbox"
      checked={verifiedOnly}
      onChange={(e) => setVerifiedOnly(e.target.checked)}
    />
    Onaylı tedarikçi
  </label>
</section>
      <section style={toolbar}>
        <div>
          <strong>
            {q ? `"${q}" için sonuçlar` : "Tüm ürünler"}
          </strong>
          <span style={countText}> {filteredProducts.length} ürün</span>
        </div>

        <Link to="/buyer/rfqs/new" style={rfqButton}>
          Toplu Teklif Talebi Oluştur
        </Link>
      </section>

      {loading ? (
        <div style={empty}>Ürünler yükleniyor...</div>
      ) : filteredProducts.length === 0 ? (
        <div style={emptyCard}>
          <h2 style={{ marginTop: 0 }}>Ürün bulunamadı</h2>
          <p style={{ color: "#64748b" }}>
            Farklı bir kelime deneyin veya doğrudan teklif talebi oluşturun.
          </p>
          <Link to="/buyer/rfqs/new" style={quoteBtn}>
            Teklif Talebi Oluştur
          </Link>
        </div>
      ) : (
        <div style={grid}>
          {filteredProducts.map((product) => {
            const image = getImage(product);

            return (
              <div key={product.id} style={card}>
                <Link to={`/product/${product.id}`} style={imageLink}>
                  {image ? (
                    <img src={image} style={img} alt={getProductTitle(product)} />
                  ) : (
                    <div style={placeholder}>
                      <span style={{ fontSize: 42 }}>📦</span>
                      <span>Ürün görseli yok</span>
                    </div>
                  )}
                </Link>

                <div style={{ padding: 18 }}>
                  <div style={category}>{getCategory(product)}</div>

                  <h3 style={productTitle}>{getProductTitle(product)}</h3>

                  <div style={supplierBadge}>✔ Verified Supplier</div>

                  <div style={priceRow}>
                    <strong style={priceText}>{getPrice(product)}</strong>
                    <span style={moqText}>Toptan alım</span>
                  </div>

                  <div style={actions}>
                    <Link to={`/product/${product.id}`} style={detailBtn}>
                      İncele
                    </Link>

                    <Link
                      to={`/buyer/rfqs/new?productId=${product.id}&product=${encodeURIComponent(
                        getProductTitle(product)
                      )}`}
                      style={quoteBtn}
                    >
                      Teklif Al
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

const page: CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: 40,
};

const hero: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
  background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
  color: "white",
  borderRadius: 28,
  padding: 32,
  boxShadow: "0 24px 50px rgba(15,23,42,0.18)",
};

const eyebrow: CSSProperties = {
  color: "#93c5fd",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 8,
};

const title: CSSProperties = {
  fontSize: 42,
  fontWeight: 900,
  margin: "0 0 8px",
};

const desc: CSSProperties = {
  color: "#cbd5e1",
  maxWidth: 720,
  lineHeight: 1.7,
  marginBottom: 22,
};

const searchBox: CSSProperties = {
  display: "flex",
  gap: 10,
  background: "white",
  padding: 8,
  borderRadius: 18,
  maxWidth: 760,
};

const searchInput: CSSProperties = {
  flex: 1,
  border: "none",
  outline: "none",
  padding: "0 14px",
  fontSize: 16,
};

const searchButton: CSSProperties = {
  border: "none",
  background: "#f97316",
  color: "white",
  padding: "13px 28px",
  borderRadius: 14,
  fontWeight: 900,
  cursor: "pointer",
};

const toolbar: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
};

const countText: CSSProperties = {
  color: "#64748b",
  fontWeight: 600,
};

const grid: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 20,
};

const card: CSSProperties = {
  background: "white",
  borderRadius: 22,
  overflow: "hidden",
  boxShadow: "0 14px 34px rgba(15,23,42,0.10)",
  border: "1px solid #e5e7eb",
};

const imageLink: CSSProperties = {
  display: "block",
  height: 210,
  background: "#e2e8f0",
};

const img: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const placeholder: CSSProperties = {
  height: "100%",
  display: "grid",
  placeItems: "center",
  color: "#64748b",
  fontWeight: 800,
};

const category: CSSProperties = {
  color: "#2563eb",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 8,
};

const productTitle: CSSProperties = {
  minHeight: 52,
  margin: "0 0 10px",
  fontSize: 20,
  color: "#0f172a",
};

const supplierBadge: CSSProperties = {
  display: "inline-block",
  background: "#dcfce7",
  color: "#166534",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 12,
};

const priceRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
};

const priceText: CSSProperties = {
  fontSize: 20,
  color: "#0f172a",
};

const moqText: CSSProperties = {
  color: "#64748b",
  fontSize: 13,
};

const actions: CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 16,
};

const detailBtn: CSSProperties = {
  flex: 1,
  textAlign: "center",
  textDecoration: "none",
  background: "#e0f2fe",
  color: "#0369a1",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 900,
};

const quoteBtn: CSSProperties = {
  flex: 1,
  textAlign: "center",
  textDecoration: "none",
  background: "#2563eb",
  color: "white",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 900,
};

const rfqButton: CSSProperties = {
  textDecoration: "none",
  background: "#16a34a",
  color: "white",
  padding: "11px 16px",
  borderRadius: 12,
  fontWeight: 900,
};

const empty: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  color: "#64748b",
};

const emptyCard: CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  background: "white",
  borderRadius: 24,
  padding: 32,
  boxShadow: "0 14px 34px rgba(15,23,42,0.10)",
};
const filterPanel: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 20,
  padding: 16,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 12,
  boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
};

const filterInput: CSSProperties = {
  height: 44,
  border: "1px solid #cbd5e1",
  borderRadius: 12,
  padding: "0 12px",
  fontSize: 14,
};

const checkLabel: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 800,
  color: "#334155",
};