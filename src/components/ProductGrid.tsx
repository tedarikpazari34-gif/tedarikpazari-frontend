import React from "react";

interface Product {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string | null;
  basePrice: number | string;
  moq: number;
  unitType: string;
}

interface Props {
  products: Product[];
  onSelectProduct?: (product: Product) => void;
  onOpenRfq?: (product: Product) => void;
}

export default function ProductGrid({
  products,
  onSelectProduct,
  onOpenRfq,
}: Props) {
  if (!products || products.length === 0) {
    return (
      <div style={{ marginTop: 20, opacity: 0.7 }}>
        Ürün bulunamadı
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24 }}>
      <h2 style={{ marginBottom: 16 }}>Ürünler</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
          gap: 16,
        }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <img
              src={p.imageUrl || "https://picsum.photos/400"}
              alt={p.title}
              style={{
                width: "100%",
                height: 170,
                objectFit: "cover",
                background: "#f3f4f6",
              }}
            />

            <div style={{ padding: 14, display: "grid", gap: 8 }}>
              <h4 style={{ margin: 0, fontSize: 16 }}>{p.title}</h4>

              <div
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  minHeight: 36,
                  lineHeight: 1.4,
                }}
               >
                {p.description || "Açıklama yok"}
              </div>

              <div style={{ fontSize: 14, color: "#6b7280" }}>
                MOQ: {p.moq} {p.unitType}
              </div>

              <div style={{ fontWeight: 700, fontSize: 18 }}>
                {p.basePrice} ₺
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button
                  onClick={() => onSelectProduct?.(p)}
                  style={secondaryButton}
                >
                  Detay
                </button>

                <button
                  onClick={() => onOpenRfq?.(p)}
                  style={primaryButton}
                >
                  RFQ Gönder
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const primaryButton: React.CSSProperties = {
  flex: 1,
  background: "#111827",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 12px",
  cursor: "pointer",
  fontWeight: 700,
};

const secondaryButton: React.CSSProperties = {
  flex: 1,
  background: "#fff",
  color: "#111827",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  padding: "10px 12px",
  cursor: "pointer",
  fontWeight: 600,
};