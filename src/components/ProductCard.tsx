import React from "react";

type Product = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string | null;
  basePrice: number | string;
  moq: number;
  unitType: string;
  leadTimeDays?: number | null;
  images?: {
    url: string;
  }[];
  seller?: {
    id: string;
    name: string;
    verified?: boolean;
    status?: string;
  };
  category?: {
    id: string;
    name: string;
  };
};

type Props = {
  product: Product;
  onRFQ: () => void;
  onDetail: (product: Product) => void;
};

export default function ProductCard({ product, onRFQ, onDetail }: Props) {
  const imageSrc =
    product.images && product.images.length > 0
      ? product.images[0].url.startsWith("http")
        ? product.images[0].url
        : `http://localhost:3002${product.images[0].url}`
      : product.imageUrl
      ? product.imageUrl.startsWith("http")
        ? product.imageUrl
        : `http://localhost:3002${product.imageUrl}`
      : "https://placehold.co/300x200?text=No+Image";

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          width: "100%",
          height: 180,
          background: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <img
          src={imageSrc}
          alt={product.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      <div style={{ padding: 16 }}>
        {product.category?.name && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#4f46e5",
              marginBottom: 8,
            }}
          >
            {product.category.name}
          </div>
        )}

        <h3
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 800,
            color: "#111827",
            marginBottom: 10,
          }}
        >
          {product.title}
        </h3>

        <p
          style={{
            margin: 0,
            color: "#4b5563",
            fontSize: 14,
            lineHeight: 1.5,
            minHeight: 48,
            marginBottom: 14,
          }}
        >
          {product.description || "Açıklama yok"}
        </p>

        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#111827",
            marginBottom: 10,
          }}
        >
          {product.basePrice} ₺
        </div>

        <div
          style={{
            fontSize: 14,
            color: "#4b5563",
            marginBottom: 6,
          }}
        >
          <strong>MOQ:</strong> {product.moq} {product.unitType}
        </div>

        <div
          style={{
            fontSize: 14,
            color: "#4b5563",
            marginBottom: 6,
          }}
        >
          <strong>Birim:</strong> {product.unitType}
        </div>

        <div
          style={{
            fontSize: 14,
            color: "#4b5563",
            marginBottom: 6,
          }}
        >
          <strong>Teslim Süresi:</strong> {product.leadTimeDays || "-"} gün
        </div>

        <div
          style={{
            fontSize: 14,
            color: "#4b5563",
            marginBottom: 6,
          }}
        >
          <strong>Satıcı:</strong> Onaylı Tedarikçi
        </div>

        {product.seller?.verified && (
          <div
            style={{
              color: "#16a34a",
              fontWeight: 700,
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            ✔ Onaylı Tedarikçi
          </div>
        )}

        {!product.seller?.verified && <div style={{ marginBottom: 16 }} />}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => onDetail(product)}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #d1d5db",
              background: "#ffffff",
              color: "#111827",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Detay
          </button>

          <button
            onClick={onRFQ}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 10,
              border: "none",
              background: "#111827",
              color: "#ffffff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            RFQ Gönder
          </button>
        </div>
      </div>
    </div>
  );
}