import React, { useState } from "react";

interface Category {
  id: string;
  name: string;
  children?: Category[];
}

interface Props {
  categories: Category[];
  onCreated?: () => void;
}

export default function ProductCreateForm({
  categories,
  onCreated,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [basePrice, setBasePrice] = useState(0);
  const [moq, setMoq] = useState(1);
  const [unitType, setUnitType] = useState("adet");
  const [stockType, setStockType] = useState("STOCK");
  const [vatRate, setVatRate] = useState(20);
  const [leadTimeDays, setLeadTimeDays] = useState(3);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  const flatCategories = categories.flatMap((parent) =>
    parent.children && parent.children.length > 0
      ? parent.children
      : [parent]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      let uploadedImageUrl = "";

      if (image) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", image);

        const uploadRes = await fetch("http://localhost:3002/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          alert("Görsel yükleme hatası: " + JSON.stringify(uploadData));
          return;
        }

        uploadedImageUrl = uploadData.imageUrl || "";
      }

      const res = await fetch("http://localhost:3002/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          title,
          description,
          categoryId,
          imageUrl: uploadedImageUrl || null,
          basePrice: Number(basePrice),
          moq: Number(moq),
          unitType,
          stockType,
          vatRate: Number(vatRate),
          leadTimeDays: Number(leadTimeDays),
          rfqEnabled: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(JSON.stringify(data));
        return;
      }

      const product = data;

      if (uploadedImageUrl) {
        const imageRes = await fetch(
          `http://localhost:3002/api/products/${product.id}/images`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
            body: JSON.stringify({
              images: [
                {
                  url: uploadedImageUrl,
                  sortOrder: 0,
                  isCover: true,
                },
              ],
            }),
          }
        );

        const imageData = await imageRes.json();

        if (!imageRes.ok) {
          alert(
            "Ürün oluştu ama görsel eklenemedi: " + JSON.stringify(imageData)
          );
          return;
        }
      }

      alert("Ürün oluşturuldu");

      setTitle("");
      setDescription("");
      setCategoryId("");
      setBasePrice(0);
      setMoq(1);
      setUnitType("adet");
      setStockType("STOCK");
      setVatRate(20);
      setLeadTimeDays(3);
      setImage(null);

      onCreated?.();
    } catch (error) {
      console.error(error);
      alert("Ürün oluşturma hatası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
      }}
    >
      <h2 style={{ marginTop: 0 }}>Yeni Ürün Ekle</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: 12 }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ürün adı"
            style={inputStyle}
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Açıklama"
            style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
          />

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            style={inputStyle}
          >
            <option value="">Kategori seç</option>
            {flatCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(Number(e.target.value))}
            placeholder="Fiyat"
            style={inputStyle}
          />

          <input
            type="number"
            value={moq}
            onChange={(e) => setMoq(Number(e.target.value))}
            placeholder="MOQ"
            style={inputStyle}
          />

          <input
            value={unitType}
            onChange={(e) => setUnitType(e.target.value)}
            placeholder="Birim tipi"
            style={inputStyle}
          />

          <select
            value={stockType}
            onChange={(e) => setStockType(e.target.value)}
            style={inputStyle}
          >
            <option value="STOCK">STOCK</option>
            <option value="MAKE_TO_ORDER">MAKE_TO_ORDER</option>
          </select>

          <input
            type="number"
            value={vatRate}
            onChange={(e) => setVatRate(Number(e.target.value))}
            placeholder="KDV oranı"
            style={inputStyle}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />

          <input
            type="number"
            value={leadTimeDays}
            onChange={(e) => setLeadTimeDays(Number(e.target.value))}
            placeholder="Teslim süresi"
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#111827",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 14px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            {loading ? "Kaydediliyor..." : "Ürün Oluştur"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 8,
  padding: "10px 12px",
  outline: "none",
  width: "100%",
};