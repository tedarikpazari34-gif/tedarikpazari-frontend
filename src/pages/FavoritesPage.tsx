import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";

type ProductImage = {
  url?: string;
  isCover?: boolean;
};

type FavoriteItem = {
  id: string;
  createdAt: string;
  product: {
    id: string;
    title?: string;
    description?: string | null;
    imageUrl?: string | null;
    basePrice?: number | string;
    unitType?: string;
    moq?: number;
    images?: ProductImage[];
    category?: {
      name?: string;
    } | null;
    seller?: {
      name?: string;
      verified?: boolean;
      city?: string | null;
    };
  };
};

const API =
  import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

const BACKEND_ORIGIN = API.replace(/\/api\/?$/, "");

function resolveImageUrl(value?: string | null) {
  if (!value) return "";

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `${BACKEND_ORIGIN}${value.startsWith("/") ? value : `/${value}`}`;
}

function getProductImage(item: FavoriteItem["product"]) {
  const cover = item.images?.find((image) => image.isCover)?.url;
  const first = item.images?.[0]?.url;

  return resolveImageUrl(cover || first || item.imageUrl);
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError("Favorilerinizi görmek için giriş yapmalısınız.");
        setFavorites([]);
        return;
      }

      const res = await fetch(`${API}/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.message || "Favoriler alınamadı.");
        setFavorites([]);
        return;
      }

      setFavorites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("FAVORITES LOAD ERROR:", err);
      setError("Favoriler yüklenirken hata oluştu.");
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const removeFavorite = async (productId: string) => {
    try {
      setRemovingId(productId);

      const res = await fetch(`${API}/favorites/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message || "Favoriden çıkarılamadı.");
        return;
      }

      setFavorites((items) =>
        items.filter((item) => item.product.id !== productId)
      );
    } catch (err) {
      console.error("FAVORITE REMOVE ERROR:", err);
      alert("Favoriden çıkarılırken hata oluştu.");
    } finally {
      setRemovingId("");
    }
  };

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div style={eyebrowStyle}>ALICI PANELİ</div>
        <h1 style={titleStyle}>Favorilerim</h1>
        <p style={descriptionStyle}>
          Daha sonra incelemek istediğiniz ürünleri burada saklayabilirsiniz.
        </p>
      </section>

      {loading ? (
        <div style={stateCardStyle}>Favoriler yükleniyor...</div>
      ) : error ? (
        <div style={stateCardStyle}>
          <h2 style={{ marginTop: 0 }}>Favoriler görüntülenemedi</h2>
          <p>{error}</p>
          <Link to="/login" style={primaryLinkStyle}>
            Giriş Yap
          </Link>
        </div>
      ) : favorites.length === 0 ? (
        <div style={stateCardStyle}>
          <div style={{ fontSize: 48 }}>♡</div>
          <h2>Henüz favori ürününüz yok</h2>
          <p style={{ color: "#64748b" }}>
            Ürün kartlarındaki kalp simgesine dokunarak ürünleri kaydedin.
          </p>
          <Link to="/products" style={primaryLinkStyle}>
            Ürünleri İncele
          </Link>
        </div>
      ) : (
        <section style={gridStyle}>
          {favorites.map((favorite) => {
            const product = favorite.product;
            const image = getProductImage(product);

            return (
              <article key={favorite.id} style={cardStyle}>
                <Link to={`/product/${product.id}`} style={imageLinkStyle}>
                  {image ? (
                    <img
                      src={image}
                      alt={product.title || "Ürün"}
                      style={imageStyle}
                    />
                  ) : (
                    <div style={placeholderStyle}>📦</div>
                  )}
                </Link>

                <div style={bodyStyle}>
                  <div style={categoryStyle}>
                    {product.category?.name || "Ürün"}
                  </div>

                  <h2 style={productTitleStyle}>
                    {product.title || "Ürün"}
                  </h2>

                  <p style={productDescriptionStyle}>
                    {product.description ||
                      "Ürün detaylarını görüntülemek için karta tıklayın."}
                  </p>

                  <div style={sellerStyle}>
                    {product.seller?.verified ? "✓ " : ""}
                    {product.seller?.name || "Tedarikçi"}
                    {product.seller?.city
                      ? ` · ${product.seller.city}`
                      : ""}
                  </div>

                  <div style={priceRowStyle}>
                    <strong style={priceStyle}>
                      {Number(product.basePrice || 0).toLocaleString("tr-TR")} ₺
                    </strong>

                    <span style={moqStyle}>
                      Min. {product.moq || 1} {product.unitType || "adet"}
                    </span>
                  </div>

                  <div style={actionsStyle}>
                    <Link
                      to={`/product/${product.id}`}
                      style={detailButtonStyle}
                    >
                      İncele
                    </Link>

                    <button
                      type="button"
                      onClick={() => removeFavorite(product.id)}
                      disabled={removingId === product.id}
                      style={{
                        ...removeButtonStyle,
                        opacity: removingId === product.id ? 0.6 : 1,
                      }}
                    >
                      {removingId === product.id
                        ? "Çıkarılıyor..."
                        : "♥️ Favoriden Çıkar"}
                    </button>
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
  padding: "40px 20px 60px",
  background: "#f8fafc",
};

const heroStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
  padding: 32,
  borderRadius: 28,
  color: "#ffffff",
  background: "linear-gradient(135deg, #0f172a, #7c3aed)",
  boxShadow: "0 24px 50px rgba(15,23,42,0.18)",
};

const eyebrowStyle: CSSProperties = {
  color: "#ddd6fe",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 1.2,
};

const titleStyle: CSSProperties = {
  margin: "8px 0",
  fontSize: "clamp(34px, 5vw, 48px)",
};

const descriptionStyle: CSSProperties = {
  margin: 0,
  color: "#ede9fe",
};

const gridStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
  gap: 20,
};

const cardStyle: CSSProperties = {
  overflow: "hidden",
  borderRadius: 22,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  boxShadow: "0 14px 34px rgba(15,23,42,0.08)",
};

const imageLinkStyle: CSSProperties = {
  display: "block",
  height: 210,
  background: "#e2e8f0",
};

const imageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const placeholderStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "grid",
  placeItems: "center",
  fontSize: 48,
};

const bodyStyle: CSSProperties = {
  padding: 18,
};

const categoryStyle: CSSProperties = {
  color: "#7c3aed",
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
};

const productTitleStyle: CSSProperties = {
  margin: "8px 0",
  color: "#0f172a",
  fontSize: 21,
};

const productDescriptionStyle: CSSProperties = {
  minHeight: 44,
  margin: 0,
  color: "#64748b",
  lineHeight: 1.5,
  fontSize: 14,
};

const sellerStyle: CSSProperties = {
  marginTop: 14,
  color: "#475569",
  fontSize: 13,
  fontWeight: 700,
};

const priceRowStyle: CSSProperties = {
  marginTop: 16,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 12,
};

const priceStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 20,
};

const moqStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 12,
  textAlign: "right",
};

const actionsStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 18,
};

const detailButtonStyle: CSSProperties = {
  flex: 1,
  padding: "11px 12px",
  borderRadius: 11,
  textAlign: "center",
  textDecoration: "none",
  background: "#ede9fe",
  color: "#6d28d9",
  fontWeight: 900,
};

const removeButtonStyle: CSSProperties = {
  flex: 1,
  border: 0,
  padding: "11px 12px",
  borderRadius: 11,
  background: "#fee2e2",
  color: "#be123c",
  fontWeight: 900,
  cursor: "pointer",
};

const stateCardStyle: CSSProperties = {
  maxWidth: 760,
  margin: "30px auto",
  padding: 36,
  borderRadius: 22,
  textAlign: "center",
  background: "#ffffff",
  boxShadow: "0 18px 42px rgba(15,23,42,0.08)",
};

const primaryLinkStyle: CSSProperties = {
  display: "inline-block",
  marginTop: 12,
  padding: "12px 18px",
  borderRadius: 11,
  background: "#7c3aed",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 900,
};
