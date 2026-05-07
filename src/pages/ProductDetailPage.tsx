import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
type ProductImage = {
  id: string;
  url: string;
  sortOrder: number;
  isCover: boolean;
};

type Product = {
  id: string;
  title: string;
  imageUrl?: string | null;
  description?: string | null;
  unitType: string;
  moq: number;
  basePrice: string;
  leadTimeDays?: number | null;
  stockType?: string | null;
  vatRate?: number | null;
  rfqEnabled: boolean;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
  category?: {
    id: string;
    name: string;
  };
  images?: ProductImage[];
};

function getCategoryIcon(categoryName?: string) {
  if (!categoryName) return "📦";
  const name = categoryName.toLowerCase();

  if (name.includes("elektrik") || name.includes("aydınlatma")) return "💡";
  if (name.includes("temizlik") || name.includes("hijyen") || name.includes("kağıt")) return "🧴";
  if (name.includes("gıda") || name.includes("kahve") || name.includes("horeca")) return "☕";
  if (name.includes("otomotiv") || name.includes("fren") || name.includes("motor")) return "🚗";
  if (name.includes("vida") || name.includes("alet") || name.includes("hırdavat")) return "🔩";

  return "📦";
}

function resolveImageUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `http://https://tedarik-backend.onrender.com${url}`;
}

export default function ProductDetailPage() {
  const params = useParams();
  const navigate = useNavigate();

  const productId = Array.isArray(params?.id)
    ? params.id[0]
    : (params?.id as string);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mainImageError, setMainImageError] = useState(false);
  const [thumbErrors, setThumbErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!productId) return;

    const loadProduct = async () => {
      try {
        setLoading(true);

        const res = await fetch(`http://https://tedarik-backend.onrender.com/api/products/${productId}`);
        const data = await res.json();

        if (!res.ok) {
          setProduct(null);
          return;
        }

        setProduct(data);
      } catch (error) {
        console.error("PRODUCT DETAIL ERROR:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const galleryImages = useMemo(() => {
    if (!product) return [];

    const imageSet = new Set<string>();

    if (product.imageUrl) imageSet.add(product.imageUrl);

    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (img?.url) imageSet.add(img.url);
      });
    }

    return Array.from(imageSet);
  }, [product]);

  useEffect(() => {
    if (galleryImages.length > 0) {
      setSelectedImage(galleryImages[0]);
      setMainImageError(false);
    } else {
      setSelectedImage(null);
      setMainImageError(false);
    }
  }, [galleryImages]);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-white rounded-3xl p-8 shadow-sm border">
          <p className="text-gray-700">Ürün yükleniyor...</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-white rounded-3xl p-8 shadow-sm border">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Ürün bulunamadı
          </h1>
          <p className="text-gray-600">
            Bu ürün yayında olmayabilir veya kaldırılmış olabilir.
          </p>
        </div>
      </main>
    );
  }

  const icon = getCategoryIcon(product.category?.name);
  const mainImageUrl = resolveImageUrl(selectedImage);

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <section className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
            {mainImageUrl && !mainImageError ? (
              <img
                src={mainImageUrl}
                alt={product.title}
                className="w-full h-[420px] object-cover"
                onError={() => setMainImageError(true)}
              />
            ) : (
              <div className="w-full h-[420px] bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-500">
                <div className="text-7xl mb-3">{icon}</div>
                <div className="text-lg font-medium">Test Görseli Yok</div>
              </div>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {galleryImages.map((img, index) => {
                const thumbUrl = resolveImageUrl(img);
                const thumbKey = `${img}-${index}`;

                return (
                  <button
                    key={thumbKey}
                    type="button"
                    onClick={() => {
                      setSelectedImage(img);
                      setMainImageError(false);
                    }}
                    className={`rounded-2xl overflow-hidden border-2 bg-white ${
                      selectedImage === img ? "border-blue-600" : "border-gray-200"
                    }`}
                  >
                    {thumbUrl && !thumbErrors[thumbKey] ? (
                      <img
                        src={thumbUrl}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-24 object-cover"
                        onError={() =>
                          setThumbErrors((prev) => ({
                            ...prev,
                            [thumbKey]: true,
                          }))
                        }
                      />
                    ) : (
                      <div className="w-full h-24 flex items-center justify-center bg-gray-100 text-2xl">
                        {icon}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border shadow-sm p-8">
          <p className="text-sm font-semibold text-blue-600 mb-2">
            {product.category?.name || "Kategori"}
          </p>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
              ✔ Verified Supplier
            </span>

            {product.rfqEnabled && (
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                RFQ Uygun
              </span>
            )}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {product.title}
          </h1>

          <p className="text-gray-600 text-lg mb-6">
            {product.description || "Bu ürün için açıklama eklenmemiş."}
          </p>

          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Başlangıç fiyatı</p>
            <p className="text-3xl font-bold text-blue-600">
              {Number(product.basePrice).toLocaleString("tr-TR")} ₺
            </p>
            <p className="text-sm text-gray-500 mt-1">/ {product.unitType}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <InfoBox label="Birim" value={product.unitType} />
            <InfoBox label="MOQ" value={product.moq} />
            <InfoBox
              label="Teslim süresi"
              value={product.leadTimeDays ? `${product.leadTimeDays} gün` : "-"}
            />
            <InfoBox label="Stok tipi" value={product.stockType || "-"} />
            <InfoBox
              label="KDV"
              value={
                product.vatRate !== null && product.vatRate !== undefined
                  ? `%${product.vatRate}`
                  : "-"
              }
            />
            <InfoBox label="Tedarikçi" value="Verified Supplier" green />
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
            <p className="text-sm text-blue-700 font-semibold mb-2">
              Platform Güvenceli Tedarik
            </p>
            <p className="text-sm text-gray-700">
              Tedarikçi bilgileri, platform dışı iletişimi önlemek ve güvenli
              ticaret akışını korumak amacıyla sipariş veya teklif sürecine kadar
              gizlenir.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => {
                if (!product.rfqEnabled) return;
                navigate(`/buyer/rfqs/new?productId=${product.id}`);
              }}
              className={`px-6 py-3 rounded-2xl font-semibold transition ${
                product.rfqEnabled
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!product.rfqEnabled}
            >
              {product.rfqEnabled ? "Teklif İste (RFQ)" : "RFQ Kapalı"}
            </button>

            <Link
              to={product.category?.id ? `/category/${product.category.id}` : "/"}
              className="px-6 py-3 rounded-2xl border font-semibold text-gray-800 hover:bg-gray-50 transition"
            >
              Kategoriye Dön
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoBox({
  label,
  value,
  green,
}: {
  label: string;
  value: string | number;
  green?: boolean;
}) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`font-bold ${green ? "text-green-600" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}