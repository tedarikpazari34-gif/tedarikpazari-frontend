import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";

type ProductImage = {
  id?: string;
  url?: string;
  isCover?: boolean;
  sortOrder?: number;
};

type Product = {
  id: string;
  title?: string;
  description?: string | null;
  imageUrl?: string | null;
  basePrice?: number | string;
  unitType?: string;
  moq?: number;
  leadTimeDays?: number | null;
  images?: ProductImage[];
};

type SellerReview = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt?: string;
};

type Company = {
  id: string;
  name: string;
  logo?: string | null;
  banner?: string | null;
  description?: string | null;
  website?: string | null;
  city?: string | null;
  country?: string | null;
  verified?: boolean;
  status?: string;
  responseTime?: number;
  completedDeals?: number;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  products?: Product[];
  sellerReviews?: SellerReview[];
};

const API =
  import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

const BACKEND_ORIGIN = API.replace(/\/api\/?$/, "");

function resolveImageUrl(value?: string | null) {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `${BACKEND_ORIGIN}${value.startsWith("/") ? value : `/${value}`}`;
}

function getProductImage(product: Product) {
  const cover = product.images?.find((image) => image.isCover)?.url;
  const firstImage = product.images?.[0]?.url;

  return resolveImageUrl(cover || firstImage || product.imageUrl);
}

function formatPrice(value?: number | string) {
  return `${Number(value || 0).toLocaleString("tr-TR")} ₺`;
}

function formatWebsite(value?: string | null) {
  if (!value) return null;

  const href =
    value.startsWith("http://") || value.startsWith("https://")
      ? value
      : `https://${value}`;

  return {
    href,
    label: value.replace(/^https?:\/\//, "").replace(/\/$/, ""),
  };
}

export default function SellerStorePage() {
  const { id } = useParams();

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCompany = async () => {
      if (!id) {
        setError("Firma bilgisi bulunamadı.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API}/company/${id}/public`);
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          setError(data?.message || "Firma bilgileri alınamadı.");
          setCompany(null);
          return;
        }

        setCompany(data);
      } catch (err) {
        console.error("SELLER STORE LOAD ERROR:", err);
        setError("Firma bilgileri alınırken hata oluştu.");
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };

    loadCompany();
  }, [id]);

  const website = useMemo(
    () => formatWebsite(company?.website),
    [company?.website]
  );

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={stateCardStyle}>Mağaza yükleniyor...</div>
      </main>
    );
  }

  if (error || !company) {
    return (
      <main style={pageStyle}>
        <div style={stateCardStyle}>
          <h1 style={{ marginTop: 0 }}>Firma bulunamadı</h1>
          <p>{error || "Bu mağaza artık görüntülenemiyor."}</p>
          <Link to="/" style={primaryLinkStyle}>
            Ana sayfaya dön
          </Link>
        </div>
      </main>
    );
  }

  const products = company.products || [];
  const reviews = company.sellerReviews || [];
  const rating = Number(company.rating || 0);
  const bannerUrl = resolveImageUrl(company.banner);
  const logoUrl = resolveImageUrl(company.logo);
  const initials = company.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <main style={pageStyle}>
      <Helmet>
        <title>{company.name} | Tedarik Pazarı</title>
        <meta
          name="description"
          content={
            company.description ||
            `${company.name} ürünlerini, firma bilgilerini ve değerlendirmelerini inceleyin.`
          }
        />
        <link
          rel="canonical"
          href={`https://xn--tedarikpazar-d5b.com/store/${company.id}`}
        />
      </Helmet>

      <section style={heroCardStyle}>
        <div
          style={{
            ...bannerStyle,
            ...(bannerUrl
              ? {
                  backgroundImage: `linear-gradient(rgba(15,23,42,0.24), rgba(15,23,42,0.68)), url("${bannerUrl}")`,
                }
              : {}),
          }}
        />

        <div style={profileSectionStyle}>
          <div style={identityStyle}>
            <div style={logoShellStyle}>
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`${company.name} logosu`}
                  style={logoImageStyle}
                />
              ) : (
                <span>{initials || "TP"}</span>
              )}
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={titleRowStyle}>
                <h1 style={companyTitleStyle}>{company.name}</h1>

                {company.verified && (
                  <span style={verifiedStyle}>✓ Onaylı Tedarikçi</span>
                )}
              </div>

              <p style={locationStyle}>
                📍 {[company.city, company.country || "Türkiye"]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </div>

          <div style={metricGridStyle}>
            <Metric
              label="Ortalama Puan"
              value={rating > 0 ? `⭐ ${rating.toFixed(1)}` : "Yeni"}
            />
            <Metric
              label="Değerlendirme"
              value={company.reviewCount || reviews.length}
            />
            <Metric label="Tamamlanan Satış" value={company.completedDeals || 0} />
            <Metric label="Aktif Ürün" value={products.length} />
          </div>
        </div>
      </section>

      <section style={contentGridStyle}>
        <article style={aboutCardStyle}>
          <div style={sectionHeaderStyle}>
            <div>
              <div style={eyebrowStyle}>FİRMA PROFİLİ</div>
              <h2 style={sectionTitleStyle}>Firma hakkında</h2>
            </div>
          </div>

          <p style={descriptionStyle}>
            {company.description ||
              "Firma açıklaması henüz eklenmedi. Satıcı, şirket faaliyetlerini ve ürün gruplarını yakında burada paylaşabilir."}
          </p>

          <div style={detailGridStyle}>
            <Detail
              label="Üyelik tarihi"
              value={
                company.createdAt
                  ? new Date(company.createdAt).toLocaleDateString("tr-TR")
                  : "-"
              }
            />
            <Detail
              label="Yanıt süresi"
              value={
                company.responseTime
                  ? `${company.responseTime} saat`
                  : "Henüz ölçülmedi"
              }
            />
            <Detail
              label="Firma durumu"
              value={company.verified ? "Doğrulandı" : "Doğrulama bekliyor"}
            />
            <Detail
              label="Web sitesi"
              value={
                website ? (
                  <a
                    href={website.href}
                    target="_blank"
                    rel="noreferrer"
                    style={websiteLinkStyle}
                  >
                    {website.label}
                  </a>
                ) : (
                  "Eklenmedi"
                )
              }
            />
          </div>
        </article>

        <aside style={trustCardStyle}>
          <div style={trustIconStyle}>🛡️</div>
          <h2 style={trustTitleStyle}>Güvenli tedarik</h2>

          <div style={trustListStyle}>
            <div>✓ Firma bilgileri yönetici kontrolünden geçer.</div>
            <div>✓ Teklif ve sipariş işlemleri platform içinde kayıt altındadır.</div>
            <div>✓ Ödemeler güvenli ödeme altyapısı üzerinden gerçekleştirilir.</div>
            <div>✓ Alıcılar tamamlanan siparişlerden sonra değerlendirme yapabilir.</div>
          </div>

          <Link to="/yardim" style={secondaryLinkStyle}>
            Güvenli ticaret hakkında bilgi al
          </Link>
        </aside>
      </section>

      <section style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <div style={eyebrowStyle}>ÜRÜN KATALOĞU</div>
            <h2 style={sectionTitleStyle}>Satıcının ürünleri</h2>
          </div>

          <span style={countBadgeStyle}>{products.length} aktif ürün</span>
        </div>

        {products.length === 0 ? (
          <div style={emptyStyle}>
            <div style={{ fontSize: 44 }}>📦</div>
            <h3 style={{ marginBottom: 6 }}>Henüz yayınlanmış ürün yok</h3>
            <p style={{ margin: 0, color: "#64748b" }}>
              Onaylanan ürünler bu bölümde görüntülenecek.
            </p>
          </div>
        ) : (
          <div style={productGridStyle}>
            {products.map((product) => {
              const imageUrl = getProductImage(product);

              return (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  style={productLinkStyle}
                >
                  <article style={productCardStyle}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.title || "Ürün"}
                        style={productImageStyle}
                      />
                    ) : (
                      <div style={productPlaceholderStyle}>📦</div>
                    )}

                    <div style={productBodyStyle}>
                      <div style={productMetaStyle}>
                        {product.unitType || "Birim belirtilmedi"}
                      </div>

                      <h3 style={productTitleStyle}>
                        {product.title || "Ürün"}
                      </h3>

                      <p style={productDescriptionStyle}>
                        {product.description ||
                          "Ürün detaylarını görüntülemek için karta tıklayın."}
                      </p>

                      <div style={productFooterStyle}>
                        <strong style={priceStyle}>
                          {formatPrice(product.basePrice)}
                        </strong>

                        <span style={moqStyle}>
                          Min. {product.moq || 1} {product.unitType || "adet"}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <div style={eyebrowStyle}>MÜŞTERİ DENEYİMİ</div>
            <h2 style={sectionTitleStyle}>Son değerlendirmeler</h2>
          </div>

          <span style={countBadgeStyle}>
            {company.reviewCount || reviews.length} değerlendirme
          </span>
        </div>

        {reviews.length === 0 ? (
          <div style={emptyStyle}>
            <div style={{ fontSize: 42 }}>⭐</div>
            <h3 style={{ marginBottom: 6 }}>Henüz değerlendirme yok</h3>
            <p style={{ margin: 0, color: "#64748b" }}>
              Tamamlanan ilk siparişten sonra alıcı yorumu burada görünecek.
            </p>
          </div>
        ) : (
          <div style={reviewGridStyle}>
            {reviews.map((review) => (
              <article key={review.id} style={reviewCardStyle}>
                <div style={reviewTopStyle}>
                  <strong>{"⭐".repeat(Math.max(1, review.rating))}</strong>

                  <span style={reviewDateStyle}>
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString("tr-TR")
                      : ""}
                  </span>
                </div>

                <p style={reviewTextStyle}>
                  {review.comment || "Alıcı yalnızca puan verdi."}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div style={metricStyle}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | number | React.ReactNode;
}) {
  return (
    <div style={detailStyle}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: "32px 20px 60px",
};

const heroCardStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  overflow: "hidden",
  borderRadius: 28,
  background: "#ffffff",
  boxShadow: "0 24px 55px rgba(15,23,42,0.10)",
};

const bannerStyle: CSSProperties = {
  height: 260,
  background:
    "linear-gradient(135deg, rgba(37,99,235,1), rgba(30,64,175,1) 55%, rgba(15,23,42,1))",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const profileSectionStyle: CSSProperties = {
  padding: "0 32px 30px",
};

const identityStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  gap: 22,
  marginTop: -58,
};

const logoShellStyle: CSSProperties = {
  width: 118,
  height: 118,
  flexShrink: 0,
  display: "grid",
  placeItems: "center",
  overflow: "hidden",
  borderRadius: 26,
  border: "6px solid #ffffff",
  background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
  color: "#1d4ed8",
  fontSize: 34,
  fontWeight: 900,
  boxShadow: "0 14px 30px rgba(15,23,42,0.16)",
};

const logoImageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const titleRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 12,
  paddingBottom: 6,
};

const companyTitleStyle: CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: "clamp(30px, 5vw, 46px)",
  lineHeight: 1.1,
};

const verifiedStyle: CSSProperties = {
  padding: "8px 13px",
  borderRadius: 999,
  background: "#dcfce7",
  color: "#166534",
  fontSize: 13,
  fontWeight: 800,
};

const locationStyle: CSSProperties = {
  margin: 0,
  color: "#64748b",
  fontSize: 15,
};

const metricGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 12,
  marginTop: 28,
};

const metricStyle: CSSProperties = {
  padding: 18,
  borderRadius: 16,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const contentGridStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "24px auto 0",
  display: "grid",
  gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)",
  gap: 24,
};

const aboutCardStyle: CSSProperties = {
  padding: 30,
  borderRadius: 24,
  background: "#ffffff",
  boxShadow: "0 18px 40px rgba(15,23,42,0.07)",
};

const trustCardStyle: CSSProperties = {
  padding: 28,
  borderRadius: 24,
  background: "linear-gradient(145deg, #eff6ff, #ffffff)",
  border: "1px solid #dbeafe",
};

const trustIconStyle: CSSProperties = {
  width: 54,
  height: 54,
  display: "grid",
  placeItems: "center",
  borderRadius: 16,
  background: "#dbeafe",
  fontSize: 26,
};

const trustTitleStyle: CSSProperties = {
  margin: "18px 0 12px",
  color: "#0f172a",
  fontSize: 24,
};

const trustListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 13,
  color: "#475569",
  lineHeight: 1.6,
};

const sectionStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "24px auto 0",
  padding: 30,
  borderRadius: 24,
  background: "#ffffff",
  boxShadow: "0 18px 40px rgba(15,23,42,0.07)",
};

const sectionHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  flexWrap: "wrap",
  gap: 16,
  marginBottom: 22,
};

const eyebrowStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 1.2,
};

const sectionTitleStyle: CSSProperties = {
  margin: "6px 0 0",
  color: "#0f172a",
  fontSize: "clamp(25px, 4vw, 34px)",
};

const descriptionStyle: CSSProperties = {
  margin: 0,
  color: "#475569",
  lineHeight: 1.8,
  fontSize: 16,
};

const detailGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 12,
  marginTop: 24,
};

const detailStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  padding: 16,
  borderRadius: 14,
  background: "#f8fafc",
};

const websiteLinkStyle: CSSProperties = {
  color: "#2563eb",
  textDecoration: "none",
};

const primaryLinkStyle: CSSProperties = {
  display: "inline-block",
  marginTop: 12,
  padding: "11px 16px",
  borderRadius: 10,
  background: "#2563eb",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 800,
};

const secondaryLinkStyle: CSSProperties = {
  display: "inline-block",
  marginTop: 22,
  color: "#2563eb",
  textDecoration: "none",
  fontWeight: 800,
};

const countBadgeStyle: CSSProperties = {
  padding: "8px 12px",
  borderRadius: 999,
  background: "#eff6ff",
  color: "#1d4ed8",
  fontSize: 13,
  fontWeight: 800,
};

const productGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
  gap: 20,
};

const productLinkStyle: CSSProperties = {
  color: "inherit",
  textDecoration: "none",
};

const productCardStyle: CSSProperties = {
  height: "100%",
  overflow: "hidden",
  borderRadius: 18,
  border: "1px solid #e2e8f0",
  background: "#ffffff",
  boxShadow: "0 8px 22px rgba(15,23,42,0.05)",
};

const productImageStyle: CSSProperties = {
  width: "100%",
  height: 190,
  objectFit: "cover",
  background: "#f1f5f9",
};

const productPlaceholderStyle: CSSProperties = {
  height: 190,
  display: "grid",
  placeItems: "center",
  background: "#f1f5f9",
  fontSize: 48,
};

const productBodyStyle: CSSProperties = {
  padding: 18,
};

const productMetaStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
};

const productTitleStyle: CSSProperties = {
  margin: "8px 0",
  color: "#0f172a",
  fontSize: 19,
};

const productDescriptionStyle: CSSProperties = {
  minHeight: 48,
  margin: 0,
  overflow: "hidden",
  color: "#64748b",
  lineHeight: 1.5,
  fontSize: 14,
};

const productFooterStyle: CSSProperties = {
  marginTop: 16,
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: 12,
};

const priceStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 20,
};

const moqStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 12,
  textAlign: "right",
};

const reviewGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 16,
};

const reviewCardStyle: CSSProperties = {
  padding: 20,
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
};

const reviewTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
};

const reviewDateStyle: CSSProperties = {
  color: "#94a3b8",
  fontSize: 12,
};

const reviewTextStyle: CSSProperties = {
  marginBottom: 0,
  color: "#475569",
  lineHeight: 1.65,
};

const emptyStyle: CSSProperties = {
  padding: "44px 20px",
  borderRadius: 18,
  border: "1px dashed #cbd5e1",
  background: "#f8fafc",
  textAlign: "center",
};

const stateCardStyle: CSSProperties = {
  maxWidth: 720,
  margin: "40px auto",
  padding: 36,
  borderRadius: 22,
  background: "#ffffff",
  boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
};
