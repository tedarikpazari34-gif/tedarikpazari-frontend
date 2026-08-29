import { useEffect, useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';

const API = 'https://tedarik-backend.onrender.com/api';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
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

  async function deactivateProduct(id: string) {
    if (!window.confirm("Bu ürünü pasife almak istediğinize emin misiniz?")) {
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
        alert(data?.message || "Ürün pasife alınamadı.");
        return;
      }

      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Ürün pasife alınırken hata oluştu.");
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
          Ürün Yönetimi
        </h1>

        {loading ? (
          <div>Yükleniyor...</div>
        ) : products.length === 0 ? (
          <div>Ürün bulunamadı</div>
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
  <strong>Fiyat:</strong> {product.basePrice} ₺
</div>

<div style={{ marginTop: 10 }}>
  <strong>Satıcı:</strong>{' '}
  {product.seller?.name || '-'}
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
                      Ürünü Onayla
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
                      {deactivatingId === product.id ? 'İşleniyor...' : 'Pasife Al'}
                    </button>
                  ) : (
                    <span style={{ color: '#64748b', fontWeight: 700 }}>
                      Pasif
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