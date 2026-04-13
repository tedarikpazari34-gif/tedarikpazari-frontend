import { Helmet } from "react-helmet-async";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>
          Tedarik Pazarı | İşletmeler için B2B Toptan Tedarik Platformu
        </title>
        <meta
          name="description"
          content="Tedarik Pazarı ile işletmeniz için toptan ürünleri keşfedin, tedarikçilerden teklif alın ve B2B satın alma sürecinizi yönetin."
        />
        <link rel="canonical" href="https://tedarikpazari.com/" />
        <meta property="og:title" content="Tedarik Pazarı" />
        <meta property="og:description" content="B2B tedarik platformu" />
        <meta property="og:url" content="https://tedarikpazari.com/" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          color: "#fff",
          padding: "40px 24px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              background: "red",
              color: "#fff",
              padding: 12,
              fontWeight: 700,
              marginBottom: 24,
            }}
          >
            HOMEPAGE ÇALIŞIYOR
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 32,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <h2 style={{ margin: 0, color: "#38bdf8" }}>TEDARİKÇİ</h2>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a
                href="/uyelik"
                style={{
                  background: "#22c55e",
                  color: "#fff",
                  textDecoration: "none",
                  padding: "10px 16px",
                  borderRadius: 10,
                  fontWeight: 600,
                }}
              >
                Üye Ol
              </a>

              <a
                href="/panel"
                style={{
                  background: "#1d4ed8",
                  color: "#fff",
                  textDecoration: "none",
                  padding: "10px 16px",
                  borderRadius: 10,
                  fontWeight: 600,
                }}
              >
                Giriş Yap
              </a>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr",
              gap: 24,
              alignItems: "stretch",
            }}
          >
            <div
              style={{
                borderRadius: 24,
                padding: 32,
                background: "linear-gradient(135deg, #1d4ed8, #06b6d4)",
              }}
            >
              <div
                style={{
                  opacity: 0.85,
                  letterSpacing: 2,
                  marginBottom: 12,
                }}
              >
                TÜRKİYE B2B MARKETPLACE
              </div>

              <h1
                style={{
                  fontSize: 52,
                  lineHeight: 1.1,
                  margin: "0 0 16px 0",
                }}
              >
                İşletmeler için güvenli toptan tedarik platformu
              </h1>

              <p
                style={{
                  fontSize: 18,
                  opacity: 0.95,
                  maxWidth: 700,
                  marginBottom: 24,
                }}
              >
                Tedarikçileri keşfedin, ürünleri inceleyin, teklif isteyin ve
                ticaretinizi tek platformdan yönetin.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a
                  href="/uyelik"
                  style={{
                    background: "#22c55e",
                    color: "#fff",
                    textDecoration: "none",
                    padding: "12px 18px",
                    borderRadius: 12,
                    fontWeight: 700,
                  }}
                >
                  Üye Ol
                </a>

                <a
                  href="/panel"
                  style={{
                    background: "#fff",
                    color: "#0f172a",
                    textDecoration: "none",
                    padding: "12px 18px",
                    borderRadius: 12,
                    fontWeight: 700,
                  }}
                >
                  Paneli Aç
                </a>
              </div>
            </div>

            <div
              style={{
                background: "#fff",
                color: "#111827",
                borderRadius: 24,
                padding: 28,
              }}
            >
              <h3 style={{ marginTop: 0 }}>Öne Çıkan Avantajlar</h3>

              <div style={{ display: "grid", gap: 14 }}>
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e5e7eb",
                    borderRadius: 14,
                    padding: 16,
                  }}
                >
                  <strong>Tedarikçi doğrulama</strong>
                  <div style={{ marginTop: 6, color: "#6b7280" }}>
                    Platform dışı iletişimi azaltan güvenli tedarik modeli.
                  </div>
                </div>

                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e5e7eb",
                    borderRadius: 14,
                    padding: 16,
                  }}
                >
                  <strong>Teklif toplama</strong>
                  <div style={{ marginTop: 6, color: "#6b7280" }}>
                    RFQ sistemi ile çoklu satıcıdan fiyat alma altyapısı.
                  </div>
                </div>

                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e5e7eb",
                    borderRadius: 14,
                    padding: 16,
                  }}
                >
                  <strong>Kategori bazlı keşif</strong>
                  <div style={{ marginTop: 6, color: "#6b7280" }}>
                    Temizlikten ambalaja kadar işletmeler için organize tedarik.
                  </div>
                </div>

                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e5e7eb",
                    borderRadius: 14,
                    padding: 16,
                  }}
                >
                  <strong>Kurumsal alım deneyimi</strong>
                  <div style={{ marginTop: 6, color: "#6b7280" }}>
                    Sipariş, teklif ve ürün yönetimini tek panelde toplayın.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}