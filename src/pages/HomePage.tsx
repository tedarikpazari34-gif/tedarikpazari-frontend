import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

type Sector = {
  title: string;
  image: string;
};

type Highlight = {
  title: string;
  description: string;
};

type StepItem = {
  step: string;
  title: string;
  description: string;
};

type SupplierCard = {
  name: string;
  category: string;
  badge: string;
  image: string;
};

type StatItem = {
  value: string;
  label: string;
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
};

type ProductCard = {
  id: string;
  title: string;
  category: string;
  price: string;
  image: string;
};

const sectors: Sector[] = [
  { title: "Ambalaj ve Paketleme", image: "/images/category-ambalaj.jpg" },
  { title: "Temizlik ve Hijyen", image: "/images/category-temizlik.jpg" },
  { title: "Gıda ve Horeca", image: "/images/category-gida.jpg" },
  { title: "Elektrik ve Aydınlatma", image: "/images/category-elektrik.jpg" },
  { title: "İş Güvenliği", image: "/images/category-is-guvenligi.jpg" },
  { title: "Otomotiv ve Yedek Parça", image: "/images/category-otomotiv.jpg" },
  { title: "Hırdavat", image: "/images/category-hirdavat.jpg" },
  { title: "Lojistik ve Depolama", image: "/images/category-lojistik.jpg" },
];

const highlights: Highlight[] = [
  {
    title: "Doğrulanmış tedarikçiler",
    description:
      "İşletmenize uygun üretici, toptancı ve satıcıları daha güvenli şekilde keşfedin.",
  },
  {
    title: "Teklif toplama altyapısı",
    description:
      "Tek bir talep üzerinden birden fazla satıcıdan fiyat ve termin alın.",
  },
  {
    title: "Kategori bazlı keşif",
    description:
      "Temizlikten ambalaja, gıdadan sanayiye kadar geniş tedarik ağına ulaşın.",
  },
  {
    title: "Kurumsal satın alma deneyimi",
    description:
      "Ürün, teklif ve tedarik sürecinizi tek panelden daha verimli yönetin.",
  },
];

const steps: StepItem[] = [
  {
    step: "1",
    title: "İhtiyacını ara",
    description:
      "Ürün veya kategori bazında ihtiyacına uygun tedarik seçeneklerini hızlıca bul.",
  },
  {
    step: "2",
    title: "Tedarikçileri karşılaştır",
    description:
      "Fiyat, minimum sipariş, teslim süresi ve güven durumuna göre en doğru seçimi yap.",
  },
  {
    step: "3",
    title: "Teklif al ve yönet",
    description:
      "RFQ ile teklif topla, süreci takip et ve kurumsal satın almanı tek yerden yönet.",
  },
];

const fallbackFeaturedProducts: ProductCard[] = [
  {
    id: "fallback-1",
    title: "Endüstriyel Koli Bandı",
    category: "Ambalaj",
    price: "₺100+",
    image: "/images/product-1.jpg",
  },
  {
    id: "fallback-2",
    title: "Hijyenik Kağıt Ürünleri",
    category: "Temizlik",
    price: "₺250+",
    image: "/images/product-2.jpg",
  },
  {
    id: "fallback-3",
    title: "LED Armatür Seti",
    category: "Elektrik",
    price: "₺450+",
    image: "/images/product-3.jpg",
  },
];

const featuredSuppliers: SupplierCard[] = [
  {
    name: "Marmara Ambalaj",
    category: "Ambalaj ve Paketleme",
    badge: "Doğrulandı",
    image: "/images/supplier-1.jpg",
  },
  {
    name: "Anadolu Hijyen",
    category: "Temizlik ve Hijyen",
    badge: "Öne Çıkan",
    image: "/images/supplier-2.jpg",
  },
  {
    name: "Nova Endüstri",
    category: "Elektrik ve Aydınlatma",
    badge: "Kurumsal",
    image: "/images/supplier-3.jpg",
  },
];

const statItems: StatItem[] = [
  { value: "250+", label: "Doğrulanmış tedarikçi" },
  { value: "1.000+", label: "Listeleme ve ürün" },
  { value: "20+", label: "Popüler kategori" },
  { value: "7/24", label: "Teklif ve panel erişimi" },
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

function formatPrice(value?: number | string, fallback = "Teklif Al"): string {
  if (value === undefined || value === null || value === "") return fallback;

  if (typeof value === "number") return `₺${value}`;

  const numeric = Number(value);
  if (!Number.isNaN(numeric)) return `₺${numeric}`;

  return String(value);
}

function getCategoryName(product: ApiProduct): string {
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

  return "Kategori";
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

function mapApiProductToCard(product: ApiProduct): ProductCard {
  return {
    id: product.id,
    title: product.title || product.name || "Ürün",
    category: getCategoryName(product),
    price: formatPrice(product.price ?? product.basePrice),
    image: getImageUrl(product),
  };
}

export default function HomePage() {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] =
  useState<ProductCard[]>([]);

  useEffect(() => {
    fetch("https://tedarik-backend.onrender.com/api/products")
      .then((res) => {
        if (!res.ok) throw new Error(`Ürünler alınamadı: ${res.status}`);
        return res.json();
      })
      .then((data: unknown) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = (data as ApiProduct[])
            .slice(0, 3)
            .map(mapApiProductToCard);

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
          Tedarik Pazarı | İşletmeler için B2B Toptan Tedarik Platformu
        </title>
        <meta
          name="description"
          content="Tedarik Pazarı ile işletmeniz için toptan ürünleri keşfedin, tedarikçilerden teklif alın ve B2B satın alma sürecinizi tek platformdan yönetin."
        />
        <link rel="canonical" href="https://tedarikpazari.com/" />
        <meta property="og:title" content="Tedarik Pazarı" />
        <meta
          property="og:description"
          content="İşletmeler için güvenli ve hızlı B2B tedarik platformu."
        />
        <meta property="og:url" content="https://tedarikpazari.com/" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top left, rgba(37,99,235,0.18), transparent 30%), #081120",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "28px 20px 72px",
          }}
        >
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 28,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  color: "#38bdf8",
                }}
              >
                TEDARİK PAZARI
              </div>
              <div
                style={{
                  color: "#94a3b8",
                  marginTop: 6,
                  fontSize: 14,
                }}
              >
                Türkiye B2B tedarik ve toptan satın alma platformu
              </div>
            </div>

            <nav
              style={{
                display: "flex",
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
                  padding: "11px 18px",
                  borderRadius: 12,
                  fontWeight: 700,
                }}
              >
                Üye Ol
              </Link>

              <Link
                to="/login"
                style={{
                  textDecoration: "none",
                  background: "#2563eb",
                  color: "#fff",
                  padding: "11px 18px",
                  borderRadius: 12,
                  fontWeight: 700,
                }}
              >
                Giriş Yap
              </Link>
            </nav>
          </header>

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
                  padding: 38,
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
                  TÜRKİYE B2B MARKETPLACE
                </div>

                <h1
                  style={{
                    fontSize: 36,
                    lineHeight: 1.1,
                    margin: "0 0 18px",
                    fontWeight: 800,
                    textShadow: "0 8px 30px rgba(0,0,0,0.38)",
                  }}
                >
                  Teklif toplayın, güvenli ödeyin, tedarik sürecinizi tek panelden yönetin
                </h1>

                <p
                  style={{
                    fontSize: 19,
                    lineHeight: 1.75,
                    margin: "0 0 24px",
                    maxWidth: 680,
                    color: "rgba(255,255,255,0.96)",
                  }}
                >
                  Tedarik Pazarı; alıcıların ürün ve hizmet için teklif topladığı,
                  satıcıların hızlı teklif verdiği, ödeme ve sipariş sürecinin güvenli
                  şekilde yönetildiği B2B tedarik platformudur.
                </p>
                <div
  style={{
    display: "flex",
    gap: 10,
    marginBottom: 18,
    maxWidth: 560,
  }}
>
  <input
    placeholder="Ürün ara... örn: temizlik bezi, ambalaj, gıda"
    style={{
      flex: 1,
      height: 48,
      borderRadius: 12,
      border: "none",
      padding: "0 14px",
      fontSize: 15,
    }}
  />

  <Link
    to="/products"
    style={{
      textDecoration: "none",
      background: "#1d4ed8",
      color: "#fff",
      padding: "13px 22px",
      borderRadius: 12,
      fontWeight: 700,
    }}
  >
    Ara
  </Link>
</div>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    marginBottom: 22,
                  }}
                >
                  <div
  style={{
    display: "flex",
    gap: 10,
    marginTop: 22,
    maxWidth: 620,
    background: "white",
    padding: 8,
    borderRadius: 18,
  }}
  ></div> 
</div>

                

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginBottom: 26,
                  }}
                >
                  {["Verified Suppliers", "RFQ Destekli", "Türkiye + Avrupa"].map(
                    (item) => (
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
                  {statItems.map((item) => (
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
                borderRadius: 28,
                padding: 28,
                width: "100%",
                boxShadow: "0 20px 40px rgba(15, 23, 42, 0.16)",
                border: "1px solid rgba(226,232,240,0.8)",
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  color: "#4f46e5",
                  marginBottom: 10,
                  fontSize: 14,
                }}
              >
                ÖNE ÇIKAN AVANTAJLAR
              </div>

              <h2 style={{ margin: "0 0 18px", fontSize: 28 }}>
                Tedarik sürecinizi hızlandırın
              </h2>

              <div style={{ display: "grid", gap: 14 }}>
                {highlights.map((item) => (
                  <div
                    key={item.title}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e5e7eb",
                      borderRadius: 16,
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        marginBottom: 6,
                        color: "#111827",
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        color: "#6b7280",
                        lineHeight: 1.6,
                        fontSize: 15,
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
                  POPÜLER TEDARİK ALANLARI
                </div>
                <h2 style={{ margin: 0, fontSize: 30 }}>
                  Sık aranan sektörler ve kategoriler
                </h2>
              </div>

              <Link
                to="/products"
                style={{
                  textDecoration: "none",
                  color: "#93c5fd",
                  fontWeight: 700,
                }}
              >
                Tüm kategorileri incele
              </Link>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 16,
              }}
            >
              {sectors.map((sector) => (
  <div
    key={sector.title}
    onClick={() =>
      navigate(`/category/${encodeURIComponent(sector.title)}`)
    }
    style={{
      cursor: "pointer",
                    position: "relative",
                    minHeight: 180,
                    overflow: "hidden",
                    borderRadius: 20,
                    backgroundImage: `linear-gradient(180deg, rgba(8,17,32,0.20) 0%, rgba(8,17,32,0.82) 100%), url('${sector.image}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    border: "1px solid rgba(148, 163, 184, 0.14)",
                    padding: 18,
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
                      {sector.title.charAt(0)}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>
                      {sector.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: 28 }}>
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
                  ÖNE ÇIKAN ÜRÜNLER
                </div>
                <h2 style={{ margin: 0, fontSize: 30 }}>
                  Popüler toptan ürünler
                </h2>
              </div>

              <Link
                to="/products"
                style={{
                  textDecoration: "none",
                  color: "#93c5fd",
                  fontWeight: 700,
                }}
              >
                Tüm ürünleri görüntüle
              </Link>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 18,
              }}
            >
              {featuredProducts.length === 0 && (
  <div style={{ color: "white" }}>
    Ürün yükleniyor...
  </div>
)}
              {featuredProducts.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: "#ffffff",
                    color: "#111827",
                    borderRadius: 22,
                    overflow: "hidden",
                    boxShadow: "0 18px 36px rgba(15, 23, 42, 0.10)",
                    border: "1px solid rgba(226,232,240,0.7)",
                  }}
                >
                  <div
                    style={{
                      height: 220,
                      backgroundImage: `url('${item.image}')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />

                  <div style={{ padding: 20 }}>
                    <div
                      style={{
                        color: "#2563eb",
                        fontSize: 13,
                        fontWeight: 700,
                        marginBottom: 8,
                      }}
                    >
                      {item.category}
                    </div>

                    <h3 style={{ margin: "0 0 8px", fontSize: 22 }}>
                      {item.title}
                    </h3>

                    <div style={{ color: "#6b7280", marginBottom: 14 }}>
                      Toptan alım için uygun
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <strong style={{ fontSize: 20 }}>{item.price}</strong>

                      <Link
  to={`/product/${item.id}`}
  style={{
    textDecoration: "none",
    background: "#2563eb",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 700,
  }}
>
  İncele
</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 18,
              marginBottom: 28,
            }}
          >
            {steps.map((item) => (
              <div
                key={item.step}
                style={{
                  background: "#ffffff",
                  color: "#111827",
                  borderRadius: 22,
                  padding: 24,
                  boxShadow: "0 18px 36px rgba(15, 23, 42, 0.10)",
                  border: "1px solid rgba(226,232,240,0.7)",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 999,
                    display: "grid",
                    placeItems: "center",
                    background: "#dbeafe",
                    color: "#1d4ed8",
                    fontWeight: 800,
                    marginBottom: 14,
                  }}
                >
                  {item.step}
                </div>

                <h3 style={{ margin: "0 0 10px", fontSize: 20 }}>
                  {item.title}
                </h3>

                <p style={{ margin: 0, color: "#6b7280", lineHeight: 1.65 }}>
                  {item.description}
                </p>
              </div>
            ))}
          </section>

          <section style={{ marginBottom: 28 }}>
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
                  TEDARİKÇİLER
                </div>
                <h2 style={{ margin: 0, fontSize: 30 }}>
                  Doğrulanmış firmalar
                </h2>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 18,
              }}
            >
              {featuredSuppliers.map((item) => (
                <div
                  key={item.name}
                  style={{
                    background: "#ffffff",
                    color: "#111827",
                    borderRadius: 22,
                    overflow: "hidden",
                    boxShadow: "0 18px 36px rgba(15, 23, 42, 0.10)",
                    border: "1px solid rgba(226,232,240,0.7)",
                  }}
                >
                  <div
                    style={{
                      height: 210,
                      backgroundImage: `url('${item.image}')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div style={{ padding: 20 }}>
                    <div
                      style={{
                        display: "inline-block",
                        background: "#dbeafe",
                        color: "#1d4ed8",
                        padding: "8px 12px",
                        borderRadius: 999,
                        fontSize: 13,
                        fontWeight: 700,
                        marginBottom: 12,
                      }}
                    >
                      {item.badge}
                    </div>
                    <h3 style={{ margin: "0 0 8px", fontSize: 22 }}>
                      {item.name}
                    </h3>
                    <div style={{ color: "#6b7280" }}>{item.category}</div>
                  </div>
                </div>
              ))}
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
              borderRadius: 28,
              padding: 34,
              textAlign: "center",
              boxShadow: "0 24px 50px rgba(15, 23, 42, 0.20)",
            }}
          >
            <h2 style={{ margin: "0 0 12px", fontSize: 34 }}>
              Toplu alım yapmak mı istiyorsunuz?
            </h2>
            <p
              style={{
                margin: "0 auto 20px",
                maxWidth: 760,
                color: "#cbd5e1",
                lineHeight: 1.7,
                fontSize: 17,
              }}
            >
              İşletmenize uygun ürünler için teklif toplayın, tedarikçileri
              karşılaştırın ve satın alma sürecini daha planlı yönetin.
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
                  padding: "13px 20px",
                  borderRadius: 12,
                  fontWeight: 700,
                  boxShadow: "0 10px 24px rgba(34,197,94,0.24)",
                }}
              >
                Ücretsiz Başla
              </Link>
              <Link to="/buyer/rfqs/new" style={secondaryButtonStyle}>
              Tedarik Paneli
              </Link>
              <Link
                to="/products"
                style={{
                  textDecoration: "none",
                  background: "#ffffff",
                  color: "#0f172a",
                  padding: "13px 20px",
                  borderRadius: 12,
                  fontWeight: 700,
                }}
              >
                Panele Git
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}