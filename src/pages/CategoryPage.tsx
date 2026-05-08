import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; 

type Product = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  basePrice: string;
  unitType: string;
  moq: number;
  seller?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
};

type Category = {
  id: string;
  name: string;
  parentId?: string | null;
};

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params?.id as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) return;

    const load = async () => {
      try {
        setLoading(true);

        const [productsRes, categoriesRes] = await Promise.all([
          fetch(`https://tedarik-backend.onrender.com/api/products/category/${categoryId}`),
          fetch("https://tedarik-backend.onrender.com/api/categories"),
        ]);

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();

        const safeProducts = Array.isArray(productsData) ? productsData : [];
        const safeCategories = Array.isArray(categoriesData) ? categoriesData : [];

        setProducts(safeProducts);
        setAllCategories(safeCategories);

        const foundCategory =
          safeCategories.find((c: Category) => c.id === categoryId) || null;

        setCurrentCategory(foundCategory);

        const children = safeCategories.filter(
          (c: Category) => c.parentId === categoryId
        );
        setChildCategories(children);
      } catch (error) {
        console.error("CATEGORY PAGE ERROR:", error);
        setProducts([]);
        setAllCategories([]);
        setCurrentCategory(null);
        setChildCategories([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [categoryId]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <section className="mb-10">
        <div className="bg-white rounded-3xl border shadow-sm p-8">
          <p className="text-sm text-blue-600 font-semibold mb-2">
            Kategori
          </p>

          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {currentCategory?.name || "Kategori Ürünleri"}
          </h1>

          <p className="text-gray-600 text-lg">
            Bu kategorideki onaylı tedarik ürünlerini inceleyin, teklif isteyin,
            tedarikçilere doğrudan ulaşın.
          </p>
        </div>
      </section>

      {childCategories.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-5">Alt Kategoriler</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {childCategories.map((child) => (
              <a
                key={child.id}
                href={`/category/${child.id}`}
                className="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition"
              >
                <h3 className="font-bold text-gray-900">{child.name}</h3>
                <p className="text-sm text-gray-500 mt-2">Ürünleri görüntüle</p>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Ürünler</h2>

        <div className="bg-white/10 text-white px-4 py-2 rounded-xl text-sm">
          {products.length} ürün
        </div>
      </section>

      {loading ? (
        <div className="bg-white rounded-2xl p-8">
          <p className="text-gray-700">Yükleniyor...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <p className="text-gray-700">
            Bu kategoride henüz onaylı ürün bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product) => (
            <a
              key={product.id}
              href={`/product/${product.id}`}
              className="bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition"
            >
              {product.imageUrl ? (
                <img
                  src={`https://tedarik-backend.onrender.com${product.imageUrl}`}
                  alt={product.title}
                  className="w-full h-52 object-cover"
                />
              ) : (
                <div className="w-full h-52 bg-gray-100 flex items-center justify-center text-gray-400">
                  Görsel Yok
                </div>
              )}

              <div className="p-5">
                <p className="text-xs font-semibold text-blue-600 mb-2">
                  {product.category?.name || "Kategori"}
                </p>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {product.title}
                </h3>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description || "Ürün açıklaması bulunmuyor."}
                </p>

                <p className="text-lg font-bold text-gray-900">
                  {Number(product.basePrice).toLocaleString("tr-TR")} ₺
                </p>

                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  <p>Birim: {product.unitType}</p>
                  <p>MOQ: {product.moq}</p>
                  <p>Satıcı: {product.seller?.name || "-"}</p>
                </div>

                <div className="mt-4">
                  <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold">
                    Ürünü İncele
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}