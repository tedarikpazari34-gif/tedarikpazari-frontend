import { useEffect, useState, type CSSProperties } from "react";
import SellerLayout from "../components/SellerLayout";

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
  const [basePrice, setBasePrice] = useState("");

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch(`${BASE_URL}/api/categories/tree`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setCategories(data);
        }
      } catch (err) {
        console.error("Kategori yüklenemedi:", err);
      }
    }

    loadCategories();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      const withCover = images.map((img: any, index: number) => ({
        ...img,
        isCover: index === 0,
      }));

      setUploadedImages(withCover);
      setMessage("Fotoğraflar başarıyla yüklendi");
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      setError("Fotoğraf yüklenirken hata oluştu");
      setUploadedImages([]);
    } finally {
      setUploading(false);
    }
  };

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
        uploadedImages.find((img) => img.isCover)?.url || uploadedImages[0]?.url;

      const createRes = await fetch(`${BASE_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          categoryId,
          unitType: "adet",
          moq: 1,
          basePrice: Number(basePrice),
          leadTimeDays: 3,
          stockType: "STOCK",
          vatRate: 20,
          rfqEnabled: true,
          imageUrl: coverImage,
        }),
      });

      const createdProduct = await createRes.json();

      if (!createRes.ok) {
        setError(createdProduct?.message || "Ürün oluşturulamadı");
        return;
      }

      if (uploadedImages.length > 0) {
        await fetch(`${BASE_URL}/api/products/${createdProduct.id}/images`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            images: uploadedImages,
          }),
        });
      }

      setMessage("Ürün başarıyla oluşturuldu");

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
    <SellerLayout title="Yeni Ürün Ekle">
      <main style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>Yeni Ürün Ekle</h1>

          <p style={subtitleStyle}>
            Satışa sunacağınız ürün bilgilerini girin.
          </p>

          {message && <div style={successStyle}>{message}</div>}
          {error && <div style={errorStyle}>{error}</div>}

          <form onSubmit={handleCreateProduct} style={formStyle}>
            <div style={gridStyle}>
              <input
                placeholder="Ürün adı"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={inputStyle}
                required
              />

              <input
                placeholder="Fiyat"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                style={inputStyle}
                required
              />

              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={inputStyle}
                required
              >
                <option value="">Kategori seç</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                type="file"
                multiple
                onChange={handleFileChange}
                style={inputStyle}
              />
            </div>

            <textarea
              placeholder="Ürün açıklaması"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={textareaStyle}
            />

            {selectedFileNames.length > 0 && (
              <div style={fileBoxStyle}>
                {selectedFileNames.map((name, i) => (
                  <div key={i}>📷 {name}</div>
                ))}
              </div>
            )}

            {uploadedImages.length > 0 && (
              <div style={imageGridStyle}>
                {uploadedImages.map((img, i) => (
                  <img
                    key={i}
                    src={`${BASE_URL}${img.url}`}
                    style={imageStyle}
                  />
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={saving || uploading}
              style={{
                ...buttonStyle,
                opacity: saving || uploading ? 0.7 : 1,
                cursor: saving || uploading ? "not-allowed" : "pointer",
              }}
            >
              {uploading
                ? "Fotoğraflar yükleniyor..."
                : saving
                ? "Kaydediliyor..."
                : "Ürünü Kaydet"}
            </button>
          </form>
        </div>
      </main>
    </SellerLayout>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f1f5f9",
  padding: "20px 0",
};

const cardStyle: CSSProperties = {
  maxWidth: 1000,
  margin: "0 auto",
  background: "#ffffff",
  borderRadius: 24,
  padding: 40,
  boxShadow: "0 20px 50px rgba(15,23,42,0.12)",
};

const titleStyle: CSSProperties = {
  fontSize: 38,
  fontWeight: 800,
  marginBottom: 10,
  color: "#0f172a",
};

const subtitleStyle: CSSProperties = {
  color: "#64748b",
  marginBottom: 30,
};

const formStyle: CSSProperties = {
  background: "#f8fafc",
  padding: 24,
  borderRadius: 20,
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
  marginBottom: 20,
};

const inputStyle: CSSProperties = {
  width: "100%",
  height: 52,
  border: "1px solid #cbd5e1",
  borderRadius: 12,
  padding: "0 16px",
  fontSize: 15,
  boxSizing: "border-box",
  background: "#fff",
};

const textareaStyle: CSSProperties = {
  width: "100%",
  minHeight: 140,
  border: "1px solid #cbd5e1",
  borderRadius: 12,
  padding: 16,
  fontSize: 15,
  boxSizing: "border-box",
  marginBottom: 20,
  resize: "vertical",
};

const buttonStyle: CSSProperties = {
  width: "100%",
  height: 54,
  border: "none",
  borderRadius: 14,
  background: "#2563eb",
  color: "#fff",
  fontSize: 16,
  fontWeight: 700,
};

const successStyle: CSSProperties = {
  background: "#dcfce7",
  color: "#166534",
  padding: 14,
  borderRadius: 12,
  marginBottom: 16,
};

const errorStyle: CSSProperties = {
  background: "#fee2e2",
  color: "#991b1b",
  padding: 14,
  borderRadius: 12,
  marginBottom: 16,
};

const imageGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
  gap: 16,
  marginBottom: 20,
};

const imageStyle: CSSProperties = {
  width: "100%",
  height: 180,
  objectFit: "cover",
  borderRadius: 14,
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
};

const fileBoxStyle: CSSProperties = {
  background: "#e2e8f0",
  padding: 16,
  borderRadius: 12,
  marginBottom: 20,
};