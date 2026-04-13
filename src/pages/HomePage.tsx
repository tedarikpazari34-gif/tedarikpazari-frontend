import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const sectors = [
  "Ambalaj ve Paketleme",
  "Temizlik ve Hijyen",
  "Gıda ve Horeca",
  "Elektrik ve Aydınlatma",
  "İş Güvenliği",
  "Otomotiv ve Yedek Parça",
  "Hırdavat",
  "Lojistik ve Depolama",
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
                  letterSpacing: 0.2,
                }}
              >
                TEDARİKÇİ
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
              gridTemplateColumns: "1.45fr 0.95fr",
              gap: 24,
              alignItems: "stretch",
              marginBottom: 28,
            }}
          >
            <div
              style={{
                borderRadius: 28,
                padding: 36,
                background: "linear-gradient(135deg, #1d4ed8 0%, #06b6d4 100%)",
                boxShadow: "0 30px 60px rgba(2, 132, 199, 0.22)",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.16)",
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 18,
                  letterSpacing: 0.4,
                }}
              >
                TÜRKİYE B2B MARKETPLACE
              </div>

              <h1
                style={{
                  fontSize: 56,
                  lineHeight: 1.05,
                  margin: "0 0 18px",
                  fontWeight: 800,
                  maxWidth: 760,
                }}
              >
                İşletmeler için güvenli toptan tedarik platformu
              </h1>

              <p
                style={{
                  fontSize: 19,
                  lineHeight: 1.7,
                  margin: "0 0 22px",
                  maxWidth: 760,
                  color: "rgba(255,255,255,0.95)",
                }}
              >
                Tedarikçileri keşfedin, ürünleri inceleyin, teklif isteyin ve
                satın alma sürecinizi tek platform üzerinden daha verimli yönetin.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  marginBottom: 20,
                }}
              >
                <Link
                  to="/uyelik"
                  style={{
                    textDecoration: "none",
                    background: "#84cc16",
                    color: "#fff",
                    padding: "13px 20px",
                    borderRadius: 12,
                    fontWeight: 700,
                  }}
                >
                  Hemen Başla
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
                  Tedarik Paneli
                </Link>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                {["Verified Suppliers", "RFQ Destekli", "Türkiye + Avrupa"].map(
                  (item) => (
                    <span
                      key={item}
                      style={{
                        background: "rgba(255,255,255,0.18)",
                        padding: "10px 14px",
                        borderRadius: 999,
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>

            <div
              style={{
                background: "#ffffff",
                color: "#0f172a",
                borderRadius: 28,
                padding: 28,
                boxShadow: "0 20px 40px rgba(15, 23, 42, 0.16)",
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
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              {sectors.map((sector) => (
                <div
                  key={sector}
                  style={{
                    background: "#111c31",
                    border: "1px solid rgba(148, 163, 184, 0.14)",
                    borderRadius: 18,
                    padding: 18,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      display: "grid",
                      placeItems: "center",
                      background: "rgba(56, 189, 248, 0.12)",
                      color: "#38bdf8",
                      fontWeight: 800,
                      marginBottom: 14,
                    }}
                  >
                    {sector.charAt(0)}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>{sector}</div>
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

          <section
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #172554 100%)",
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