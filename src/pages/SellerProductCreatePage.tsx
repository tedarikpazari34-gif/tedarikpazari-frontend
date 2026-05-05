import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:3002";

type Category = {
  id: string;
  name: string;
  parentId?: string | null;
};

type UploadedImage = {
  url: string;
  sortOrder: number;
  isCover: boolean;
};
export default function SellerProductCreatePage() {

  const [categories, setCategories] = useState<Category[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [unitType, setUnitType] = useState("adet");
  const [moq, setMoq] = useState("1");
  const [basePrice, setBasePrice] = useState("");

  const [leadTimeDays, setLeadTimeDays] = useState("3");
  const [stockType, setStockType] = useState("STOCK");
  const [vatRate, setVatRate] = useState("20");

  const [rfqEnabled, setRfqEnabled] = useState(true);

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ✅ CATEGORY LOAD
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/categories/tree`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setCategories(data);
        }
      } catch (err) {
        console.error("Kategori yüklenemedi:", err);
      }
    };

    loadCategories();
  }, []);

  // ✅ FILE UPLOAD
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError("");
    setMessage("");
    setUploading(true);

    const fileArray = Array.from(files);
    setSelectedFileNames(fileArray.map((file) => file.name));

    try {
      const formData = new FormData();

      fileArray.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch(`${BASE_URL}/api/upload/multiple`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Dosyalar yüklenemedi");
        setUploadedImages([]);
        return;
      }

      const images = Array.isArray(data?.images) ? data.images : [];

      // ✅ ilk görsel kapak olsun
      const withCover = images.map((img: any, index: number) => ({
        ...img,
        isCover: index === 0,
      }));

      setUploadedImages(withCover);
      setMessage("Fotoğraflar yüklendi");
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      setError("Fotoğraflar yüklenirken hata oluştu");
      setUploadedImages([]);
    } finally {
      setUploading(false);
    }
  };

  // ✅ CREATE PRODUCT
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Lütfen giriş yapın");
        return;
      }

      const coverImage =
        uploadedImages.find((img) => img.isCover)?.url ||
        uploadedImages[0]?.url;

      // 1️⃣ PRODUCT CREATE
      const createRes = await fetch(`${BASE_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          categoryId: categoryId || undefined,
          unitType,
          moq: Number(moq),
          basePrice: String(basePrice),
          leadTimeDays: Number(leadTimeDays),
          stockType,
          vatRate: Number(vatRate),
          rfqEnabled,
          imageUrl: coverImage,
        }),
      });

      const createdProduct = await createRes.json();

      if (!createRes.ok) {
        setError(createdProduct?.message || "Ürün oluşturulamadı");
        return;
      }

      // 2️⃣ IMAGES EKLE
      if (uploadedImages.length > 0) {
        await fetch(
          `${BASE_URL}/api/products/${createdProduct.id}/images`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              images: uploadedImages,
            }),
          }
        );
      }

      setMessage("✅ Ürün başarıyla oluşturuldu");

      // reset
      setTitle("");
      setDescription("");
      setCategoryId("");
      setBasePrice("");
      setUploadedImages([]);
      setSelectedFileNames([]);
    } catch (err) {
      console.error("CREATE ERROR:", err);
      setError("Ürün oluşturulurken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="bg-white rounded-3xl shadow p-8">
        <h1 className="text-3xl font-bold mb-6">Yeni Ürün Ekle</h1>

        {message && <div className="text-green-600 mb-4">{message}</div>}
        {error && <div className="text-red-600 mb-4">{error}</div>}

        <form onSubmit={handleCreateProduct} className="space-y-5">

          <input
            placeholder="Ürün adı"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-3 rounded-xl"
            required
          />

          <textarea
            placeholder="Açıklama"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-3 rounded-xl"
          />

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border p-3 rounded-xl"
            required
          >
            <option value="">Kategori seç</option>
            {categories
              .filter((c) => c.parentId)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>

          <input
            placeholder="Fiyat"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            className="w-full border p-3 rounded-xl"
            required
          />

          <input
            type="file"
            multiple
            onChange={handleFileChange}
          />

          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {uploadedImages.map((img, i) => (
                <img
                  key={i}
                  src={`${BASE_URL}${img.url}`}
                  className="h-24 object-cover rounded"
                />
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || uploading}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </form>
      </div>
    </main>
  );
}