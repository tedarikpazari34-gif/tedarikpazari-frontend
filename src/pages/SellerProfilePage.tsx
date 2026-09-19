import {
  useEffect,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react";

import { TURKEY_CITIES } from "../constants/turkeyCities";
import { COUNTRIES } from "../constants/countries";
import { sectors } from "../data/sectors";
import { useTranslation } from "react-i18next";

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
  taxNumber?: string | null;
  taxOffice?: string | null;
  hasPaymentIdentityNumber?: boolean;
  address?: {
    address?: string;
    district?: string;
    postalCode?: string;
    companyType?: string;
    fullName?: string;
    category?: string;
    categories?: string[];
  } | null;
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
  const { t } = useTranslation();

  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= 768
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [profile, setProfile] = useState<CompanyProfile | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Türkiye");
  const [logo, setLogo] = useState("");
  const [banner, setBanner] = useState("");

  const [fullName, setFullName] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [district, setDistrict] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");
  const [taxOffice, setTaxOffice] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [paymentIdentityNumber, setPaymentIdentityNumber] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

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
        setError(t("sellerProfilePage.loginRequired"));
        return;
      }

      const res = await fetch(`${API}/company/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.message || t("sellerProfilePage.loadFailed"));
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
      setFullName(data.address?.fullName || "");
      setCompanyType(data.address?.companyType || "");
      setDistrict(data.address?.district || "");
      setPostalCode(data.address?.postalCode || "");
      setAddress(data.address?.address || "");
      setTaxOffice(data.taxOffice || "");
      setTaxNumber(data.taxNumber || "");
      setPaymentIdentityNumber("");
      setCategories(
        Array.isArray(data.address?.categories)
          ? data.address.categories
          : data.address?.category
            ? [data.address.category]
            : []
      );
    } catch (err) {
      console.error("COMPANY PROFILE LOAD ERROR:", err);
      setError(t("sellerProfilePage.loadError"));
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
      setError(t("sellerProfilePage.imageTooLarge"));
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
        setError(data?.message || t("sellerProfilePage.imageUploadFailed"));
        return;
      }

      if (!data?.imageUrl) {
        setError(t("sellerProfilePage.imageUrlMissing"));
        return;
      }

      if (type === "logo") {
        setLogo(data.imageUrl);
      } else {
        setBanner(data.imageUrl);
      }

      setSuccess(
        type === "logo"
          ? t("sellerProfilePage.logoUploaded")
          : t("sellerProfilePage.bannerUploaded")
      );
    } catch (err) {
      console.error("COMPANY IMAGE UPLOAD ERROR:", err);
      setError(t("sellerProfilePage.imageUploadError"));
    } finally {
      setUploadingLogo(false);
      setUploadingBanner(false);
      event.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError(t("sellerProfilePage.companyNameRequired"));
      return;
    }

    if (
      !fullName.trim() ||
      !companyType.trim() ||
      !country.trim() ||
      !city.trim() ||
      !district.trim() ||
      !address.trim() ||
      !taxOffice.trim() ||
      categories.length < 1
    ) {
      setError(t("sellerProfilePage.legalFieldsRequired"));
      return;
    }

    if (categories.length > 3) {
      setError(t("sellerProfilePage.maxCategories"));
      return;
    }

    if (country === "Türkiye" && companyType === "Şahıs") {
      const identityNumber = paymentIdentityNumber.trim();

      if (!profile?.hasPaymentIdentityNumber && !identityNumber) {
        setError(t("registerPage.identityNumberRequired"));
        return;
      }

      if (identityNumber && !/^\d{11}$/.test(identityNumber)) {
        setError(t("registerPage.invalidIdentityNumber"));
        return;
      }
    }

    if (
      country === "Türkiye" &&
      (companyType === "Limited" || companyType === "Anonim") &&
      !/^\d{10}$/.test(taxNumber.trim())
    ) {
      setError(t("registerPage.invalidTaxNumber"));
      return;
    }

    if (country !== "Türkiye" && !taxNumber.trim()) {
      setError(t("registerPage.internationalTaxNumberRequired"));
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
          fullName: fullName.trim(),
          companyType: companyType.trim(),
          district: district.trim(),
          postalCode: postalCode.trim(),
          address: address.trim(),
          taxOffice: taxOffice.trim(),
          taxNumber:
            country === "Türkiye" && companyType === "Şahıs"
              ? undefined
              : taxNumber.trim(),
          paymentIdentityNumber:
            country === "Türkiye" &&
            companyType === "Şahıs" &&
            paymentIdentityNumber.trim()
              ? paymentIdentityNumber.trim()
              : undefined,
          categories,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.message || t("sellerProfilePage.saveFailed"));
        return;
      }

      setProfile(data);
      setPaymentIdentityNumber("");
      setSuccess(t("sellerProfilePage.saveSuccess"));
    } catch (err) {
      console.error("COMPANY PROFILE SAVE ERROR:", err);
      setError(t("sellerProfilePage.saveError"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={stateCardStyle}>{t("sellerProfilePage.loading")}</div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <div style={eyebrowStyle}>{t("sellerProfilePage.eyebrow")}</div>
          <h1 style={heroTitleStyle}>{t("sellerProfilePage.title")}</h1>

          <p style={heroTextStyle}>
            {t("sellerProfilePage.description")}
          </p>
        </div>

        <div style={statusCardStyle}>
          <span>{t("sellerProfilePage.companyStatus")}</span>

          <strong>
            {profile?.verified
              ? t("sellerProfilePage.verifiedCompany")
              : profile?.status === "PENDING"
                ? t("sellerProfilePage.pendingApproval")
                : profile?.status || "-"}
          </strong>
        </div>
      </section>

      <section
        style={{
          ...layoutStyle,
          gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1.7fr) minmax(300px, 1fr)",
          gap: isMobile ? 18 : 24,
        }}
      >
        <article
          style={{
            ...formCardStyle,
            padding: isMobile ? 20 : 30,
          }}
        >
          <div style={sectionHeaderStyle}>
            <div>
              <div style={sectionEyebrowStyle}>{t("sellerProfilePage.companyInfo")}</div>
              <h2 style={sectionTitleStyle}>{t("sellerProfilePage.editProfile")}</h2>
            </div>
          </div>

          {error && <div style={errorStyle}>{error}</div>}
          {success && <div style={successStyle}>{success}</div>}

          <label style={fieldStyle}>
            <span style={labelStyle}>{t("sellerProfilePage.companyName")}</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              style={inputStyle}
              maxLength={160}
            />
          </label>

          <label style={fieldStyle}>
            <span style={labelStyle}>{t("sellerProfilePage.companyDescription")}</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              style={textareaStyle}
              maxLength={3000}
              placeholder={t("sellerProfilePage.descriptionPlaceholder")}
            />
            <small style={helperStyle}>
              {t("sellerProfilePage.publicDescriptionHelp")}
            </small>
          </label>

          <div style={twoColumnStyle}>
            <label style={fieldStyle}>
              <span style={labelStyle}>{t("sellerProfilePage.country")}</span>
              <select
                value={country}
                onChange={(event) => {
                  const nextCountry = event.target.value;

                  setCountry(nextCountry);
                  setCity("");
                  setCompanyType("");
                  setTaxNumber("");
                  setPaymentIdentityNumber("");
                }}
                style={inputStyle}
              >
                {COUNTRIES.map((countryName) => (
                  <option key={countryName} value={countryName}>
                    {countryName}
                  </option>
                ))}
              </select>
            </label>

            <label style={fieldStyle}>
              <span style={labelStyle}>{t("sellerProfilePage.city")}</span>

              {country === "Türkiye" ? (
                <select
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  style={inputStyle}
                >
                  <option value="">{t("sellerProfilePage.selectCity")}</option>

                  {TURKEY_CITIES.map((cityName) => (
                    <option key={cityName} value={cityName}>
                      {cityName}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  style={inputStyle}
                  maxLength={120}
                  placeholder={t("sellerProfilePage.cityPlaceholder")}
                />
              )}
            </label>
          </div>

          <div style={legalSectionStyle}>
            <div style={sectionEyebrowStyle}>
              {t("sellerProfilePage.legalInfo")}
            </div>
            <h3 style={legalTitleStyle}>
              {t("sellerProfilePage.legalInfoTitle")}
            </h3>
            <p style={legalTextStyle}>
              {t("sellerProfilePage.legalInfoHelp")}
            </p>

            <div style={twoColumnStyle}>
              <label style={fieldStyle}>
                <span style={labelStyle}>
                  {t("sellerProfilePage.companyType")}
                </span>
                <select
                  value={companyType}
                  onChange={(event) => {
                    const nextType = event.target.value;
                    setCompanyType(nextType);

                    if (country === "Türkiye") {
                      if (nextType === "Şahıs") {
                        setTaxNumber("");
                      } else {
                        setPaymentIdentityNumber("");
                      }
                    }
                  }}
                  style={inputStyle}
                >
                  <option value="">
                    {t("sellerProfilePage.companyType")}
                  </option>

                  {country === "Türkiye" ? (
                    <>
                      <option value="Şahıs">
                        {t("sellerProfilePage.soleProprietorship")}
                      </option>
                      <option value="Limited">
                        {t("sellerProfilePage.limitedCompany")}
                      </option>
                      <option value="Anonim">
                        {t("sellerProfilePage.jointStockCompany")}
                      </option>
                    </>
                  ) : (
                    <>
                      <option value="Sole Proprietorship">
                        {t("registerPage.soleProprietorship")}
                      </option>
                      <option value="Limited Liability Company">
                        {t("registerPage.limitedLiabilityCompany")}
                      </option>
                      <option value="Corporation">
                        {t("registerPage.corporation")}
                      </option>
                      <option value="Partnership">
                        {t("registerPage.partnership")}
                      </option>
                      <option value="Other">
                        {t("registerPage.otherCompanyType")}
                      </option>
                    </>
                  )}
                </select>
              </label>

              <label style={fieldStyle}>
                <span style={labelStyle}>
                  {t("sellerProfilePage.fullName")}
                </span>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  style={inputStyle}
                  maxLength={160}
                />
              </label>
            </div>
            <div style={fieldStyle}>
              <button
                type="button"
                onClick={() => setCategoriesOpen((prev) => !prev)}
                aria-expanded={categoriesOpen}
                style={{
                  ...inputStyle,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  textAlign: "start",
                }}
              >
                <span>
                  {t("sellerProfilePage.categories")} ({categories.length}/3)
                </span>
                <span aria-hidden="true">
                  {categoriesOpen ? "▲" : "▼"}
                </span>
              </button>

              {categoriesOpen && (
                <div style={categoryListStyle}>
                  {sectors.map((sector) => {
                    const checked = categories.includes(sector.name);
                    const sectorKey = sector.id.replace(/-/g, "_");

                    return (
                      <label key={sector.id} style={categoryOptionStyle}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setCategories((prev) => {
                              if (prev.includes(sector.name)) {
                                return prev.filter((x) => x !== sector.name);
                              }

                              if (prev.length >= 3) {
                                alert(t("sellerProfilePage.maxCategories"));
                                return prev;
                              }

                              return [...prev, sector.name];
                            });
                          }}
                        />

                        {t(
                          `popularSectors.sectors.${sectorKey}.name`,
                          sector.name
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={twoColumnStyle}>
              <label style={fieldStyle}>
                <span style={labelStyle}>
                  {t("sellerProfilePage.district")}
                </span>
                <input
                  value={district}
                  onChange={(event) => setDistrict(event.target.value)}
                  style={inputStyle}
                  maxLength={100}
                />
              </label>

              <label style={fieldStyle}>
                <span style={labelStyle}>Posta Kodu</span>
                <input
                  value={postalCode}
                  onChange={(event) =>
                    setPostalCode(
                      event.target.value.replace(/\D/g, "").slice(0, 10)
                    )
                  }
                  inputMode="numeric"
                  style={inputStyle}
                  maxLength={10}
                />
              </label>

              <label style={fieldStyle}>
                <span style={labelStyle}>
                  {t("sellerProfilePage.taxOffice")}
                </span>
                <input
                  value={taxOffice}
                  onChange={(event) => setTaxOffice(event.target.value)}
                  style={inputStyle}
                  maxLength={100}
                />
              </label>
            </div>

            <label style={fieldStyle}>
              <span style={labelStyle}>
                {t("sellerProfilePage.address")}
              </span>
              <textarea
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                style={{ ...textareaStyle, minHeight: 100 }}
                maxLength={1000}
                placeholder={t("sellerProfilePage.addressPlaceholder")}
              />
            </label>

            {country === "Türkiye" && companyType === "Şahıs" ? (
              <label style={fieldStyle}>
                <span style={labelStyle}>
                  {t("sellerProfilePage.identityNumber")}
                  {!profile?.hasPaymentIdentityNumber ? " *" : ""}
                </span>
                <input
                  value={paymentIdentityNumber}
                  onChange={(event) =>
                    setPaymentIdentityNumber(
                      event.target.value.replace(/\D/g, "").slice(0, 11)
                    )
                  }
                  style={inputStyle}
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={11}
                  placeholder={t(
                    "sellerProfilePage.identityNumberPlaceholder"
                  )}
                />
                <small style={helperStyle}>
                  {t(
                    profile?.hasPaymentIdentityNumber
                      ? "sellerProfilePage.identityNumberHelp"
                      : "sellerProfilePage.identityNumberMissingHelp"
                  )}
                </small>
              </label>
            ) : (
              <label style={fieldStyle}>
                <span style={labelStyle}>
                  {country === "Türkiye"
                    ? t("sellerProfilePage.taxNumber")
                    : t("sellerProfilePage.internationalTaxNumber")}
                </span>
                <input
                  value={taxNumber}
                  onChange={(event) =>
                    setTaxNumber(
                      country === "Türkiye"
                        ? event.target.value.replace(/\D/g, "").slice(0, 10)
                        : event.target.value
                    )
                  }
                  style={inputStyle}
                  inputMode={country === "Türkiye" ? "numeric" : "text"}
                  maxLength={country === "Türkiye" ? 10 : 50}
                  placeholder={
                    country === "Türkiye"
                      ? t("sellerProfilePage.taxNumberPlaceholder")
                      : undefined
                  }
                />
              </label>
            )}
          </div>

          <div style={privateSectionStyle}>
            <div style={privateTitleStyle}>{t("sellerProfilePage.privateContact")}</div>

            <p style={privateTextStyle}>
              {t("sellerProfilePage.privateContactText")}
            </p>

            <div style={twoColumnStyle}>
              <label style={fieldStyle}>
                <span style={labelStyle}>{t("sellerProfilePage.phone")}</span>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  style={inputStyle}
                  maxLength={30}
                  placeholder={t("sellerProfilePage.phonePlaceholder")}
                />
              </label>

              <label style={fieldStyle}>
                <span style={labelStyle}>{t("sellerProfilePage.website")}</span>
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
            {saving
              ? t("sellerProfilePage.saving")
              : t("sellerProfilePage.saveChanges")}
          </button>
        </article>

        <aside
          style={{
            ...mediaCardStyle,
            padding: isMobile ? 20 : 28,
          }}
        >
          <div style={sectionEyebrowStyle}>{t("sellerProfilePage.storeImages")}</div>
          <h2 style={mediaTitleStyle}>{t("sellerProfilePage.logoAndBanner")}</h2>

          <div style={bannerPreviewStyle}>
            {banner ? (
              <img
                src={resolveImageUrl(banner)}
                alt={t("sellerProfilePage.companyBannerAlt")}
                style={bannerImageStyle}
              />
            ) : (
              <div style={bannerPlaceholderStyle}>
                {t("sellerProfilePage.noBanner")}
              </div>
            )}
          </div>

          <label style={uploadButtonStyle}>
            {uploadingBanner
              ? t("sellerProfilePage.uploadingBanner")
              : t("sellerProfilePage.uploadBanner")}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => uploadImage(event, "banner")}
              disabled={uploadingBanner}
              style={{ display: "none" }}
            />
          </label>

          <small style={helperStyle}>
            {t("sellerProfilePage.bannerHelp")}
          </small>

          <div style={logoSectionStyle}>
            <div style={logoPreviewStyle}>
              {logo ? (
                <img
                  src={resolveImageUrl(logo)}
                  alt={t("sellerProfilePage.companyLogoAlt")}
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
              <strong>{t("sellerProfilePage.companyLogo")}</strong>

              <p style={logoTextStyle}>
                {t("sellerProfilePage.logoHelp")}
              </p>

              <label style={secondaryUploadStyle}>
                {uploadingLogo
                  ? t("sellerProfilePage.uploadingLogo")
                  : t("sellerProfilePage.uploadLogo")}
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
              {t("sellerProfilePage.viewPublicStore")}
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

const legalSectionStyle: CSSProperties = {
  margin: "8px 0 22px",
  padding: 20,
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
};

const legalTitleStyle: CSSProperties = {
  margin: "6px 0 8px",
  color: "#0f172a",
  fontSize: 20,
};

const legalTextStyle: CSSProperties = {
  margin: "0 0 20px",
  color: "#64748b",
  lineHeight: 1.6,
  fontSize: 14,
};

const categoryListStyle: CSSProperties = {
  maxHeight: 220,
  overflowY: "auto",
  padding: 12,
  border: "1px solid #cbd5e1",
  borderRadius: 12,
  background: "#ffffff",
};

const categoryOptionStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "7px 4px",
  color: "#334155",
  cursor: "pointer",
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
