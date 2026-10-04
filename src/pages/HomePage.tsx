import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

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
  background: "linear-gradient(135deg, var(--nex-turquoise-700), var(--nex-turquoise-500))",
  color: "#fff",
  padding: "13px 20px",
  borderRadius: 12,
  fontWeight: 700,
  boxShadow: "0 12px 30px rgba(132, 204, 22, 0.28)",
};

const secondaryButtonStyle: React.CSSProperties = {
  textDecoration: "none",
  background: "#ffffff",
  color: "#0B3D6E",
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

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] =
  useState<ProductCard[]>([]);
  const [search, setSearch] = useState("");
  const [homeCategories, setHomeCategories] = useState<HomeCategory[]>([]);
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
    fetch(`${api}/categories`)
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
          color: "#0B3D6E",
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
              gap: isMobile ? 24 : 30,
              alignItems: "center",
              padding: isMobile ? "24px 0 30px" : "36px 0 46px",
            }}
          >
            <div style={{ position: "relative", minWidth: 0 }}>
              <div
                style={{
                  position: "absolute",
                  width: isMobile ? 180 : 300,
                  height: isMobile ? 180 : 300,
                  right: isMobile ? -70 : -70,
                  top: isMobile ? -50 : -70,
                  borderRadius: "50%",
                  background: "rgba(22,184,62,0.09)",
                  pointerEvents: "none",
                }}
              />

              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: isMobile ? 22 : 30,
                  border: "1px solid #D5E5EA",
                  background: "#F8FAFC",
                  boxShadow:
                    "0 28px 70px rgba(11,61,110,0.14), 0 10px 28px rgba(15,23,42,0.08)",
                }}
              >
                <img
                  src="/images/nex-hero-b2b.jpg"
                  alt="Nex Tedarik Pazarı B2B tedarik, depo ve lojistik ağı"
                  style={{
                    display: "block",
                    width: "100%",
                    height: isMobile ? "auto" : 270,
                    aspectRatio: isMobile ? "16 / 9" : undefined,
                    objectFit: "cover",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    left: isMobile ? 12 : 18,
                    bottom: isMobile ? 12 : 18,
                    display: "flex",
                    gap: 7,
                    flexWrap: "wrap",
                  }}
                >
                  {["Gıda", "Temizlik", "Ambalaj", "Hırdavat", "Otomotiv"].map(
                    (item, index) => (
                      <span
                        key={item}
                        style={{
                          padding: "8px 11px",
                          borderRadius: 999,
                          background:
                            index === 0
                              ? "rgba(22,184,62,0.96)"
                              : "rgba(255,255,255,0.94)",
                          color: index === 0 ? "#ffffff" : "#0B3D6E",
                          border: "1px solid rgba(255,255,255,0.72)",
                          fontSize: 11,
                          fontWeight: 800,
                          boxShadow: "0 7px 18px rgba(15,23,42,0.14)",
                        }}
                      >
                        {item}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "8px 13px",
                  borderRadius: 999,
                  background: "linear-gradient(135deg, #E9FBEF, #F5FBFF)",
                  border: "1px solid #BFE8CD",
                  color: "#128A35",
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: 0.4,
                  marginBottom: 18,
                }}
              >
                TEDARİK PAZARI • TÜRKİYE B2B PAZARYERİ
              </div>

              <h1
                style={{
                  margin: "0 0 18px",
                  color: "#0B3D6E",
                  fontSize: isMobile ? 38 : 56,
                  lineHeight: 1.04,
                  letterSpacing: isMobile ? -1.2 : -2.2,
                  fontWeight: 900,
                }}
              >
                Toptan Ticaretin{" "}
                <span style={{ color: "#16B83E" }}>Yeni Adresi</span>
              </h1>

              <p
                style={{
                  margin: "0 0 25px",
                  maxWidth: 610,
                  color: "#475569",
                  fontSize: isMobile ? 16 : 18,
                  lineHeight: 1.7,
                  fontWeight: 500,
                }}
              >
                Doğrulanmış firmalarla güvenli, hızlı ve profesyonel B2B ticaret.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: 24,
                }}
              >
                <Link
                  to="/products"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 46,
                    padding: "0 20px",
                    borderRadius: 13,
                    background:
                      "linear-gradient(135deg, #082F55 0%, #0B4C82 100%)",
                    color: "#ffffff",
                    textDecoration: "none",
                    fontWeight: 850,
                    fontSize: 14,
                    boxShadow: "0 9px 20px rgba(11,61,110,0.18)",
                  }}
                >
                  Tüm Ürünleri İncele
                </Link>

                <Link
                  to="/register?role=SELLER"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 46,
                    padding: "0 20px",
                    borderRadius: 13,
                    background:
                      "linear-gradient(135deg, #16B83E 0%, #22C55E 100%)",
                    border: "1px solid #16B83E",
                    color: "#ffffff",
                    textDecoration: "none",
                    fontWeight: 850,
                    fontSize: 14,
                    boxShadow: "0 9px 20px rgba(22,184,62,0.18)",
                  }}
                >
                  Satıcı Olarak Başla
                </Link>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: isMobile ? 10 : 18,
                  flexWrap: "wrap",
                  color: "#475569",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                <span>✓ Doğrulanmış firmalar</span>
                <span>✓ Güvenli ödeme</span>
                <span>✓ Toptan satın alma</span>
                <span>✓ Türkiye geneli ticaret</span>
              </div>
            </div>

          </section>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "repeat(2, minmax(0, 1fr))"
                : "repeat(4, minmax(0, 1fr))",
              gap: 12,
              marginBottom: isMobile ? 28 : 40,
            }}
          >
            {[
              ["✓", "Doğrulanmış Firmalar", "Kurumsal alıcı ve satıcı ağı"],
              ["₺", "Güvenli Ödeme", "Kontrollü ödeme altyapısı"],
              ["□", "Toptan Ticaret", "MOQ ve toplu satın alma"],
              ["→", "Lojistik", "Türkiye geneli sevkiyat süreci"],
            ].map(([icon, title, text], index) => (
              <div
                key={title}
                style={{
                  padding: isMobile ? 14 : 18,
                  borderRadius: 18,
                  background: "#ffffff",
                  border: "1px solid #DCE6EE",
                  borderTop: "3px solid #0B3D6E",
                  boxShadow:
                    "0 10px 28px rgba(11,61,110,0.07), 0 2px 5px rgba(15,23,42,0.03)",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 12,
                    marginBottom: 10,
                    background:
                      "linear-gradient(135deg, #E8F2FA 0%, #E9FBEF 100%)",
                    border: "1px solid #D5E8E0",
                    color: "#0B3D6E",
                    fontWeight: 900,
                    fontSize: 17,
                  }}
                >
                  {icon}
                </div>
                <div
                  style={{
                    color: "#0B3D6E",
                    fontWeight: 900,
                    fontSize: isMobile ? 13 : 15,
                    marginBottom: 4,
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    color: "#64748b",
                    fontSize: isMobile ? 11 : 13,
                    lineHeight: 1.45,
                  }}
                >
                  {text}
                </div>
              </div>
            ))}
          </section>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "repeat(2, minmax(0, 1fr))"
                : "repeat(4, minmax(0, 1fr))",
              gap: isMobile ? 10 : 14,
              marginBottom: isMobile ? 28 : 36,
            }}
          >
            {[
              {
                icon: "↗️",
                eyebrow: "YENİ GELENLER",
                title: "Yeni Ürünler",
                text: "Pazaryerine yeni eklenen ürünleri keşfet.",
                to: "/products",
              },
              {
                icon: "□",
                eyebrow: "TOPLU ALIM",
                title: "Toptan Ürünler",
                text: "MOQ ve toptan fiyatlarla satın al.",
                to: "/products",
              },
              {
                icon: "▦",
                eyebrow: "KEŞFET",
                title: "Popüler Kategoriler",
                text: "İşletmen için ürünleri kategorilere göre bul.",
                to: "/categories",
              },
              {
                icon: "♡",
                eyebrow: "KAYDETTİKLERİN",
                title: "Favorilerim",
                text: "Beğendiğin ürünlere hızlıca yeniden ulaş.",
                to: "/favorites",
              },
            ].map((item, index) => (
              <Link
                key={item.title}
                to={item.to}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  minHeight: isMobile ? 142 : 164,
                  padding: isMobile ? 14 : 18,
                  boxSizing: "border-box",
                  borderRadius: 18,
                  border: "1px solid #DCE6EE",
                  borderTop: "3px solid #16B83E",
                  background:
                    "linear-gradient(145deg, #FFFFFF 0%, #FBFDFE 100%)",
                  color: "#0B3D6E",
                  textDecoration: "none",
                  boxShadow:
                    "0 10px 28px rgba(11,61,110,0.08), 0 2px 6px rgba(15,23,42,0.03)",
                }}
              >
                <div
                  style={{
                    width: isMobile ? 36 : 42,
                    height: isMobile ? 36 : 42,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 12,
                    background:
                      "linear-gradient(135deg, #E8F2FA 0%, #E9FBEF 100%)",
                    border: "1px solid #D5E8E0",
                    color: "#0B3D6E",
                    fontSize: isMobile ? 17 : 20,
                    fontWeight: 900,
                    marginBottom: 12,
                  }}
                >
                  {item.icon}
                </div>

                <div
                  style={{
                    color: "#16A34A",
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: 0.8,
                    marginBottom: 5,
                  }}
                >
                  {item.eyebrow}
                </div>

                <div
                  style={{
                    color: "#0B3D6E",
                    fontSize: isMobile ? 14 : 17,
                    fontWeight: 900,
                    marginBottom: 6,
                  }}
                >
                  {item.title}
                </div>

                <div
                  style={{
                    color: "#64748b",
                    fontSize: isMobile ? 10 : 12,
                    lineHeight: 1.45,
                  }}
                >
                  {item.text}
                </div>
              </Link>
            ))}
          </section>

          <section style={{ marginBottom: isMobile ? 24 : 36 }}>
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
                    color: "#16B83E",
                    fontSize: 12,
                    fontWeight: 900,
                    letterSpacing: 0.7,
                    marginBottom: 6,
                  }}
                >
                  SEKTÖRLERE GÖRE KEŞFET
                </div>
                <h2
                  style={{
                    margin: 0,
                    color: "#0B3D6E",
                    fontSize: isMobile ? 24 : 30,
                    lineHeight: 1.2,
                    fontWeight: 900,
                  }}
                >
                  İşletmeniz İçin Sektörleri Keşfedin
                </h2>
              </div>

              {!isMobile && (
                <Link
                  to="/categories"
                  style={{
                    color: "#0B3D6E",
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: 900,
                  }}
                >
                  Tüm sektörler →
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
                  title: "Ev, Yaşam & Ofis",
                  image: "/images/discover-ev-yasam.jpeg",
                  categoryName: "Mobilya ve Ofis",
                },
                {
                  title: "Kozmetik & Kişisel Bakım",
                  image: "/images/discover-kozmetik.jpeg",
                  categoryName: "Kozmetik ve Kuaför",
                },
                {
                  title: "Bahçe & Yapı Malzemeleri",
                  image: "/images/discover-bahce-yapi.jpeg",
                  categoryName: "İnşaat ve Yapı Malzemeleri",
                },
                {
                  title: "Gıda & Horeca",
                  image: "/images/discover-gida-horeca.jpeg",
                  categoryName: "Gıda ve Horeca",
                },
                {
                  title: "Temizlik & Hijyen",
                  image: "/images/discover-temizlik-hijyen.jpeg",
                  categoryName: "Temizlik ve Hijyen",
                },
                {
                  title: "Sanayi & Üretim",
                  image: "/images/discover-sanayi.jpeg",
                  categoryName: "Maden ve Endüstriyel Üretim",
                },
              ].map((item) => (
                <Link
                  key={item.title}
                  to={
                    homeCategories.find(
                      (category) =>
                        category.name.toLocaleLowerCase("tr-TR") ===
                        item.categoryName.toLocaleLowerCase("tr-TR")
                    )?.id
                      ? `/category/${homeCategories.find(
                          (category) =>
                            category.name.toLocaleLowerCase("tr-TR") ===
                            item.categoryName.toLocaleLowerCase("tr-TR")
                        )!.id}`
                      : "/categories"
                  }
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
                        background: "#16B83E",
                        color: "#ffffff",
                        fontSize: 17,
                        fontWeight: 900,
                        boxShadow: "0 7px 18px rgba(22,184,62,0.30)",
                      }}
                    >
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: isMobile ? 28 : 40 }}>
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
                    color: "#16B83E",
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: 0.6,
                    marginBottom: 6,
                  }}
                >
                  ALIŞVERİŞE BAŞLA
                </div>

                <h2
                  style={{
                    margin: 0,
                    color: "#0B3D6E",
                    fontSize: isMobile ? 24 : 30,
                    lineHeight: 1.2,
                  }}
                >
                  Popüler Kategoriler
                </h2>
              </div>

              <Link
                to="/categories"
                style={{
                  textDecoration: "none",
                  color: "#0B3D6E",
                  fontSize: 13,
                  fontWeight: 900,
                }}
              >
                Tüm kategoriler →
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
              {sectors.map((sector) => (
                <Link
                  key={sector.title}
                  to={homeCategories.find((category) => category.name.toLocaleLowerCase("tr-TR") === sector.title.toLocaleLowerCase("tr-TR"))?.id ? `/category/${homeCategories.find((category) => category.name.toLocaleLowerCase("tr-TR") === sector.title.toLocaleLowerCase("tr-TR"))!.id}` : "/categories"}
                  style={{
                    minWidth: isMobile ? 155 : 0,
                    flex: isMobile ? "0 0 155px" : undefined,
                    scrollSnapAlign: isMobile ? "start" : undefined,
                    overflow: "hidden",
                    borderRadius: 18,
                    border: "1px solid #DCE6EE",
                    background: "#ffffff",
                    color: "#0B3D6E",
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
                      alt={sector.title}
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
                        color: "#0B3D6E",
                        fontSize: isMobile ? 12 : 14,
                        lineHeight: 1.3,
                        fontWeight: 850,
                      }}
                    >
                      {sector.title}
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
                        background: "#16B83E",
                        fontWeight: 900,
                        fontSize: 14,
                        boxShadow: "0 5px 12px rgba(22,184,62,0.20)",
                      }}
                    >
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {featuredProducts.length > 0 && (
            <section style={{ marginBottom: isMobile ? 28 : 42 }}>
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
                      color: "#16B83E",
                      fontSize: 12,
                      fontWeight: 900,
                      letterSpacing: 0.5,
                      marginBottom: 6,
                    }}
                  >
                    TOPTAN ALIŞVERİŞ
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      color: "#0B3D6E",
                      fontSize: isMobile ? 24 : 30,
                      lineHeight: 1.2,
                    }}
                  >
                    Yeni Eklenen Ürünler
                  </h2>
                </div>

                <Link
                  to="/products"
                  style={{
                    color: "#0B3D6E",
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: 900,
                  }}
                >
                  Tüm ürünleri gör →
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
                  <Link
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
                      color: "#0B3D6E",
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
                          Min. {product.moq} {product.unitType || "adet"}
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
                          color: "#16A34A",
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
                              color: "#0B3D6E",
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
                            / {product.unitType || "adet"}
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
                              ? `KDV %${product.vatRate}`
                              : "KDV bilgisi üründe"}
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
                              "linear-gradient(135deg, #16B83E 0%, #22C55E 100%)",
                            color: "#ffffff",
                            fontSize: 12,
                            fontWeight: 900,
                            boxShadow: "0 7px 16px rgba(22,184,62,0.18)",
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

          

                    <section
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(3, minmax(0, 1fr))",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              overflow: "hidden",
              background: "#ffffff",
              marginBottom: isMobile ? 20 : 28,
            }}
          >
            {[
              ["✓", "Doğrulanmış Firmalar"],
              ["🔒", "Güvenli Ödeme"],
              ["🛡️", "Kontrollü Ticaret"],
            ].map(([icon, title], index) => (
              <div
                key={title}
                style={{
                  minHeight: isMobile ? 52 : 64,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 9,
                  padding: "10px 14px",
                  borderRight:
                    !isMobile && index < 2 ? "1px solid #e2e8f0" : undefined,
                  borderBottom:
                    isMobile && index < 2 ? "1px solid #e2e8f0" : undefined,
                  boxSizing: "border-box",
                }}
              >
                <span
                  style={{
                    color: "#16B83E",
                    fontSize: 17,
                    fontWeight: 900,
                  }}
                >
                  {icon}
                </span>
                <strong
                  style={{
                    color: "#0B3D6E",
                    fontSize: isMobile ? 12 : 14,
                  }}
                >
                  {title}
                </strong>
              </div>
            ))}
          </section>



          <section
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
                  background: "linear-gradient(135deg, #16B83E, #22C55E)",
                  color: "#ffffff",
                  padding: isMobile ? "10px 13px" : "13px 20px",
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: isMobile ? 13 : 16,
                  boxShadow: "0 10px 24px rgba(34,197,94,0.24)",
                  width: isMobile ? "100%" : "auto",
                  maxWidth: isMobile ? 360 : "none",
                  boxSizing: "border-box",
                  textAlign: "center",
                }}
              >
                Alıcı Olarak Üye Ol
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
                Satıcı Olarak Başla
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
