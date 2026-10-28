import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminProductRevisions from '../components/admin/AdminProductRevisions';

const API = 'https://tedarik-backend.onrender.com/api';

export default function AdminProductsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";

  const [products, setProducts] = useState<any[]>([]);
  const [stockOnlyCritical, setStockOnlyCritical] = useState(true);
  const [stockLoadError, setStockLoadError] = useState("");
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deactivatingId, setDeactivatingId] = useState('');

  const token = localStorage.getItem('token');

  async function loadProducts() {
    try {
      setStockLoadError("");
      const res = await fetch(`${API}/admin/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !Array.isArray(data)) {
        throw new Error("Admin ürün ve stok bilgileri yüklenemedi.");
      }
      setProducts(data);
    } catch (err) {
      console.error(err);
      setStockLoadError(
        err instanceof Error ? err.message : "Stok bilgileri alınamadı."
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadReports() {
    try {
      const res = await fetch(`${API}/admin/product-reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => []);

      setReports(res.ok && Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("PRODUCT REPORTS ERROR:", err);
      setReports([]);
    }
  }

  async function deactivateProduct(id: string) {
    if (!window.confirm(t("adminProductsPage.deactivateConfirm"))) {
      return;
    }

    try {
      setDeactivatingId(id);

      const res = await fetch(`${API}/admin/products/${id}/deactivate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message || t("adminProductsPage.deactivateFailed"));
        return;
      }

      loadProducts();
      loadReports();
    } catch (err) {
      console.error(err);
      alert(t("adminProductsPage.deactivateError"));
    } finally {
      setDeactivatingId('');
    }
  }

  async function approveProduct(id: string) {
    try {
      await fetch(`${API}/admin/products/${id}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      loadProducts();
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadProducts();
    loadReports();
  }, []);

  type StockRow = {
    key: string;
    productName: string;
    itemName: string;
    sellerName: string;
    stock: number;
    reserved: number;
    available: number;
    threshold: number;
    critical: boolean;
  };

  const stockRows: StockRow[] = products.flatMap((product: any) => {
    const rows: StockRow[] = [];

    if (!product.isActive || !product.isApproved) return rows;

    const addRow = (
      key: string,
      itemName: string,
      item: any
    ) => {
      if (
        item.stockQuantity == null ||
        item.minStockThreshold == null
      ) return;

      const stock = Number(item.stockQuantity);
      const reserved = Number(item.reservedQuantity ?? 0);
      const threshold = Number(item.minStockThreshold);

      if (
        !Number.isFinite(stock) ||
        !Number.isFinite(reserved) ||
        !Number.isFinite(threshold)
      ) return;

      const available = Math.max(0, stock - reserved);

      rows.push({
        key,
        productName: product.title,
        itemName,
        sellerName: product.seller?.name || "Satıcı belirtilmemiş",
        stock,
        reserved,
        available,
        threshold,
        critical: available <= threshold,
      });
    };

    addRow(product.id, "Ürün stoğu", product);

    for (const variant of product.variants ?? []) {
      if (!variant.isActive) continue;
      addRow(
        `${product.id}-${variant.id}`,
        `Varyant: ${variant.name}`,
        variant
      );
    }

    return rows;
  });

  const criticalStockCount = stockRows.filter(
    (row) => row.critical
  ).length;

  const visibleStockRows = stockOnlyCritical
    ? stockRows.filter((row) => row.critical)
    : stockRows;

  return (
    <div
      style={{
        display: 'flex',
        background: '#f4f7fb',
      }}
    >
      <AdminSidebar />

      <div
        style={{
          flex: 1,
          minHeight: '100vh',
          padding: 40,
        }}
      >
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 30,
          }}
        >
          {t("adminProductsPage.title")}
        </h1>

        <section style={{
          background: "#ffffff",
          border: "1px solid #99f6e4",
          borderRadius: 16,
          padding: 22,
          marginBottom: 30,
        }}>
          <h2 style={{ marginTop: 0, color: "#0f766e" }}>
            Kritik Stok Takibi
          </h2>

          <p style={{ color: "#475569" }}>
            Aktif ve onaylı ürünler için tanımlanmış stok
            eşikleri izlenir. Kullanılabilir stok,
            toplam stoktan rezervasyonların düşülmesiyle hesaplanır.
          </p>

          <div style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 18,
          }}>
            <strong>
              Kritik: {criticalStockCount}
            </strong>
            <span>
              Eşik tanımlı ürün/varyant: {stockRows.length}
            </span>
          </div>

          <label style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
          }}>
            <input
              type="checkbox"
              checked={stockOnlyCritical}
              onChange={(e) => setStockOnlyCritical(e.target.checked)}
            />
            Yalnızca kritik stokları göster
          </label>

          {loading ? (
            <p>Stok bilgileri yükleniyor...</p>
          ) : stockLoadError ? (
            <p role="alert" style={{ color: "#b91c1c" }}>
              {stockLoadError}
            </p>
          ) : visibleStockRows.length === 0 ? (
            <p style={{ color: "#64748b" }}>
              {stockOnlyCritical
                ? "Kritik seviyede stok bulunmuyor."
                : "Stok eşiği tanımlanmış aktif ürün bulunmuyor."}
            </p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {visibleStockRows.map((row) => (
                <div key={row.key} style={{
                  border: row.critical
                    ? "1px solid #fca5a5"
                    : "1px solid #cbd5e1",
                  borderRadius: 12,
                  padding: 14,
                  background: row.critical ? "#fff7f7" : "#f8fafc",
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}>
                    <strong>{row.productName} — {row.itemName}</strong>
                    <strong style={{
                      color: row.critical ? "#b91c1c" : "#166534",
                    }}>
                      {row.critical ? "Kritik stok" : "Normal stok"}
                    </strong>
                  </div>

                  <div style={{
                    marginTop: 8,
                    color: "#475569",
                    fontSize: 13,
                  }}>
                    Satıcı: {row.sellerName}
                  </div>

                  <div style={{
                    marginTop: 8,
                    display: "flex",
                    gap: 14,
                    flexWrap: "wrap",
                    fontSize: 13,
                  }}>
                    <span>Toplam: {row.stock}</span>
                    <span>Rezerve: {row.reserved}</span>
                    <strong>Kullanılabilir: {row.available}</strong>
                    <span>Kritik eşik: {row.threshold}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <AdminProductRevisions />

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 24, marginBottom: 18 }}>
            {t("adminProductsPage.reportedProducts")}
          </h2>

          {reports.length === 0 ? (
            <div
              style={{
                background: '#fff',
                padding: 20,
                borderRadius: 14,
                color: '#64748b',
              }}
            >
              {t("adminProductsPage.noReports")}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {reports.map((report) => (
                <div
                  key={report.id}
                  style={{
                    background: '#fff7ed',
                    border: '1px solid #fed7aa',
                    borderRadius: 16,
                    padding: 20,
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 18 }}>
                    {report.product?.title ||
                      t("adminProductsPage.productFallback")}
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <strong>{t("adminProductsPage.reportReason")}</strong>{" "}
                    {report.reason}
                  </div>

                  {report.note && (
                    <div style={{ marginTop: 8 }}>
                      <strong>{t("adminProductsPage.description")}</strong>{" "}
                      {report.note}
                    </div>
                  )}

                  <div style={{ marginTop: 8, color: '#64748b' }}>
                    {new Date(report.createdAt).toLocaleString(locale)}
                  </div>

                  {report.product?.isActive !== false ? (
                    <button
                      onClick={() => deactivateProduct(report.product.id)}
                      disabled={deactivatingId === report.product?.id}
                      style={{
                        marginTop: 16,
                        background: '#dc2626',
                        color: '#fff',
                        border: 'none',
                        padding: '11px 16px',
                        borderRadius: 10,
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      {deactivatingId === report.product?.id
                        ? t("adminProductsPage.processing")
                        : t("adminProductsPage.deactivateProduct")}
                    </button>
                  ) : (
                    <div
                      style={{
                        marginTop: 14,
                        color: '#64748b',
                        fontWeight: 700,
                      }}
                    >
                      {t("adminProductsPage.alreadyInactive")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {loading ? (
          <div>{t("adminProductsPage.loading")}</div>
        ) : products.length === 0 ? (
          <div>{t("adminProductsPage.noProducts")}</div>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: 20,
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  padding: 24,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                }}
              >
                <h2>{product.title}</h2>

<p>{product.description}</p>

<div style={{ marginTop: 10 }}>
  <strong>{t("adminProductsPage.price")}</strong>{" "}
  {Number(product.basePrice || 0).toLocaleString(locale)} ₺
</div>

<div style={{ marginTop: 10 }}>
  <strong>{t("adminProductsPage.seller")}</strong>{" "}
  {product.seller?.name || "-"}
</div>

                <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                  {!product.isApproved && (
                    <button
                      onClick={() => approveProduct(product.id)}
                      style={{
                        background: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        padding: '12px 18px',
                        borderRadius: 10,
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      {t("adminProductsPage.approveProduct")}
                    </button>
                  )}

                  {product.isActive ? (
                    <button
                      onClick={() => deactivateProduct(product.id)}
                      disabled={deactivatingId === product.id}
                      style={{
                        background: '#dc2626',
                        color: '#fff',
                        border: 'none',
                        padding: '12px 18px',
                        borderRadius: 10,
                        cursor: 'pointer',
                        fontWeight: 600,
                        opacity: deactivatingId === product.id ? 0.6 : 1,
                      }}
                    >
                      {deactivatingId === product.id
                        ? t("adminProductsPage.processing")
                        : t("adminProductsPage.deactivate")}
                    </button>
                  ) : (
                    <span style={{ color: '#64748b', fontWeight: 700 }}>
                      {t("adminProductsPage.inactive")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}