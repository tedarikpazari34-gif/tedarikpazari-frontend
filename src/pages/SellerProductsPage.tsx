import { useEffect, useState } from "react";

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

const TEST_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1icnNjemMwMDA2amZ2eWJmcmw2NGF5IiwidXNlcklkIjoiY21tYnJzY3pjMDAwNmpmdnliZnJsNjRheSIsImVtYWlsIjoic2VsbGVyQHRlc3QuY29tIiwiY29tcGFueUlkIjoiY21tYnJzY3o4MDAwMmpmdnlzYjc3bm5hciIsInJvbGUiOiJTRUxMRVIiLCJjb21wYW55U3RhdHVzIjoiQVBQUk9WRUQiLCJpYXQiOjE3NzMyNjIwNzIsImV4cCI6MTc3Mzg2Njg3Mn0.C83EfSHk15qFLXTs7NMZ2GIzY2WGtHoOqmhZwvsIlu0";

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token") || TEST_TOKEN;

      const res = await fetch("https://tedarik-backend.onrender.com/api/products/mine", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Ürünler yüklenemedi");
        setProducts([]);
        return;
      }

      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("SELLER PRODUCTS ERROR:", err);
      setError("Ürünler alınırken hata oluştu");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white">Ürünlerim</h1>
          <p className="text-gray-300 mt-2">
            Satıcı hesabınıza ait ürünleri buradan görüntüleyin.
          </p>
        </div>

        <a
          href="/seller/products/new"
          className="bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-blue-700"
        >
          Yeni Ürün Ekle
        </a>
      </div>

      {loading && <p className="text-white text-lg">Yükleniyor...</p>}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 mb-6">
          {error}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <p className="text-gray-700 text-lg">Henüz ürününüz yok.</p>
        </div>
      )}

      <div className="grid gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                {product.imageUrl && (
                  <img
                    src={`https://tedarik-backend.onrender.com${product.imageUrl}`}
                    alt={product.title}
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                )}

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {product.title}
                </h2>

                <div className="space-y-2 text-gray-800">
                  <p>
                    <strong>Kategori:</strong>{" "}
                    {product.category?.name || "-"}
                  </p>
                  <p>
                    <strong>Fiyat:</strong>{" "}
                    {Number(product.basePrice).toLocaleString("tr-TR")} ₺
                  </p>
                  <p>
                    <strong>Birim:</strong> {product.unitType}
                  </p>
                  <p>
                    <strong>MOQ:</strong> {product.moq}
                  </p>
                  <p>
                    <strong>Tedarik Süresi:</strong> {product.leadTimeDays} gün
                  </p>
                  <p>
                    <strong>Stok Tipi:</strong> {product.stockType}
                  </p>
                  <p>
                    <strong>KDV:</strong> %{product.vatRate}
                  </p>
                  <p>
                    <strong>Oluşturulma:</strong>{" "}
                    {new Date(product.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              </div>

              <div className="min-w-[220px] space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Onay Durumu
                  </p>
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                      product.isApproved
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {product.isApproved ? "APPROVED" : "PENDING APPROVAL"}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    RFQ Durumu
                  </p>
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                      product.rfqEnabled
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {product.rfqEnabled ? "RFQ AÇIK" : "RFQ KAPALI"}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Aktivasyon
                  </p>
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                      product.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.isActive ? "AKTİF" : "PASİF"}
                  </span>
                </div>

                <div className="pt-2">
                  <a
                    href={`/product/${product.id}`}
                    className="inline-block bg-gray-900 text-white px-4 py-2 rounded-xl font-semibold hover:bg-black"
                  >
                    Ürünü Gör
                  </a>
                </div>
              </div>
            </div>

            {product.description && (
              <div className="mt-5 border-t pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Açıklama
                </p>
                <p className="text-gray-800">{product.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}