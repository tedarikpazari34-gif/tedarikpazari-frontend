import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const sectors = [
  { title: "Ambalaj ve Paketleme", image: "/images/category-ambalaj.jpg" },
  { title: "Temizlik ve Hijyen", image: "/images/category-temizlik.jpg" },
  { title: "Gıda ve Horeca", image: "/images/category-gida.jpg" },
  { title: "Elektrik ve Aydınlatma", image: "/images/category-elektrik.jpg" },
  { title: "İş Güvenliği", image: "/images/category-is-guvenligi.jpg" },
  { title: "Otomotiv ve Yedek Parça", image: "/images/category-otomotiv.jpg" },
  { title: "Hırdavat", image: "/images/category-hirdavat.jpg" },
  { title: "Lojistik ve Depolama", image: "/images/category-lojistik.jpg" },
];

const highlights = [
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

const steps = [
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

const featuredProducts = [
  {
    title: "Endüstriyel Koli Bandı",
    category: "Ambalaj",
    price: "₺100+",
    image: "/images/product-1.jpg",
  },
  {
    title: "Hijyenik Kağıt Ürünleri",
    category: "Temizlik",
    price: "₺250+",
    image: "/images/product-2.jpg",
  },
  {
    title: "LED Armatür Seti",
    category: "Elektrik",
    price: "₺450+",
    image: "/images/product-3.jpg",
  },
];

const featuredSuppliers = [
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

const statItems = [
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

export default function HomePage() {
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
                to="/uyelik"
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
                to="/panel"
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
              gridTemplateColumns: "1.35fr 0.95fr",
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
                    fontSize: 58,
                    lineHeight: 1.03,
                    margin: "0 0 18px",
                    fontWeight: 800,
                    textShadow: "0 8px 30px rgba(0,0,0,0.38)",
                  }}
                >
                  İşletmeler için güvenli toptan tedarik platformu
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
                  Tedarikçileri keşfedin, ürünleri inceleyin, teklif isteyin ve
                  satın alma sürecinizi tek platform üzerinden daha verimli
                  yönetin.
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    marginBottom: 22,
                  }}
                >
                  <Link to="/uyelik" style={primaryButtonStyle}>
                    Hemen Başla
                  </Link>

                  <Link to="/panel" style={secondaryButtonStyle}>
                    Tedarik Paneli
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
                    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
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
                to="/panel"
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
                  style={{
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
                to="/panel"
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
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 18,
              }}
            >
              {featuredProducts.map((item) => (
                <div
                  key={item.title}
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
                        to="/panel"
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
              gridTemplateColumns: "repeat(3, 1fr)",
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
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
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
                to="/uyelik"
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

              <Link
                to="/panel"
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