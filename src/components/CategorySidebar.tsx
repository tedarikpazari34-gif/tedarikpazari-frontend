import React from "react";
import { useTranslation } from "react-i18next";

interface Category {
  id: string;
  name: string;
  parentId?: string | null;
  children?: Category[];
}

interface Props {
  categories: Category[];
  selectedCategory: string | null;
  loadProducts: (categoryId?: string, q?: string) => void;
  sidebarStyle: React.CSSProperties;
}

export default function CategorySidebar({
  categories,
  selectedCategory,
  loadProducts,
  sidebarStyle,
}: Props) {
  const { t } = useTranslation();

  return (
    <div style={sidebarStyle}>
      <h3 style={{ marginTop: 0 }}>{t("categorySidebar.title")}</h3>

      {categories.map((parent) => (
        <div key={parent.id} style={{ marginBottom: 16 }}>
          <div
            style={{
              fontWeight: 700,
              marginBottom: 8,
              color: "#111827",
            }}
          >
            {parent.name}
          </div>

          {parent.children && parent.children.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {parent.children.map((child) => {
                const isSelected = selectedCategory === child.id;

                return (
                  <button
                    key={child.id}
                    onClick={() => loadProducts(child.id)}
                    style={{
                      textAlign: "left",
                      border: isSelected
                        ? "1px solid #1d4ed8"
                        : "1px solid #d1d5db",
                      background: isSelected ? "#dbeafe" : "#f9fafb",
                      color: "#111827",
                      borderRadius: 8,
                      padding: "8px 10px",
                      cursor: "pointer",
                      fontWeight: isSelected ? 700 : 500,
                    }}
                  >
                    {child.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <button
              onClick={() => loadProducts(parent.id)}
              style={{
                textAlign: "left",
                border:
                  selectedCategory === parent.id
                    ? "1px solid #1d4ed8"
                    : "1px solid #d1d5db",
                background:
                  selectedCategory === parent.id ? "#dbeafe" : "#f9fafb",
                color: "#111827",
                borderRadius: 8,
                padding: "8px 10px",
                cursor: "pointer",
                fontWeight: selectedCategory === parent.id ? 700 : 500,
                width: "100%",
              }}
            >
              {t("categorySidebar.showProducts")}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}