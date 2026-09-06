import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type Sector = {
  title: string;
  image: string;
};




type ProductCategory = {
  id?: string;
  name: string;
};

type ProductImageObject = {
  url?: string;
  imageUrl?: string;
};

type ApiProduct = {
  id: string;
  title?: string;
  name?: string;
  price?: number | string;
  basePrice?: number | string;
  imageUrl?: string;
  thumbnail?: string;
  images?: Array<string | ProductImageObject>;
  category?: ProductCategory | string | null;
  categoryName?: string;
  moq?: number;
  unitType?: string;
  leadTimeDays?: number | null;
  seller?: {
    name?: string;
    verified?: boolean;
    city?: string | null;
    rating?: number;
  };
};

type ProductCard = {
  id: string;
  title: string;
  category: string;
  price: string;
  image: string;
  moq?: number;
  unitType?: string;
  leadTimeDays?: number | null;
};

type PublicRfq = {
  id: string;
  title?: string | null;
  quantity?: number | null;
  unitType?: string | null;
  deliveryCountry?: string | null;
  deliveryCity?: string | null;
  createdAt?: string;
  category?: {
    name?: string | null;
  } | null;
  product?: {
    title?: string | null;
  } | null;
};

const sectors: Sector[] = [
  { title: "Ambalaj ve Paketleme", image: "/images/category-ambalaj-ai.png" },
  { title: "Temizlik ve Hijyen", image: "/images/category-temizlik-ai.png" },
  { title: "Gıda ve Horeca", image: "/images/category-gida-ai.png" },
  { title: "Elektrik ve Aydınlatma", image: "/images/category-elektrik-ai.png" },
  { title: "İş Güvenliği", image: "/images/category-is-guvenligi-ai.png" },
  { title: "Otomotiv ve Yedek Parça", image: "/images/category-otomotiv-ai.png" },
  { title: "Hırdavat", image: "/images/category-hirdavat-ai.png" },
  { title: "Lojistik ve Depolama", image: "/images/category-lojistik-ai.png" },
];





const primaryButtonStyle: React.CSSProperties = {
  textDecoration: "none",
  background: "linear-gradient(135deg, #84cc16, #65a30d)",
  color: "#fff",
  padding: "13px 20px",
  borderRadius: 12,
  fontWeight: 700,
  boxShadow: "0 12px 30px rgba(132, 204, 22, 0.28)",
};

const secondaryButtonStyle: React.CSSProperties = {
  textDecoration: "none",
  background: "#ffffff",
  color: "#0f172a",
  padding: "13px 20px",
  borderRadius: 12,
  fontWeight: 700,
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.16)",
};

function formatPrice(value: number | string | undefined, fallback: string): string {
  if (value === undefined || value === null || value === "") return fallback;

  if (typeof value === "number") return `₺${value}`;

  const numeric = Number(value);
  if (!Number.isNaN(numeric)) return `₺${numeric}`;

  return String(value);
}

function getCategoryName(product: ApiProduct, fallback: string): string {
  if (typeof product.category === "string" && product.category.trim()) {
    return product.category;
  }

  if (
    product.category &&
    typeof product.category === "object" &&
    "name" in product.category &&
    product.category.name
  ) {
    return product.category.name;
  }

  if (product.categoryName) return product.categoryName;

  return fallback;
}

function getImageUrl(product: ApiProduct): string {
  if (Array.isArray(product.images) && product.images.length > 0) {
    const img = product.images[0];

    if (typeof img === "string") {
      return img.trim() && img.startsWith("http")
        ? img
        : `https://tedarik-backend.onrender.com${img}`;
    }

    if (img && typeof img === "object") {
      if (img.url) {
        return img.url.startsWith("http")
          ? img.url
          : `https://tedarik-backend.onrender.com${img.url}`;
      }

      if (img.imageUrl) {
        return img.imageUrl.startsWith("http")
          ? img.imageUrl
          : `https://tedarik-backend.onrender.com${img.imageUrl}`;
      }
    }
  }

  if (product.imageUrl) {
    return product.imageUrl.startsWith("http")
      ? product.imageUrl
      : `https://tedarik-backend.onrender.com${product.imageUrl}`;
  }

  const title = (product.title || product.name || "").toLowerCase();

  if (title.includes("eldiven")) return "/images/product-4.jpg";
  if (title.includes("ampul")) return "/images/product-5.jpg";
  if (title.includes("koli")) return "/images/product-1.jpg";

  return "/images/product-1.jpg";
}

function mapApiProductToCard(product: ApiProduct, fallbackCategory: string, fallbackProduct: string, fallbackQuote: string): ProductCard {
  return {
    id: product.id,
    title: product.title || product.name || fallbackProduct,
    category: getCategoryName(product, fallbackCategory),
    price: formatPrice(product.price ?? product.basePrice, fallbackQuote),
    image: getImageUrl(product),
    moq: product.moq,
    unitType: product.unitType,
    leadTimeDays: product.leadTimeDays,
  };
}

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] =
  useState<ProductCard[]>([]);
  const [recentRfqs, setRecentRfqs] = useState<PublicRfq[]>([]);
  const [search, setSearch] = useState("");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 700 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 700);

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api"}/rfqs/public/recent`)
      .then((res) => {
        if (!res.ok) throw new Error(`RFQ talepleri alınamadı: ${res.status}`);
        return res.json();
      })
      .then((data: unknown) => {
        setRecentRfqs(Array.isArray(data) ? (data as PublicRfq[]) : []);
      })
      .catch((err) => {
        console.error("public rfqs error:", err);
        setRecentRfqs([]);
      });
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api"}/products`)
      .then((res) => {
        if (!res.ok) throw new Error(`Ürünler alınamadı: ${res.status}`);
        return res.json();
      })
      .then((data: unknown) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = (data as ApiProduct[])
            .filter((product) => {
              const title = (product.title || product.name || "")
                .trim()
                .toLocaleLowerCase("tr-TR");

              if (!title) return false;
              if (title === "test" || title.includes(" test ")) return false;
              if (title === "çorap" || title === "çorap üretimi") return false;

              return true;
            })
            .slice(0, 8)
            .map((product) => mapApiProductToCard(
              product,
              t("homePage.categoryFallback"),
              t("homePage.productFallback"),
              t("homePage.getQuote")
            ));

          setFeaturedProducts(mapped);
        }
      })
      .catch((err) => {
        console.error("products error:", err);
      });
  }, []);

  return (
    <>
      <Helmet>
        <title>
          {t("homePage.seoTitle")}
        </title>
        <meta
          name="description"
          content={t("homePage.seoDescription")}
        />
        <link rel="canonical" href="https://xn--tedarikpazar-d5b.com/" />
        <meta property="og:title" content="Tedarik Pazarı" />
        <meta
          property="og:description"
          content={t("homePage.ogDescription")}
        />
        <meta property="og:url" content="https://xn--tedarikpazar-d5b.com/" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          overflowX: "hidden",
          background:
            "radial-gradient(circle at top left, rgba(37,99,235,0.18), transparent 30%), #081120",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: isMobile ? "18px 14px 48px" : "28px 20px 72px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 24,
              alignItems: "stretch",
              marginBottom: 28,
            }}
          >
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 28,
                minHeight: 560,
                width: "100%",
                backgroundImage:
                  "linear-gradient(90deg, rgba(8,15,30,0.92) 0%, rgba(8,15,30,0.72) 42%, rgba(8,15,30,0.28) 100%), url('/images/hero-b2b.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                boxShadow: "0 30px 60px rgba(2, 132, 199, 0.20)",
              }}
            >
              <div
                style={{
                  padding: isMobile ? 22 : 38,
                  maxWidth: 720,
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: "rgba(59,130,246,0.26)",
                    fontSize: 13,
                    fontWeight: 700,
                    marginBottom: 18,
                    border: "1px solid rgba(255,255,255,0.18)",
                  }}
                >
                  {t("homePage.heroBadge")}
                </div>

                <h1
                  style={{
                    fontSize: isMobile ? 36 : 44,
                    lineHeight: isMobile ? 1.12 : 1.08,
                    margin: "0 0 18px",
                    fontWeight: 900,
                    maxWidth: 760,
                    textShadow: "0 8px 30px rgba(0,0,0,0.38)",
                  }}
                >
                  {t("homePage.heroTitle")}
                </h1>

                <p
                  style={{
                    fontSize: isMobile ? 17 : 19,
                    lineHeight: isMobile ? 1.55 : 1.75,
                    margin: "0 0 24px",
                    maxWidth: 720,
                    color: "rgba(255,255,255,0.96)",
                  }}
                >
                  {t("homePage.heroDescription")}
                </p>
                <div style={{ marginBottom: 14, maxWidth: 650 }}>
                  <div
                    style={{
                      fontSize: isMobile ? 20 : 24,
                      fontWeight: 900,
                      marginBottom: 6,
                      color: "#ffffff",
                    }}
                  >
                    {t("homePage.heroQuestion")}
                  </div>

                  <div
                    style={{
                      fontSize: isMobile ? 13 : 15,
                      lineHeight: 1.5,
                      color: "#dbeafe",
                    }}
                  >
                    {t("homePage.heroSearchDescription")}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginBottom: 10,
                    maxWidth: 650,
                    flexWrap: "wrap",
                    width: "100%",
                  }}
                >
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && search.trim()) {
                        navigate(
                          `/products?q=${encodeURIComponent(search.trim())}`
                        );
                      }
                    }}
                    placeholder={t("homePage.searchPlaceholder")}
                    style={{
                      flex: "1 1 340px",
                      height: 52,
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.22)",
                      padding: "0 16px",
                      fontSize: 15,
                      outline: "none",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const query = search.trim();

                      navigate(
                        query
                          ? `/products?q=${encodeURIComponent(query)}`
                          : "/products"
                      );
                    }}
                    style={{
                      minWidth: isMobile ? "100%" : 110,
                      width: isMobile ? "100%" : "auto",
                      height: 52,
                      border: "none",
                      background: "#2563eb",
                      color: "#fff",
                      padding: "0 22px",
                      borderRadius: 14,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {t("homePage.searchButton")}
                  </button>
                </div>

                <div
                  style={{
                    color: "#dbeafe",
                    fontSize: 14,
                    marginBottom: 20,
                  }}
                >
                  {t("homePage.productNotFound")}{" "}
                  <Link
                    to="/buyer/rfqs/new"
                    style={{
                      color: "#ffffff",
                      fontWeight: 900,
                      textDecoration: "underline",
                    }}
                  >
                    {t("homePage.directRfq")}
                  </Link>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    marginBottom: 24,
                    width: "100%",
                  }}
                >
                  <Link
                    to="/buyer/rfqs/new"
                    style={{
                      ...primaryButtonStyle,
                      width: isMobile ? "100%" : "auto",
                      textAlign: "center",
                      boxSizing: "border-box",
                    }}
                  >
                    {t("homePage.freeQuote")}
                  </Link>

                  <Link
                    to="/register"
                    style={{
                      ...secondaryButtonStyle,
                      background: "rgba(255,255,255,0.96)",
                      width: isMobile ? "100%" : "auto",
                      textAlign: "center",
                      boxSizing: "border-box",
                    }}
                  >
                    {t("homePage.startAsSeller")}
                  </Link>
                </div>

                

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginBottom: 26,
                  }}
                >
                  {[
                    t("homePage.badges.verified"),
                    t("homePage.badges.rfq"),
                    t("homePage.badges.payment"),
                    t("homePage.badges.nationwide"),
                  ].map((item) => (
                      <span
                        key={item}
                        style={{
                          background: "rgba(255,255,255,0.16)",
                          padding: "10px 14px",
                          borderRadius: 999,
                          fontSize: 14,
                          fontWeight: 600,
                          border: "1px solid rgba(255,255,255,0.14)",
                        }}
                      >
                        {item}
                      </span>
                    )
                  )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 12,
                  }}
                >
                  {[
                    { value: "🛡️", label: t("homePage.stats.safeTrade") },
                    { value: "📄", label: t("homePage.stats.rfq") },
                    { value: "💳", label: t("homePage.stats.payment") },
                    { value: "🚚", label: t("homePage.stats.delivery") },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 18,
                        padding: 14,
                      }}
                    >
                      <div style={{ fontSize: 24, fontWeight: 800 }}>
                        {item.value}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "rgba(255,255,255,0.80)",
                          lineHeight: 1.5,
                        }}
                      >
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                background: "#ffffff",
                color: "#0f172a",
                borderRadius: isMobile ? 20 : 28,
                padding: isMobile ? 18 : 28,
                width: "100%",
                boxShadow: "0 20px 40px rgba(15, 23, 42, 0.16)",
                border: "1px solid rgba(226,232,240,0.8)",
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  color: "#4f46e5",
                  marginBottom: isMobile ? 6 : 10,
                  fontSize: isMobile ? 12 : 14,
                }}
              >
                {t("homePage.advantagesEyebrow")}
              </div>

              <h2
                style={{
                  margin: isMobile ? "0 0 12px" : "0 0 18px",
                  fontSize: isMobile ? 22 : 28,
                  lineHeight: 1.2,
                }}
              >
                {t("homePage.advantagesTitle")}
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "repeat(2, minmax(0, 1fr))"
                    : "1fr",
                  gap: isMobile ? 9 : 14,
                }}
              >
                {[
                  {
                    title: t("homePage.highlights.verificationTitle"),
                    description: t("homePage.highlights.verificationDescription"),
                  },
                  {
                    title: t("homePage.highlights.quotesTitle"),
                    description: t("homePage.highlights.quotesDescription"),
                  },
                  {
                    title: t("homePage.highlights.discoveryTitle"),
                    description: t("homePage.highlights.discoveryDescription"),
                  },
                  {
                    title: t("homePage.highlights.purchasingTitle"),
                    description: t("homePage.highlights.purchasingDescription"),
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e5e7eb",
                      borderRadius: isMobile ? 13 : 16,
                      padding: isMobile ? 11 : 16,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        marginBottom: isMobile ? 4 : 6,
                        color: "#111827",
                        fontSize: isMobile ? 13 : 16,
                        lineHeight: 1.25,
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        color: "#6b7280",
                        lineHeight: isMobile ? 1.4 : 1.6,
                        fontSize: isMobile ? 11 : 15,
                      }}
                    >
                      {item.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
              gap: 16,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #eff6ff, #ffffff)",
                color: "#0f172a",
                borderRadius: 22,
                padding: isMobile ? 20 : 28,
                border: "1px solid #bfdbfe",
                boxShadow: "0 16px 34px rgba(37,99,235,0.10)",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#dbeafe",
                  fontSize: 22,
                  marginBottom: 16,
                }}
              >
                🛒
              </div>

              <div
                style={{
                  color: "#2563eb",
                  fontWeight: 900,
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
                {t("homePage.buyerEyebrow")}
              </div>

              <h2
                style={{
                  margin: "0 0 10px",
                  fontSize: isMobile ? 23 : 28,
                  lineHeight: 1.2,
                }}
              >
                {t("homePage.buyerTitle")}
              </h2>

              <p
                style={{
                  margin: "0 0 18px",
                  color: "#64748b",
                  lineHeight: 1.65,
                }}
              >
                {t("homePage.buyerDescription")}
              </p>

              <Link
                to="/buyer/rfqs/new"
                style={{
                  display: "inline-block",
                  textDecoration: "none",
                  background: "#2563eb",
                  color: "#ffffff",
                  padding: "12px 18px",
                  borderRadius: 12,
                  fontWeight: 900,
                }}
              >
                {t("homePage.createRfq")}
              </Link>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #f0fdf4, #ffffff)",
                color: "#0f172a",
                borderRadius: 22,
                padding: isMobile ? 20 : 28,
                border: "1px solid #bbf7d0",
                boxShadow: "0 16px 34px rgba(22,163,74,0.10)",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#dcfce7",
                  fontSize: 22,
                  marginBottom: 16,
                }}
              >
                📈
              </div>

              <div
                style={{
                  color: "#16a34a",
                  fontWeight: 900,
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
                {t("homePage.sellerEyebrow")}
              </div>

              <h2
                style={{
                  margin: "0 0 10px",
                  fontSize: isMobile ? 23 : 28,
                  lineHeight: 1.2,
                }}
              >
                {t("homePage.sellerTitle")}
              </h2>

              <p
                style={{
                  margin: "0 0 18px",
                  color: "#64748b",
                  lineHeight: 1.65,
                }}
              >
                {t("homePage.sellerDescription")}
              </p>

              <Link
                to="/register"
                style={{
                  display: "inline-block",
                  textDecoration: "none",
                  background: "#16a34a",
                  color: "#ffffff",
                  padding: "12px 18px",
                  borderRadius: 12,
                  fontWeight: 900,
                }}
              >
                {t("homePage.sellerJoin")}
              </Link>
            </div>
          </section>

          <section
            style={{
              background: "#0f172a",
              border: "1px solid rgba(148, 163, 184, 0.12)",
              borderRadius: 24,
              padding: 28,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "end",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
                marginBottom: 20,
              }}
            >
              <div>
                <div
                  style={{
                    color: "#38bdf8",
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  {t("homePage.popularEyebrow")}
                </div>
                <h2 style={{ margin: 0, fontSize: 30 }}>
                  {t("homePage.sectorsTitle")}
                </h2>
              </div>

              <Link
                to="/categories"
                style={{
                  textDecoration: "none",
                  color: "#93c5fd",
                  fontWeight: 700,
                }}
              >
                {t("homePage.allCategories")}
              </Link>
            </div>

            <div
              style={{
                display: isMobile ? "flex" : "grid",
                gridTemplateColumns: isMobile
                  ? undefined
                  : "repeat(auto-fit, minmax(240px, 1fr))",
                gap: isMobile ? 12 : 16,
                overflowX: isMobile ? "auto" : "visible",
                paddingBottom: isMobile ? 8 : 0,
                scrollSnapType: isMobile ? "x mandatory" : undefined,
                WebkitOverflowScrolling: "touch",
              }}
            >
              {sectors.map((sector, index) => {
                const sectorLabel = [
                  t("homePage.sectors.packaging"),
                  t("homePage.sectors.cleaning"),
                  t("homePage.sectors.food"),
                  t("homePage.sectors.electric"),
                  t("homePage.sectors.safety"),
                  t("homePage.sectors.automotive"),
                  t("homePage.sectors.hardware"),
                  t("homePage.sectors.logistics"),
                ][index];

                return (
  <div
    key={sector.title}
    onClick={() =>
      navigate(`/category/${encodeURIComponent(sector.title)}`)
    }
    style={{
      cursor: "pointer",
                    position: "relative",
                    minHeight: isMobile ? 138 : 180,
                    minWidth: isMobile ? 168 : undefined,
                    width: isMobile ? 168 : undefined,
                    flex: isMobile ? "0 0 168px" : undefined,
                    scrollSnapAlign: isMobile ? "start" : undefined,
                    overflow: "hidden",
                    borderRadius: isMobile ? 16 : 20,
                    backgroundImage: `linear-gradient(180deg, rgba(8,17,32,0.00) 0%, rgba(8,17,32,0.28) 100%), url('${sector.image}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    border: "1px solid rgba(148, 163, 184, 0.14)",
                    padding: isMobile ? 13 : 18,
                    display: "flex",
                    alignItems: "end",
                  }}
                >
                  <div>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        display: "grid",
                        placeItems: "center",
                        background: "rgba(56, 189, 248, 0.16)",
                        color: "#38bdf8",
                        fontWeight: 800,
                        marginBottom: 14,
                        border: "1px solid rgba(56, 189, 248, 0.18)",
                      }}
                    >
                      {sectorLabel.charAt(0)}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>
                      {sectorLabel}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </section>

          <section
            style={{
              background: "linear-gradient(135deg, #ffffff, #f8fafc)",
              color: "#0f172a",
              borderRadius: 24,
              padding: isMobile ? 18 : 28,
              marginBottom: 28,
              border: "1px solid #e2e8f0",
              boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
                gap: 16,
                flexWrap: "wrap",
                marginBottom: 20,
              }}
            >
              <div>
                <div
                  style={{
                    color: "#16a34a",
                    fontWeight: 900,
                    fontSize: 13,
                    marginBottom: 8,
                  }}
                >
                  {t("homePage.liveMarket.eyebrow")}
                </div>

                <h2
                  style={{
                    margin: "0 0 8px",
                    fontSize: isMobile ? 24 : 32,
                    lineHeight: 1.2,
                  }}
                >
                  {t("homePage.liveMarket.title")}
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    lineHeight: 1.6,
                    maxWidth: 720,
                  }}
                >
                  {t("homePage.liveMarket.description")}
                </p>
              </div>

              <Link
                to="/register"
                style={{
                  textDecoration: "none",
                  color: "#166534",
                  fontWeight: 800,
                }}
              >
                {t("homePage.liveMarket.sellerCta")}
              </Link>
            </div>

            {recentRfqs.length > 0 ? (
              <div
                style={{
                  display: isMobile ? "flex" : "grid",
                  gridTemplateColumns: isMobile
                    ? undefined
                    : "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 14,
                  overflowX: isMobile ? "auto" : "visible",
                  paddingBottom: isMobile ? 8 : 0,
                  scrollSnapType: isMobile ? "x mandatory" : undefined,
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {recentRfqs.map((rfq) => {
                  const title =
                    rfq.title ||
                    rfq.product?.title ||
                    t("homePage.productFallback");

                  const delivery =
                    [rfq.deliveryCountry, rfq.deliveryCity]
                      .filter(Boolean)
                      .join(" / ") || "-";

                  return (
                    <div
                      key={rfq.id}
                      style={{
                        minWidth: isMobile ? 250 : undefined,
                        flex: isMobile ? "0 0 250px" : undefined,
                        scrollSnapAlign: isMobile ? "start" : undefined,
                        border: "1px solid #e2e8f0",
                        borderRadius: 18,
                        padding: 18,
                        background: "#ffffff",
                        boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                          alignItems: "center",
                          marginBottom: 12,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: "#166534",
                            background: "#dcfce7",
                            borderRadius: 999,
                            padding: "5px 9px",
                          }}
                        >
                          {t("homePage.liveMarket.newRequest")}
                        </span>

                        <span
                          style={{
                            fontSize: 12,
                            color: "#64748b",
                            textAlign: "right",
                          }}
                        >
                          {rfq.category?.name || t("homePage.liveMarket.category")}
                        </span>
                      </div>

                      <h3
                        style={{
                          margin: "0 0 14px",
                          fontSize: 18,
                          lineHeight: 1.35,
                        }}
                      >
                        {title}
                      </h3>

                      <div
                        style={{
                          display: "grid",
                          gap: 8,
                          color: "#475569",
                          fontSize: 14,
                        }}
                      >
                        <div>
                          <strong>{t("homePage.liveMarket.quantity")}:</strong>{" "}
                          {rfq.quantity
                            ? `${rfq.quantity} ${rfq.unitType || ""}`.trim()
                            : "-"}
                        </div>

                        <div>
                          <strong>{t("homePage.liveMarket.delivery")}:</strong>{" "}
                          {delivery}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  border: "1px dashed #cbd5e1",
                  borderRadius: 18,
                  padding: isMobile ? 20 : 28,
                  textAlign: "center",
                  background: "#f8fafc",
                }}
              >
                <h3 style={{ margin: "0 0 8px" }}>
                  {t("homePage.liveMarket.emptyTitle")}
                </h3>

                <p
                  style={{
                    margin: "0 0 16px",
                    color: "#64748b",
                    lineHeight: 1.6,
                  }}
                >
                  {t("homePage.liveMarket.emptyDescription")}
                </p>

                <Link
                  to="/buyer/rfqs/new"
                  style={{
                    display: "inline-block",
                    textDecoration: "none",
                    background: "#2563eb",
                    color: "#ffffff",
                    padding: "11px 16px",
                    borderRadius: 12,
                    fontWeight: 800,
                  }}
                >
                  {t("homePage.liveMarket.buyerCta")}
                </Link>
              </div>
            )}
          </section>

          {/* Gerçek ürünler yayına alındığında ürün vitrini yeniden açılacak. */}

          <section
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(auto-fit, minmax(260px, 1fr))",
              gap: isMobile ? 9 : 18,
              marginBottom: isMobile ? 18 : 28,
            }}
          >
            {[
              {
                step: "1",
                title: t("homePage.steps.oneTitle"),
                description: t("homePage.steps.oneDescription"),
              },
              {
                step: "2",
                title: t("homePage.steps.twoTitle"),
                description: t("homePage.steps.twoDescription"),
              },
              {
                step: "3",
                title: t("homePage.steps.threeTitle"),
                description: t("homePage.steps.threeDescription"),
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  background: "#ffffff",
                  color: "#111827",
                  borderRadius: isMobile ? 15 : 22,
                  padding: isMobile ? 13 : 24,
                  boxShadow: isMobile
                    ? "0 8px 18px rgba(15,23,42,0.08)"
                    : "0 18px 36px rgba(15, 23, 42, 0.10)",
                  display: isMobile ? "grid" : "block",
                  gridTemplateColumns: isMobile ? "34px 1fr" : undefined,
                  columnGap: isMobile ? 11 : undefined,
                  alignItems: isMobile ? "start" : undefined,
                  border: "1px solid rgba(226,232,240,0.7)",
                }}
              >
                <div
                  style={{
                    width: isMobile ? 34 : 44,
                    height: isMobile ? 34 : 44,
                    borderRadius: 999,
                    display: "grid",
                    placeItems: "center",
                    background: "#dbeafe",
                    color: "#1d4ed8",
                    fontWeight: 800,
                    marginBottom: isMobile ? 0 : 14,
                    fontSize: isMobile ? 14 : 16,
                    gridRow: isMobile ? "1 / span 2" : undefined,
                  }}
                >
                  {item.step}
                </div>

                <h3
                  style={{
                    margin: isMobile ? "1px 0 4px" : "0 0 10px",
                    fontSize: isMobile ? 15 : 20,
                    lineHeight: 1.25,
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    margin: 0,
                    color: "#6b7280",
                    lineHeight: isMobile ? 1.4 : 1.65,
                    fontSize: isMobile ? 12 : 16,
                  }}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </section>

          <section style={{ marginBottom: 28 }}>
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  color: "#38bdf8",
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                {t("homePage.trustEyebrow")}
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: isMobile ? 24 : 32,
                  lineHeight: 1.2,
                }}
              >
                {t("homePage.trustTitle")}
              </h2>

              <p
                style={{
                  color: "#94a3b8",
                  maxWidth: 760,
                  lineHeight: 1.7,
                  fontSize: isMobile ? 13 : 16,
                }}
              >
                {t("homePage.trustDescription")}
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "repeat(3, minmax(0, 1fr))",
                gap: 16,
              }}
            >
              {[
                {
                  icon: "✓",
                  title: t("homePage.trustCards.verificationTitle"),
                  text: t("homePage.trustCards.verificationText"),
                },
                {
                  icon: "🔒",
                  title: t("homePage.trustCards.communicationTitle"),
                  text: t("homePage.trustCards.communicationText"),
                },
                {
                  icon: "🛡️",
                  title: t("homePage.trustCards.flowTitle"),
                  text: t("homePage.trustCards.flowText"),
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    background: "#ffffff",
                    color: "#0f172a",
                    borderRadius: 20,
                    padding: isMobile ? 18 : 24,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 14px 32px rgba(15,23,42,0.08)",
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 14,
                      display: "grid",
                      placeItems: "center",
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      fontSize: 22,
                      fontWeight: 900,
                      marginBottom: 14,
                    }}
                  >
                    {item.icon}
                  </div>

                  <h3 style={{ margin: "0 0 8px", fontSize: 19 }}>
                    {item.title}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: "#64748b",
                      lineHeight: 1.65,
                    }}
                  >
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, textAlign: "center" }}>
              <Link
                to="/register"
                style={{
                  display: "inline-block",
                  textDecoration: "none",
                  background: "#2563eb",
                  color: "#ffffff",
                  padding: "13px 22px",
                  borderRadius: 12,
                  fontWeight: 800,
                }}
              >
                {t("homePage.createFreeCompany")}
              </Link>
            </div>
          </section>

          <section
            style={{
              position: "relative",
              overflow: "hidden",
              backgroundImage:
                "linear-gradient(90deg, rgba(15,23,42,0.90) 0%, rgba(23,37,84,0.72) 100%), url('/images/cta-banner.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: isMobile ? 17 : 28,
              padding: isMobile ? "18px 14px" : 34,
              textAlign: "center",
              boxSizing: "border-box",
              boxShadow: "0 24px 50px rgba(15, 23, 42, 0.20)",
            }}
          >
            <h2
              style={{
                margin: "0 0 12px",
                fontSize: isMobile ? 21 : 34,
                lineHeight: 1.2,
              }}
            >
              {t("homePage.ctaTitle")}
            </h2>
            <p
              style={{
                margin: isMobile ? "0 auto 13px" : "0 auto 20px",
                maxWidth: 760,
                color: "#cbd5e1",
                fontSize: isMobile ? 12 : 17,
                lineHeight: isMobile ? 1.4 : 1.7,
              }}
            >
              {t("homePage.ctaDescription")}
            </p>
            
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <Link
                to="/register"
                style={{
                  textDecoration: "none",
                  background: "#22c55e",
                  color: "#fff",
                  padding: isMobile ? "10px 13px" : "13px 20px",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: isMobile ? 13 : 16,
                  boxShadow: "0 10px 24px rgba(34,197,94,0.24)",
                  width: isMobile ? "100%" : "auto",
                  maxWidth: isMobile ? 360 : "none",
                  boxSizing: "border-box",
                }}
              >
                {t("homePage.startFree")}
              </Link>
              <Link
                to="/buyer/rfqs/new"
                style={{
                  ...secondaryButtonStyle,
                  width: isMobile ? "100%" : "auto",
                  maxWidth: isMobile ? "none" : "none",
                  boxSizing: "border-box",
                  textAlign: "center",
                  padding: isMobile ? "10px 13px" : "13px 20px",
                  fontSize: isMobile ? 13 : 16,
                }}
              >
                {t("homePage.createRfq")}
              </Link>
              {!isMobile && (
                <Link
                  to={`/products?q=${encodeURIComponent(search.trim())}`}
                  style={{
                    textDecoration: "none",
                    background: "#ffffff",
                    color: "#0f172a",
                    padding: "13px 20px",
                    borderRadius: 12,
                    fontWeight: 700,
                    boxSizing: "border-box",
                    textAlign: "center",
                  }}
                >
                  {t("homePage.browseProducts")}
                </Link>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}