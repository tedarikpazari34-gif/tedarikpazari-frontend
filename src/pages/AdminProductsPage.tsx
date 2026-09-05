import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminSidebar from '../components/admin/AdminSidebar';

const API = 'https://tedarik-backend.onrender.com/api';

export default function AdminProductsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";

  const [products, setProducts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deactivatingId, setDeactivatingId] = useState('');

  const token = localStorage.getItem('token');

  async function loadProducts() {
    try {
      const res = await fetch(`${API}/admin/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
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