import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import NexHomeHero from "../components/home/NexHomeHero";
import { getPopularCategoryCopy } from "../components/home/NexHomePopularCategories.copy";
import { getHeroCopy } from "../components/home/NexHomeHero.copy";
import "../components/home/NexHomeCatalog.css";
import { getNexCatalogCopy } from "../components/home/NexHomeCatalog.copy";

type Sector = {
  title: string;
  image: string;
};

type HomeCategory = {
  id: string;
  name: string;
  parentId?: string | null;
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
  vatRate?: number | null;
  createdAt?: string;
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
  vatRate?: number | null;
  createdAt?: string;
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
  background: "linear-gradient(135deg, #A85637, #C76B43)",
  color: "#fff",
  padding: "13px 20px",
  borderRadius: 12,
  fontWeight: 700,
  boxShadow: "0 12px 30px rgba(132, 204, 22, 0.28)",
};

const secondaryButtonStyle: React.CSSProperties = {
  textDecoration: "none",
  background: "#ffffff",
  color: "#15283F",
  padding: "13px 20px",
  borderRadius: 12,
  fontWeight: 700,
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.16)",
};

function formatPrice(value: number | string | undefined, fallback: string): string {
  if (value === undefined || value === null || value === "") return fallback;

  const numeric = Number(value);
  if (!Number.isNaN(numeric)) {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numeric);
  }

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
    vatRate: product.vatRate,
    createdAt: product.createdAt,
  };
}

const SHOW_HOME_FEATURED_PRODUCTS = false;

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const catalog = getNexCatalogCopy(i18n.resolvedLanguage || i18n.language || "tr");
  const popularCopy = getPopularCategoryCopy(i18n.resolvedLanguage || i18n.language || "tr");
  const heroLabels = getHeroCopy(i18n.resolvedLanguage || i18n.language || "tr");
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] =
  useState<ProductCard[]>([]);
  const [search, setSearch] = useState("");
  const [homeCategories, setHomeCategories] = useState<HomeCategory[]>([]);

  const resolveHomeCategoryHref = (categoryName: string): string => {
    const normalizedName = categoryName.trim().toLocaleLowerCase("tr-TR");

    const category = homeCategories.find(
      (item) =>
        item.name.trim().toLocaleLowerCase("tr-TR") === normalizedName
    );

    return category?.id
      ? `/category/${encodeURIComponent(category.id)}`
      : "/categories";
  };

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 700 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 700);

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
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
            .sort(
              (a, b) =>
                new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime()
            )
            .slice(0, 8)
            .map((product) => mapApiProductToCard(
              product,
              t("homePage.categoryFallback"),
              t("homePage.productFallback"),
              t("homePage.priceInfo")
            ));

          setFeaturedProducts(mapped);
        }
      })
      .catch((err) => {
        console.error("products error:", err);
      });
  }, []);
  useEffect(() => {
    const api = import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api";
    fetch(`${api}/categories?lang=tr`)
      .then((res) => {
        if (!res.ok) throw new Error(`Kategoriler alınamadı: ${res.status}`);
        return res.json();
      })
      .then((data: unknown) => {
        if (Array.isArray(data)) {
          setHomeCategories((data as HomeCategory[]).filter((category) => category?.id && category?.name));
        }
      })
      .catch((err) => console.error("categories error:", err));
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
          background: "linear-gradient(180deg, #FFFFFF 0%, #F7FAFC 18%, #F3F7FA 100%)",
          color: "#15283F",
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

          <NexHomeHero />

          {SHOW_HOME_FEATURED_PRODUCTS && featuredProducts.length > 0 && (
            <section className="nex-home-featured" style={{ marginBottom: isMobile ? 28 : 42 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "end",
                  justifyContent: "space-between",
                  gap: 16,
                  flexWrap: "wrap",
                  marginBottom: 18,
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#A85637",
                      fontSize: 12,
                      fontWeight: 900,
                      letterSpacing: 0.5,
                      marginBottom: 6,
                    }}
                  >
                    {catalog.productHeading[0]}
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      color: "#15283F",
                      fontSize: isMobile ? 24 : 30,
                      lineHeight: 1.2,
                    }}
                  >
                    {catalog.productHeading[1]}
                  </h2>
                </div>

                <Link
                  to="/products"
                  style={{
                    color: "#15283F",
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: 900,
                  }}
                >
                  {catalog.product[0]} →
                </Link>
              </div>

              <div
                style={{
                  display: isMobile ? "flex" : "grid",
                  gridTemplateColumns: isMobile
                    ? undefined
                    : "repeat(4, minmax(0, 1fr))",
                  gap: 12,
                  overflowX: isMobile ? "auto" : "visible",
                  paddingBottom: isMobile ? 8 : 0,
                  scrollSnapType: isMobile ? "x mandatory" : undefined,
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {featuredProducts.map((product) => (
                  <Link className="nex-home-product-tile"
                    key={product.id}
                    to={`/product/${product.id}`}
                    style={{
                      minWidth: isMobile ? 220 : 0,
                      flex: isMobile ? "0 0 220px" : undefined,
                      scrollSnapAlign: isMobile ? "start" : undefined,
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                      borderRadius: 18,
                      border: "1px solid #DCE6EE",
                      background: "#ffffff",
                      color: "#15283F",
                      textDecoration: "none",
                      boxShadow:
                        "0 10px 28px rgba(11,61,110,0.08), 0 2px 5px rgba(15,23,42,0.03)",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        aspectRatio: "4 / 3",
                        overflow: "hidden",
                        background:
                          "linear-gradient(180deg, #FFFFFF 0%, #F4F8FA 100%)",
                        borderBottom: "1px solid #E7EEF3",
                      }}
                    >
                      <img
                        src={product.image}
                        alt={product.title}
                        loading="lazy"
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "block",
                          objectFit: "contain",
                          padding: 8,
                          boxSizing: "border-box",
                        }}
                      />

                      {product.moq ? (
                        <span
                          style={{
                            position: "absolute",
                            left: 10,
                            bottom: 10,
                            padding: "6px 9px",
                            borderRadius: 9,
                            background: "rgba(11,61,110,0.95)",
                            color: "#ffffff",
                            fontSize: 10,
                            fontWeight: 850,
                            boxShadow: "0 4px 12px rgba(11,61,110,0.18)",
                          }}
                        >
                          {catalog.product[1]} {product.moq} {product.unitType || catalog.product[2]}
                        </span>
                      ) : null}
                    </div>

                    <div
                      style={{
                        padding: 11,
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          color: "#A85637",
                          fontSize: 10,
                          fontWeight: 850,
                          letterSpacing: 0.25,
                          marginBottom: 6,
                        }}
                      >
                        {product.category}
                      </div>

                      <div
                        style={{
                          minHeight: 42,
                          color: "#16324A",
                          fontSize: 13,
                          fontWeight: 800,
                          lineHeight: 1.35,
                          marginBottom: 9,
                        }}
                      >
                        {product.title}
                      </div>

                      <div style={{ marginTop: "auto" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: 5,
                            marginBottom: 6,
                          }}
                        >
                          <strong
                            style={{
                              color: "#15283F",
                              fontSize: 20,
                              fontWeight: 950,
                              letterSpacing: -0.3,
                            }}
                          >
                            {product.price}
                          </strong>
                          <span
                            style={{
                              color: "#64748b",
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            / {product.unitType || catalog.product[2]}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 8,
                            color: "#64748b",
                            fontSize: 10,
                            fontWeight: 650,
                            paddingTop: 7,
                            borderTop: "1px solid #EDF2F5",
                            marginBottom: 10,
                          }}
                        >
                          <span>
                            {product.vatRate != null
                              ? `${catalog.product[3]} %${product.vatRate}`
                              : catalog.product[4]}
                          </span>
                          {product.leadTimeDays != null && (
                            <span>{product.leadTimeDays} gün teslim</span>
                          )}
                        </div>

                        <div
                          style={{
                            minHeight: 36,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: 10,
                            background:
                              "linear-gradient(135deg, #A85637 0%, #C76B43 100%)",
                            color: "#ffffff",
                            fontSize: 12,
                            fontWeight: 900,
                            boxShadow: "0 7px 16px rgba(199,107,67,0.18)",
                          }}
                        >
                          Ürünü İncele
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="nex-home-sector" style={{ marginBottom: isMobile ? 24 : 36 }}>
            <div
              style={{
                display: "flex",
                alignItems: "end",
                justifyContent: "space-between",
                gap: 16,
                marginBottom: 18,
              }}
            >
              <div>
                <div
                  style={{
                    color: "#A85637",
                    fontSize: 12,
                    fontWeight: 900,
                    letterSpacing: 0.7,
                    marginBottom: 6,
                  }}
                >
                  {catalog.heading[0]}
                </div>
                <h2
                  style={{
                    margin: 0,
                    color: "#15283F",
                    fontSize: isMobile ? 24 : 30,
                    lineHeight: 1.2,
                    fontWeight: 900,
                  }}
                >
                  {catalog.heading[1]}
                </h2>
              </div>

              {!isMobile && (
                <Link
                  to="/categories"
                  style={{
                    color: "#15283F",
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: 900,
                  }}
                >
                  {catalog.heading[2]} →
                </Link>
              )}
            </div>

            <div
              style={{
                display: isMobile ? "flex" : "grid",
                gridTemplateColumns: isMobile
                  ? undefined
                  : "repeat(3, minmax(0, 1fr))",
                gap: 14,
                overflowX: isMobile ? "auto" : "visible",
                paddingBottom: isMobile ? 8 : 0,
                scrollSnapType: isMobile ? "x mandatory" : undefined,
                WebkitOverflowScrolling: "touch",
              }}
            >
              {[
                {
                  title: catalog.sectors[0],
                  image: "/images/discover-ev-yasam.jpeg",
                  categoryName: "Mobilya ve Ofis",
                },
                {
                  title: catalog.sectors[1],
                  image: "/images/discover-kozmetik.jpeg",
                  categoryName: "Kozmetik ve Kuaför",
                },
                {
                  title: catalog.sectors[2],
                  image: "/images/discover-bahce-yapi.jpeg",
                  categoryName: "İnşaat ve Yapı Malzemeleri",
                },
                {
                  title: catalog.sectors[3],
                  image: "/images/discover-gida-horeca.jpeg",
                  categoryName: "Gıda ve Horeca",
                },
                {
                  title: catalog.sectors[4],
                  image: "/images/discover-temizlik-hijyen.jpeg",
                  categoryName: "Temizlik ve Hijyen",
                },
                {
                  title: catalog.sectors[5],
                  image: "/images/discover-sanayi.jpeg",
                  categoryName: "Maden ve Endüstriyel Üretim",
                },
              ].map((item) => (
                <Link className="nex-home-sector-tile"
                  key={item.title}
                  to={resolveHomeCategoryHref(item.categoryName)}
                  style={{
                    position: "relative",
                    minWidth: isMobile ? 270 : 0,
                    height: isMobile ? 190 : 230,
                    overflow: "hidden",
                    borderRadius: 20,
                    border: "1px solid #DCE6EE",
                    textDecoration: "none",
                    scrollSnapAlign: isMobile ? "start" : undefined,
                    boxShadow:
                      "0 14px 34px rgba(11,61,110,0.10), 0 3px 8px rgba(15,23,42,0.04)",
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    style={{
                      display: "block",
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />

                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(4,24,43,0.02) 30%, rgba(4,31,56,0.88) 100%)",
                    }}
                  />

                  <div
                    style={{
                      position: "absolute",
                      left: 18,
                      right: 18,
                      bottom: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <strong
                      style={{
                        color: "#ffffff",
                        fontSize: isMobile ? 17 : 19,
                        lineHeight: 1.2,
                        fontWeight: 900,
                        textShadow: "0 2px 10px rgba(0,0,0,0.32)",
                      }}
                    >
                      {item.title}
                    </strong>

                    <span
                      aria-hidden="true"
                      style={{
                        width: 34,
                        height: 34,
                        flexShrink: 0,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: 11,
                        background: "#A85637",
                        color: "#ffffff",
                        fontSize: 17,
                        fontWeight: 900,
                        boxShadow: "0 7px 18px rgba(199,107,67,0.30)",
                      }}
                    >
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="nex-home-popular" style={{ marginBottom: isMobile ? 28 : 40 }}>
            <div
              style={{
                display: "flex",
                alignItems: "end",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              <div>
                <div
                  style={{
                    color: "#A85637",
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: 0.6,
                    marginBottom: 6,
                  }}
                >
                  {popularCopy.eyebrow}
                </div>

                <h2
                  style={{
                    margin: 0,
                    color: "#15283F",
                    fontSize: isMobile ? 24 : 30,
                    lineHeight: 1.2,
                  }}
                >
                  {catalog.quick[2][1]}
                </h2>
              </div>

              <Link
                to="/categories"
                style={{
                  textDecoration: "none",
                  color: "#15283F",
                  fontSize: 13,
                  fontWeight: 900,
                }}
              >
                {heroLabels.categories} →
              </Link>
            </div>

            <div
              style={{
                display: isMobile ? "flex" : "grid",
                gridTemplateColumns: isMobile
                  ? undefined
                  : "repeat(4, minmax(0, 1fr))",
                gap: isMobile ? 10 : 14,
                overflowX: isMobile ? "auto" : "visible",
                paddingBottom: isMobile ? 8 : 0,
                scrollSnapType: isMobile ? "x mandatory" : undefined,
                WebkitOverflowScrolling: "touch",
              }}
            >
              {sectors.slice(0, 6).map((sector) => (
                <Link
                  key={sector.title}
                  to={resolveHomeCategoryHref(sector.title)}
                  style={{
                    minWidth: isMobile ? 155 : 0,
                    flex: isMobile ? "0 0 155px" : undefined,
                    scrollSnapAlign: isMobile ? "start" : undefined,
                    overflow: "hidden",
                    borderRadius: 18,
                    border: "1px solid #DCE6EE",
                    background: "#ffffff",
                    color: "#15283F",
                    textDecoration: "none",
                    boxShadow:
                      "0 10px 28px rgba(11,61,110,0.08), 0 2px 5px rgba(15,23,42,0.03)",
                  }}
                >
                  <div
                    style={{
                      height: isMobile ? 112 : 145,
                      overflow: "hidden",
                      background: "#EEF4F8",
                      borderBottom: "1px solid #E4ECF2",
                    }}
                  >
                    <img
                      src={sector.image}
                      alt={popularCopy.names[sector.title] || sector.title}
                      loading="lazy"
                      style={{
                        display: "block",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      minHeight: isMobile ? 48 : 56,
                      padding: isMobile ? "10px 11px" : "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      boxSizing: "border-box",
                      background:
                        "linear-gradient(180deg, #FFFFFF 0%, #F8FBFD 100%)",
                    }}
                  >
                    <strong
                      style={{
                        color: "#15283F",
                        fontSize: isMobile ? 12 : 14,
                        lineHeight: 1.3,
                        fontWeight: 850,
                      }}
                    >
                      {popularCopy.names[sector.title] || sector.title}
                    </strong>

                    <span
                      aria-hidden="true"
                      style={{
                        flexShrink: 0,
                        width: 28,
                        height: 28,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: 9,
                        color: "#ffffff",
                        background: "#A85637",
                        fontWeight: 900,
                        fontSize: 14,
                        boxShadow: "0 5px 12px rgba(199,107,67,0.20)",
                      }}
                    >
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="nex-home-shortcuts"
            aria-label={catalog.quick[2][1]}>
            <nav className="nex-home-shortcuts-links">
              {[
                {
                  icon: "↗",
                  eyebrow: catalog.quick[0][0],
                  title: catalog.quick[0][1],
                  description: catalog.quick[0][2],
                  to: "/products",
                },
                {
                  icon: "□",
                  eyebrow: catalog.quick[1][0],
                  title: catalog.quick[1][1],
                  description: catalog.quick[1][2],
                  to: "/products",
                },
                {
                  icon: "▦",
                  eyebrow: catalog.quick[2][0],
                  title: catalog.quick[2][1],
                  description: catalog.quick[2][2],
                  to: "/categories",
                },
                {
                  icon: "♡",
                  eyebrow: catalog.quick[3][0],
                  title: catalog.quick[3][1],
                  description: catalog.quick[3][2],
                  to: "/favorites",
                },
              ].map((item) => (
                <Link
                  key={item.title}
                  className="nex-home-quick-card"
                  to={item.to}
                  title={item.description}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <strong>{item.title}</strong>
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </nav>
          </section>

          <section className="nex-home-cta"
            style={{
              position: "relative",
              overflow: "hidden",
              backgroundImage:
                "linear-gradient(90deg, rgba(6,30,55,0.96) 0%, rgba(11,61,110,0.86) 55%, rgba(8,47,78,0.82) 100%), url('/images/cta-banner.jpg')",
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
                color: "#ffffff",
                fontSize: isMobile ? 21 : 34,
                lineHeight: 1.2,
                fontWeight: 900,
                textShadow: "0 2px 18px rgba(0,0,0,0.24)",
              }}
            >
              {t("homePage.ctaTitle")}
            </h2>
            <p
              style={{
                margin: isMobile ? "0 auto 13px" : "0 auto 20px",
                maxWidth: 760,
                color: "#E7F0F7",
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
                to="/register?role=BUYER"
                style={{
                  textDecoration: "none",
                  background: "linear-gradient(135deg, #A85637, #C76B43)",
                  color: "#ffffff",
                  padding: isMobile ? "10px 13px" : "13px 20px",
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: isMobile ? 13 : 16,
                  boxShadow: "0 10px 24px rgba(199,107,67,0.24)",
                  width: isMobile ? "100%" : "auto",
                  maxWidth: isMobile ? 360 : "none",
                  boxSizing: "border-box",
                  textAlign: "center",
                }}
              >
                {catalog.register[0]}
              </Link>
              <Link
                to="/register?role=SELLER"
                style={{
                  ...secondaryButtonStyle,
                  width: isMobile ? "100%" : "auto",
                  maxWidth: isMobile ? 360 : "none",
                  boxSizing: "border-box",
                  textAlign: "center",
                  padding: isMobile ? "10px 13px" : "13px 20px",
                  fontSize: isMobile ? 13 : 16,
                  fontWeight: 800,
                  color: "#ffffff",
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.52)",
                  boxShadow: "none",
                  backdropFilter: "blur(8px)",
                }}
              >
                {catalog.register[1]}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
