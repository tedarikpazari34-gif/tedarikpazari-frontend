import { useEffect, useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';

const API = 'https://tedarik-backend.onrender.com/api';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  async function loadProducts() {
    try {
      const res = await fetch(`${API}/admin/products/pending`, {
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
          Bekleyen Ürünler
        </h1>

        {loading ? (
          <div>Yükleniyor...</div>
        ) : products.length === 0 ? (
          <div>Bekleyen ürün yok</div>
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

                <button
                  onClick={() => approveProduct(product.id)}
                  style={{
                    marginTop: 20,
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}