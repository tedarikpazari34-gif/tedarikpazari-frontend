import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const API =
  import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

type Category = {
  id: string;
  name: string;
  parentId?: string | null;
};

export default function AllCategoriesPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en" : "tr";

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch(`${API}/categories`);
        const data = await res.json();

        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("CATEGORY LOAD ERROR:", err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  const roots = categories
    .filter((category) => !category.parentId)
    .filter((category) =>
      category.name.toLowerCase().includes(search.trim().toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name, locale));

  const getChildCount = (id: string) =>
    categories.filter((category) => category.parentId === id).length;

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div style={eyebrowStyle}>{t("allCategoriesPage.eyebrow")}</div>

        <h1 style={titleStyle}>
          {t("allCategoriesPage.title")}
        </h1>

        <p style={descStyle}>
          {t("allCategoriesPage.description")}
        </p>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("allCategoriesPage.searchPlaceholder")}
          style={searchStyle}
        />
      </section>

      {loading ? (
        <div style={emptyStyle}>{t("allCategoriesPage.loading")}</div>
      ) : (
        <section style={gridStyle}>
          {roots.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              style={cardStyle}
            >
              <div style={iconStyle}>
                {category.name.charAt(0)}
              </div>

              <div>
                <h2 style={categoryTitleStyle}>{category.name}</h2>

                <p style={categoryDescStyle}>
                  {getChildCount(category.id) > 0
                    ? t("allCategoriesPage.subcategoryCount", {
                        count: getChildCount(category.id),
                      })
                    : t("allCategoriesPage.browseCategory")}
                </p>
              </div>

              <span style={arrowStyle}>→</span>
            </Link>
          ))}
        </section>
      )}

      {!loading && roots.length === 0 && (
        <div style={emptyStyle}>{t("allCategoriesPage.notFound")}</div>
      )}

      <section style={ctaStyle}>
        <div>
          <div style={ctaEyebrowStyle}>
            {t("allCategoriesPage.ctaEyebrow")}
          </div>
          <h2 style={ctaTitleStyle}>
            {t("allCategoriesPage.ctaTitle")}
          </h2>
          <p style={ctaTextStyle}>
            {t("allCategoriesPage.ctaText")}
          </p>
        </div>

        <Link to="/buyer/rfqs/new" style={ctaButtonStyle}>
          {t("allCategoriesPage.createRequest")}
        </Link>
      </section>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: "36px 20px 64px",
};

const heroStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 30px",
  padding: "36px",
  borderRadius: 28,
  color: "white",
  background: "linear-gradient(135deg,#020617,#1e3a8a)",
};

const eyebrowStyle: CSSProperties = {
  color: "#93c5fd",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 10,
};

const titleStyle: CSSProperties = {
  margin: "0 0 14px",
  fontSize: "clamp(30px,5vw,46px)",
  lineHeight: 1.1,
};

const descStyle: CSSProperties = {
  maxWidth: 800,
  color: "#cbd5e1",
  lineHeight: 1.7,
  marginBottom: 22,
};

const searchStyle: CSSProperties = {
  width: "100%",
  maxWidth: 520,
  padding: "14px 16px",
  borderRadius: 14,
  border: "none",
  fontSize: 16,
  boxSizing: "border-box",
};

const gridStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
  gap: 16,
};

const cardStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "52px 1fr auto",
  alignItems: "center",
  gap: 14,
  padding: 20,
  background: "white",
  color: "#0f172a",
  borderRadius: 18,
  border: "1px solid #e2e8f0",
  textDecoration: "none",
  boxShadow: "0 10px 26px rgba(15,23,42,0.06)",
};

const iconStyle: CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: 15,
  display: "grid",
  placeItems: "center",
  background: "#eff6ff",
  color: "#2563eb",
  fontSize: 22,
  fontWeight: 900,
};

const categoryTitleStyle: CSSProperties = {
  margin: "0 0 5px",
  fontSize: 17,
};

const categoryDescStyle: CSSProperties = {
  margin: 0,
  color: "#64748b",
  fontSize: 13,
};

const arrowStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 22,
  fontWeight: 900,
};

const emptyStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "20px auto",
  padding: 24,
  background: "white",
  borderRadius: 18,
  border: "1px solid #e2e8f0",
  color: "#64748b",
};

const ctaStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "32px auto 0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  flexWrap: "wrap",
  padding: 28,
  borderRadius: 22,
  background: "#0f172a",
  color: "white",
};

const ctaEyebrowStyle: CSSProperties = {
  color: "#38bdf8",
  fontWeight: 900,
  fontSize: 13,
};

const ctaTitleStyle: CSSProperties = {
  margin: "7px 0 8px",
  fontSize: 26,
};

const ctaTextStyle: CSSProperties = {
  margin: 0,
  color: "#cbd5e1",
};

const ctaButtonStyle: CSSProperties = {
  textDecoration: "none",
  background: "#22c55e",
  color: "white",
  padding: "13px 19px",
  borderRadius: 12,
  fontWeight: 900,
};
