import { useEffect, useState, type CSSProperties } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API = "https://tedarik-backend.onrender.com/api";

type Product = {
  id: string;
  title?: string;
  name?: string;
  price?: number | string;
  basePrice?: number | string;
  imageUrl?: string;
  categoryName?: string;
};

export default function ProductsPage() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch(`${API}/products`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const filtered = q
          ? list.filter((p: Product) =>
              `${p.title || p.name || ""} ${p.categoryName || ""}`
                .toLowerCase()
                .includes(q.toLowerCase())
            )
          : list;

        setProducts(filtered);
      })
      .catch(console.error);
  }, [q]);

  return (
    <main style={page}>
      <h1 style={title}>Ürünler</h1>
      <p style={desc}>
        Tedarik ürünlerini inceleyin, detaylara bakın ve teklif talebi oluşturun.
      </p>

      <div style={grid}>
        {products.map((p) => (
          <div key={p.id} style={card}>
            <div style={imageBox}>
              {p.imageUrl ? (
                <img
                  src={
                    p.imageUrl.startsWith("http")
                      ? p.imageUrl
                      : `https://tedarik-backend.onrender.com${p.imageUrl}`
                  }
                  style={img}
                />
              ) : (
                <div style={placeholder}>Ürün</div>
              )}
            </div>

            <div style={{ padding: 18 }}>
              <div style={category}>{p.categoryName || "Kategori"}</div>
              <h3 style={productTitle}>{p.title || p.name || "Ürün"}</h3>

              <strong>
                {Number(p.price || p.basePrice || 0).toLocaleString("tr-TR")} ₺
              </strong>

              <div style={actions}>
                <Link to={`/product/${p.id}`} style={detailBtn}>
                  İncele
                </Link>

                <Link
                  to={`/buyer/rfqs/new?productId=${p.id}`}
                  style={quoteBtn}
                >
                  Teklif Al
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div style={empty}>Henüz ürün bulunamadı.</div>
      )}
    </main>
  );
}

const page: CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: 40,
};

const title: CSSProperties = {
  fontSize: 36,
  fontWeight: 900,
  marginBottom: 8,
};

const desc: CSSProperties = {
  color: "#64748b",
  marginBottom: 28,
};

const grid: CSSProperties = {
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

const imageBox: CSSProperties = {
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
  fontWeight: 800,
  marginBottom: 8,
};

const productTitle: CSSProperties = {
  margin: "0 0 12px",
  fontSize: 20,
};

const actions: CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 16,
};

const detailBtn: CSSProperties = {
  textDecoration: "none",
  background: "#e0f2fe",
  color: "#0369a1",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 800,
};

const quoteBtn: CSSProperties = {
  textDecoration: "none",
  background: "#2563eb",
  color: "white",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 800,
};

const empty: CSSProperties = {
  marginTop: 24,
  color: "#64748b",
};