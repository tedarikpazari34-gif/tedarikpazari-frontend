import {
  useEffect,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react";

import { TURKEY_CITIES } from "../constants/turkeyCities";

type CompanyProfile = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  description?: string | null;
  website?: string | null;
  logo?: string | null;
  banner?: string | null;
  verified?: boolean;
  status?: string;
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

export default function SellerProfilePage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Türkiye");
  const [logo, setLogo] = useState("");
  const [banner, setBanner] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError("Firma profilini görmek için giriş yapmalısınız.");
        return;
      }

      const res = await fetch(`${API}/company/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.message || "Firma bilgileri alınamadı.");
        return;
      }

      setProfile(data);
      setName(data.name || "");
      setDescription(data.description || "");
      setPhone(data.phone || "");
      setWebsite(data.website || "");
      setCity(data.city || "");
      setCountry(data.country || "Türkiye");
      setLogo(data.logo || "");
      setBanner(data.banner || "");
    } catch (err) {
      console.error("COMPANY PROFILE LOAD ERROR:", err);
      setError("Firma bilgileri yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const uploadImage = async (
    event: ChangeEvent<HTMLInputElement>,
    type: "logo" | "banner"
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Görsel en fazla 5 MB olabilir.");
      event.target.value = "";
      return;
    }

    try {
      setError("");
      setSuccess("");

      if (type === "logo") {
        setUploadingLogo(true);
      } else {
        setUploadingBanner(true);
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.message || "Görsel yüklenemedi.");
        return;
      }

      if (!data?.imageUrl) {
        setError("Yüklenen görsel adresi alınamadı.");
        return;
      }

      if (type === "logo") {
        setLogo(data.imageUrl);
      } else {
        setBanner(data.imageUrl);
      }

      setSuccess(
        type === "logo"
          ? "Logo yüklendi. Değişikliği kaydetmeyi unutmayın."
          : "Banner yüklendi. Değişikliği kaydetmeyi unutmayın."
      );
    } catch (err) {
      console.error("COMPANY IMAGE UPLOAD ERROR:", err);
      setError("Görsel yüklenirken hata oluştu.");
    } finally {
      setUploadingLogo(false);
      setUploadingBanner(false);
      event.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Firma adı zorunludur.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const res = await fetch(`${API}/company/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          phone: phone.trim(),
          website: website.trim(),
          city: city.trim(),
          country: country.trim(),
          logo,
          banner,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.message || "Firma profili güncellenemedi.");
        return;
      }

      setProfile(data);
      setSuccess("Firma profiliniz başarıyla güncellendi.");
    } catch (err) {
      console.error("COMPANY PROFILE SAVE ERROR:", err);
      setError("Firma profili kaydedilirken hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={stateCardStyle}>Firma profili yükleniyor...</div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <div style={eyebrowStyle}>SATICI PANELİ</div>
          <h1 style={heroTitleStyle}>Firma Profilim</h1>

          <p style={heroTextStyle}>
            Mağazanızda gösterilecek firma açıklamasını, logonuzu,
            banner görselinizi ve konum bilgilerinizi yönetin.
          </p>
        </div>

        <div style={statusCardStyle}>
          <span>Firma durumu</span>

          <strong>
            {profile?.verified
              ? "✓ Doğrulanmış Firma"
              : profile?.status === "PENDING"
                ? "Onay Bekliyor"
                : profile?.status || "-"}
          </strong>
        </div>
      </section>

      <section style={layoutStyle}>
        <article style={formCardStyle}>
          <div style={sectionHeaderStyle}>
            <div>
              <div style={sectionEyebrowStyle}>FİRMA BİLGİLERİ</div>
              <h2 style={sectionTitleStyle}>Profil bilgilerini düzenle</h2>
            </div>
          </div>

          {error && <div style={errorStyle}>{error}</div>}
          {success && <div style={successStyle}>{success}</div>}

          <label style={fieldStyle}>
            <span style={labelStyle}>Firma Adı *</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              style={inputStyle}
              maxLength={160}
            />
          </label>

          <label style={fieldStyle}>
            <span style={labelStyle}>Firma Açıklaması</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              style={textareaStyle}
              maxLength={3000}
              placeholder="Firmanızın faaliyet alanlarını, üretim gücünü ve ürün gruplarını anlatın."
            />
            <small style={helperStyle}>
              Bu açıklama public mağazanızda gösterilir.
            </small>
          </label>

          <div style={twoColumnStyle}>
            <label style={fieldStyle}>
              <span style={labelStyle}>Şehir</span>
              <select
                value={city}
                onChange={(event) => setCity(event.target.value)}
                style={inputStyle}
              >
                <option value="">Şehir seçin</option>

                {TURKEY_CITIES.map((cityName) => (
                  <option key={cityName} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
            </label>

            <label style={fieldStyle}>
              <span style={labelStyle}>Ülke</span>
              <input
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                style={inputStyle}
                maxLength={100}
              />
            </label>
          </div>

          <div style={privateSectionStyle}>
            <div style={privateTitleStyle}>🔒 Özel iletişim bilgileri</div>

            <p style={privateTextStyle}>
              Telefon ve web sitesi firma hesabınızda saklanır; public mağaza
              profilinde ve ürün sayfalarında gösterilmez.
            </p>

            <div style={twoColumnStyle}>
              <label style={fieldStyle}>
                <span style={labelStyle}>Telefon</span>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  style={inputStyle}
                  maxLength={30}
                  placeholder="05xx xxx xx xx"
                />
              </label>

              <label style={fieldStyle}>
                <span style={labelStyle}>Web Sitesi</span>
                <input
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  style={inputStyle}
                  maxLength={300}
                  placeholder="firma.com"
                />
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              ...saveButtonStyle,
              opacity: saving ? 0.65 : 1,
              cursor: saving ? "wait" : "pointer",
            }}
          >
            {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>
        </article>

        <aside style={mediaCardStyle}>
          <div style={sectionEyebrowStyle}>MAĞAZA GÖRSELLERİ</div>
          <h2 style={mediaTitleStyle}>Logo ve banner</h2>

          <div style={bannerPreviewStyle}>
            {banner ? (
              <img
                src={resolveImageUrl(banner)}
                alt="Firma banner"
                style={bannerImageStyle}
              />
            ) : (
              <div style={bannerPlaceholderStyle}>
                Banner görseli eklenmedi
              </div>
            )}
          </div>

          <label style={uploadButtonStyle}>
            {uploadingBanner ? "Banner yükleniyor..." : "Banner Yükle"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => uploadImage(event, "banner")}
              disabled={uploadingBanner}
              style={{ display: "none" }}
            />
          </label>

          <small style={helperStyle}>
            Önerilen ölçü: 1600 × 500 piksel. En fazla 5 MB.
          </small>

          <div style={logoSectionStyle}>
            <div style={logoPreviewStyle}>
              {logo ? (
                <img
                  src={resolveImageUrl(logo)}
                  alt="Firma logosu"
                  style={logoImageStyle}
                />
              ) : (
                <span>
                  {(name || "TP")
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((word) => word[0]?.toUpperCase())
                    .join("")}
                </span>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <strong>Firma logosu</strong>

              <p style={logoTextStyle}>
                Kare veya yatay logonuzu yükleyebilirsiniz.
              </p>

              <label style={secondaryUploadStyle}>
                {uploadingLogo ? "Logo yükleniyor..." : "Logo Yükle"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => uploadImage(event, "logo")}
                  disabled={uploadingLogo}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>

          {profile?.id && (
            <a
              href={`/store/${profile.id}`}
              target="_blank"
              rel="noreferrer"
              style={storeLinkStyle}
            >
              Public mağazamı görüntüle →
            </a>
          )}
        </aside>
      </section>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: "38px 20px 60px",
  background: "#f8fafc",
};

const heroStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
  padding: 32,
  borderRadius: 28,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 24,
  color: "#ffffff",
  background: "linear-gradient(135deg, #0f172a, #1d4ed8)",
  boxShadow: "0 24px 50px rgba(15,23,42,0.18)",
};

const eyebrowStyle: CSSProperties = {
  color: "#93c5fd",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 1.2,
};

const heroTitleStyle: CSSProperties = {
  margin: "8px 0 10px",
  fontSize: "clamp(32px, 5vw, 48px)",
};

const heroTextStyle: CSSProperties = {
  maxWidth: 660,
  margin: 0,
  color: "#dbeafe",
  lineHeight: 1.7,
};

const statusCardStyle: CSSProperties = {
  minWidth: 210,
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  borderRadius: 18,
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.18)",
};

const layoutStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.7fr) minmax(300px, 1fr)",
  gap: 24,
};

const formCardStyle: CSSProperties = {
  padding: 30,
  borderRadius: 24,
  background: "#ffffff",
  boxShadow: "0 18px 42px rgba(15,23,42,0.07)",
};

const mediaCardStyle: CSSProperties = {
  padding: 28,
  borderRadius: 24,
  background: "#ffffff",
  boxShadow: "0 18px 42px rgba(15,23,42,0.07)",
};

const sectionHeaderStyle: CSSProperties = {
  marginBottom: 24,
};

const sectionEyebrowStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 1.1,
};

const sectionTitleStyle: CSSProperties = {
  margin: "7px 0 0",
  color: "#0f172a",
  fontSize: 28,
};

const mediaTitleStyle: CSSProperties = {
  margin: "7px 0 20px",
  color: "#0f172a",
};

const fieldStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  marginBottom: 18,
};

const labelStyle: CSSProperties = {
  color: "#334155",
  fontSize: 14,
  fontWeight: 800,
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  fontSize: 15,
  outline: "none",
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: 150,
  resize: "vertical",
  lineHeight: 1.6,
};

const twoColumnStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
};

const helperStyle: CSSProperties = {
  color: "#64748b",
  lineHeight: 1.5,
};

const privateSectionStyle: CSSProperties = {
  margin: "8px 0 22px",
  padding: 20,
  borderRadius: 16,
  border: "1px solid #dbeafe",
  background: "#eff6ff",
};

const privateTitleStyle: CSSProperties = {
  color: "#1e3a8a",
  fontWeight: 900,
};

const privateTextStyle: CSSProperties = {
  color: "#475569",
  lineHeight: 1.65,
};

const saveButtonStyle: CSSProperties = {
  width: "100%",
  height: 52,
  border: 0,
  borderRadius: 14,
  color: "#ffffff",
  background: "#2563eb",
  fontSize: 16,
  fontWeight: 900,
};

const bannerPreviewStyle: CSSProperties = {
  height: 180,
  overflow: "hidden",
  borderRadius: 18,
  background: "#e2e8f0",
  marginBottom: 14,
};

const bannerImageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const bannerPlaceholderStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "grid",
  placeItems: "center",
  color: "#64748b",
  background: "linear-gradient(135deg, #dbeafe, #e2e8f0)",
};

const uploadButtonStyle: CSSProperties = {
  display: "block",
  padding: "12px 16px",
  marginBottom: 8,
  borderRadius: 12,
  background: "#0f172a",
  color: "#ffffff",
  textAlign: "center",
  fontWeight: 800,
  cursor: "pointer",
};

const logoSectionStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  marginTop: 30,
  paddingTop: 24,
  borderTop: "1px solid #e2e8f0",
};

const logoPreviewStyle: CSSProperties = {
  width: 92,
  height: 92,
  flexShrink: 0,
  overflow: "hidden",
  borderRadius: 20,
  display: "grid",
  placeItems: "center",
  color: "#1d4ed8",
  background: "#dbeafe",
  fontSize: 27,
  fontWeight: 900,
};

const logoImageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const logoTextStyle: CSSProperties = {
  margin: "7px 0 12px",
  color: "#64748b",
  fontSize: 13,
  lineHeight: 1.5,
};

const secondaryUploadStyle: CSSProperties = {
  display: "inline-block",
  padding: "9px 13px",
  borderRadius: 10,
  color: "#1d4ed8",
  background: "#dbeafe",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
};

const storeLinkStyle: CSSProperties = {
  display: "block",
  marginTop: 28,
  padding: "13px 16px",
  borderRadius: 12,
  color: "#1d4ed8",
  background: "#eff6ff",
  textAlign: "center",
  textDecoration: "none",
  fontWeight: 800,
};

const errorStyle: CSSProperties = {
  marginBottom: 18,
  padding: 14,
  borderRadius: 12,
  color: "#991b1b",
  background: "#fee2e2",
};

const successStyle: CSSProperties = {
  marginBottom: 18,
  padding: 14,
  borderRadius: 12,
  color: "#166534",
  background: "#dcfce7",
};

const stateCardStyle: CSSProperties = {
  maxWidth: 760,
  margin: "40px auto",
  padding: 34,
  borderRadius: 22,
  background: "#ffffff",
  boxShadow: "0 18px 42px rgba(15,23,42,0.08)",
};
