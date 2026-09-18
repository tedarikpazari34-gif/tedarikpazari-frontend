import { useEffect, useState, type CSSProperties } from "react";
import SellerLayout from "../components/SellerLayout";
import { useTranslation } from "react-i18next";
import { unitLabel } from "../lib/unitLabel";

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
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE" | "APPROVED" | "PENDING"
  >("ALL");

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError(t("sellerProductsPage.loginAgain"));
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
        setError(data?.message || t("sellerProductsPage.loadFailed"));
        setProducts([]);
        return;
      }

      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("SELLER PRODUCTS ERROR:", err);
      setError(t("sellerProductsPage.loadError"));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase(locale);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !normalizedSearch ||
      product.title?.toLocaleLowerCase(locale).includes(normalizedSearch) ||
      product.description?.toLocaleLowerCase(locale).includes(normalizedSearch) ||
      product.category?.name
        ?.toLocaleLowerCase(locale)
        .includes(normalizedSearch);

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && product.isActive) ||
      (statusFilter === "INACTIVE" && !product.isActive) ||
      (statusFilter === "APPROVED" && product.isApproved) ||
      (statusFilter === "PENDING" && !product.isApproved);

    return matchesSearch && matchesStatus;
  });

  const toggleProductActive = async (product: Product) => {
    const nextActive = !product.isActive;

    const confirmed = window.confirm(
      nextActive
        ? `"${product.title}" ürününü yeniden yayına almak istiyor musunuz?`
        : `"${product.title}" ürününü yayından kaldırmak istiyor musunuz?`
    );

    if (!confirmed) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setError(t("sellerProductsPage.loginAgain"));
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/products/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: nextActive,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Ürün durumu değiştirilemedi.");
        return;
      }

      await loadProducts();
    } catch (err) {
      console.error("PRODUCT ACTIVE STATUS ERROR:", err);
      setError("Ürün durumu değiştirilirken bir hata oluştu.");
    }
  };

  return (
    <SellerLayout title={t("sellerProductsPage.title")}>
      <main style={pageStyle}>
        <div style={headerStyle}>
          <div>
            <p
              style={{
                ...subtitleStyle,
                marginTop: 0,
              }}
            >
              {t("sellerProductsPage.description")}
            </p>
          </div>

          <a href="/seller/products/new" style={addButtonStyle}>
            {t("sellerProductsPage.newProduct")}
          </a>
        </div>

        {loading && (
          <div style={infoBoxStyle}>{t("sellerProductsPage.loading")}</div>
        )}

        {!loading && error && <div style={errorBoxStyle}>{error}</div>}

        {!loading && !error && products.length === 0 && (
          <div style={emptyStyle}>
            <h2 style={{ marginTop: 0 }}>
              {t("sellerProductsPage.emptyTitle")}
            </h2>
            <p>{t("sellerProductsPage.emptyText")}</p>
            <a href="/seller/products/new" style={addButtonStyle}>
              {t("sellerProductsPage.addFirstProduct")}
            </a>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <section style={productToolsStyle}>
              <div style={productSearchRowStyle}>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ürün adı, kategori veya açıklama ara..."
                  aria-label="Ürünlerde ara"
                  style={productSearchInputStyle}
                />

                <strong style={productResultCountStyle}>
                  {filteredProducts.length} / {products.length} ürün
                </strong>
              </div>

              <div style={productFilterRowStyle}>
                {[
                  ["ALL", "Tümü"],
                  ["ACTIVE", "Aktif"],
                  ["INACTIVE", "Pasif"],
                  ["APPROVED", "Onaylı"],
                  ["PENDING", "Onay Bekleyen"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setStatusFilter(
                        value as
                          | "ALL"
                          | "ACTIVE"
                          | "INACTIVE"
                          | "APPROVED"
                          | "PENDING"
                      )
                    }
                    aria-pressed={statusFilter === value}
                    style={{
                      ...productFilterButtonStyle,
                      ...(statusFilter === value
                        ? productFilterButtonActiveStyle
                        : {}),
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </section>

            {filteredProducts.length === 0 && (
              <div style={filteredEmptyStyle}>
                <strong style={filteredEmptyTitleStyle}>
                  Ürün bulunamadı
                </strong>
                <p style={filteredEmptyTextStyle}>
                  Aramanıza veya seçtiğiniz filtreye uygun ürün bulunamadı.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("ALL");
                  }}
                  style={clearFiltersButtonStyle}
                >
                  Filtreleri Temizle
                </button>
              </div>
            )}

          <div style={gridStyle}>
            {filteredProducts.map((product) => (
              <article key={product.id} style={cardStyle}>
                <div style={imageWrapStyle}>
                  {product.imageUrl ? (
                    <img
                      src={
                        product.imageUrl.startsWith("http")
                          ? product.imageUrl
                          : `${BASE_URL}${product.imageUrl}`
                      }
                      alt={product.title}
                      style={imageStyle}
                    />
                  ) : (
                    <div style={imagePlaceholderStyle}>
                      {t("sellerProductsPage.noImage")}
                    </div>
                  )}


                </div>

                <div style={contentStyle}>
                  <div style={categoryStyle}>
                    {product.category?.name || t("sellerProductsPage.noCategory")}
                  </div>

                  <h2 style={productTitleStyle}>{product.title}</h2>

                  <p style={descriptionStyle}>
                    {product.description || t("sellerProductsPage.noDescription")}
                  </p>

                  <div style={priceStyle}>
                    <div>
                      {Number(product.basePrice || 0).toLocaleString(locale)} ₺
                      <span
                        style={{
                          marginLeft: 6,
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#64748b",
                        }}
                      >
                        / {unitLabel(product.unitType, t)}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#64748b",
                      }}
                    >
                      KDV dahil birim fiyat
                    </div>
                  </div>

                  <div style={detailsGridStyle}>
                    <Info
                      label="Minimum Sipariş"
                      value={`${product.moq} ${unitLabel(product.unitType, t)}`}
                    />

                    <Info
                      label="Kargoya Hazırlama"
                      value={`${product.leadTimeDays} iş günü`}
                    />

                    <Info
                      label="Stok Durumu"
                      value={
                        product.stockType === "STOCK"
                          ? "Stoktan Teslim"
                          : "Sipariş Üzerine"
                      }
                    />

                    <Info
                      label={t("sellerProductsPage.vat")}
                      value={`%${product.vatRate}`}
                    />
                  </div>

                  <div style={badgeRowStyle}>
                    <span
                      style={{
                        ...smallBadgeStyle,
                        ...(product.isApproved
                          ? approvedBadgeStyle
                          : pendingBadgeStyle),
                      }}
                    >
                      {product.isApproved
                        ? `✓ ${t("sellerProductsPage.approved")}`
                        : `⏳ ${t("sellerProductsPage.pendingApproval")}`}
                    </span>

                    <span
                      style={{
                        ...smallBadgeStyle,
                        background: product.isActive ? "#dcfce7" : "#f1f5f9",
                        color: product.isActive ? "#166534" : "#475569",
                      }}
                    >
                      {product.isActive
                        ? `● ${t("sellerProductsPage.active")}`
                        : `○ ${t("sellerProductsPage.inactive")}`}
                    </span>
                  </div>

                  <div style={actionsStyle}>
                    <div style={primaryActionsStyle}>
                      <a
                        href={`/seller/products/${product.id}/edit`}
                        style={editButtonStyle}
                        aria-label={`${product.title} ürününü düzenle`}
                      >
                        Düzenle
                      </a>

                      <a
                        href={`/product/${product.id}`}
                        style={viewButtonStyle}
                        aria-label={`${product.title} ürününü görüntüle`}
                      >
                        Görüntüle
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleProductActive(product)}
                      aria-label={
                        product.isActive
                          ? `${product.title} ürününü yayından kaldır`
                          : `${product.title} ürününü yeniden yayınla`
                      }
                      style={
                        product.isActive
                          ? deactivateButtonStyle
                          : activateButtonStyle
                      }
                    >
                      {product.isActive
                        ? "Yayından Kaldır"
                        : "Yeniden Yayınla"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          </>
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
  whiteSpace: "nowrap",
  flexShrink: 0,
  fontSize: 14,
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
  height: 180,
  background: "#e2e8f0",
};

const imageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  background: "#ffffff",
};

const imagePlaceholderStyle: CSSProperties = {
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#64748b",
  fontWeight: 800,
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
  flexDirection: "column",
  gap: 10,
};

const primaryActionsStyle: CSSProperties = {
  display: "flex",
  gap: 10,
};

const editButtonStyle: CSSProperties = {
  flex: 1,
  textAlign: "center",
  background: "#2563eb",
  color: "white",
  textDecoration: "none",
  padding: "12px 10px",
  borderRadius: 12,
  fontWeight: 800,
  fontSize: 13,
};

const viewButtonStyle: CSSProperties = {
  flex: 1,
  textAlign: "center",
  background: "#0f172a",
  color: "white",
  textDecoration: "none",
  padding: "12px 10px",
  borderRadius: 12,
  fontWeight: 800,
  fontSize: 13,
};

const deactivateButtonStyle: CSSProperties = {
  width: "100%",
  border: "1px solid #fecaca",
  background: "#fff7f7",
  color: "#b91c1c",
  padding: "11px 14px",
  borderRadius: 12,
  fontWeight: 800,
  cursor: "pointer",
};

const activateButtonStyle: CSSProperties = {
  width: "100%",
  border: "1px solid #bbf7d0",
  background: "#f0fdf4",
  color: "#166534",
  padding: "11px 14px",
  borderRadius: 12,
  fontWeight: 800,
  cursor: "pointer",
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

const productToolsStyle: CSSProperties = {
  marginBottom: 18,
  padding: 14,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
};

const productSearchRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const productSearchInputStyle: CSSProperties = {
  flex: "1 1 260px",
  minWidth: 0,
  height: 44,
  padding: "0 14px",
  border: "1px solid #cbd5e1",
  borderRadius: 12,
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 14,
  outline: "none",
};

const productResultCountStyle: CSSProperties = {
  whiteSpace: "nowrap",
  color: "#64748b",
  fontSize: 13,
  fontWeight: 800,
};

const productFilterRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 12,
};

const productFilterButtonStyle: CSSProperties = {
  minHeight: 36,
  padding: "7px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: 999,
  background: "#ffffff",
  color: "#475569",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
};

const productFilterButtonActiveStyle: CSSProperties = {
  background: "#0f172a",
  borderColor: "#0f172a",
  color: "#ffffff",
};

const filteredEmptyStyle: CSSProperties = {
  padding: "36px 20px",
  marginBottom: 18,
  textAlign: "center",
  background: "#ffffff",
  border: "1px dashed #cbd5e1",
  borderRadius: 16,
};

const filteredEmptyTitleStyle: CSSProperties = {
  display: "block",
  marginBottom: 8,
  color: "#0f172a",
  fontSize: 17,
  fontWeight: 800,
};

const filteredEmptyTextStyle: CSSProperties = {
  margin: "0 0 16px",
  color: "#64748b",
  fontSize: 14,
  lineHeight: 1.6,
};

const clearFiltersButtonStyle: CSSProperties = {
  minHeight: 40,
  padding: "8px 15px",
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
};
