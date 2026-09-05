import { useState, type CSSProperties } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { Link, useNavigate } from "react-router-dom";
import { TURKEY_CITIES } from "../constants/turkeyCities";
import { sectors } from "../data/sectors";
import { useTranslation } from "react-i18next";

const API =
  import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api";

type MembershipType = "BUYER" | "SELLER" | "LOGISTICS";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [membershipType, setMembershipType] =
    useState<MembershipType>("BUYER");
  const [companyType, setCompanyType] = useState("Şahıs");
  const [categories, setCategories] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [taxOffice, setTaxOffice] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const register = async () => {
    if (
      !companyName.trim() ||
      !fullName.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !password.trim() ||
      categories.length === 0
    ) {
      setError(
        t("registerPage.requiredFields")
      );
      return;
    }

    const normalizedPhone = phone.replace(/\D/g, "");

    if (!/^05\d{9}$/.test(normalizedPhone)) {
      setError(t("registerPage.invalidPhone"));
      return;
    }

    if (!recaptchaToken) {
      setError(t("registerPage.recaptchaRequired"));
      return;
    }

    try {
      setLoading(true);
      setError("");

      await axios.post(`${API}/auth/register`, {
        companyName: companyName.trim(),
        email: email.trim(),
        password: password.trim(),
        role: membershipType,
        recaptchaToken,
        fullName: fullName.trim(),
        phone: normalizedPhone,
        companyType,
        categories,
        city,
        district,
        taxNumber,
        taxOffice,
        address,
      });

      if (typeof window !== "undefined" && typeof (window as any).fbq === "function") {
        (window as any).fbq("track", "CompleteRegistration", {
          content_name: "Firma Kaydı",
          status: "completed",
        });
      }

      alert(t("registerPage.success"));
      navigate("/login");
    } catch (err: any) {
      console.error("REGISTER ERROR =>", err?.response || err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          t("registerPage.registerError")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={pageStyle}>
      <div style={overlayStyle}>
        <div style={cardStyle}>
          <div style={topRowStyle}>
            <Link to="/" style={backLinkStyle}>
              ← {t("registerPage.home")}
            </Link>

            <div style={badgeStyle}>B2B Marketplace</div>
          </div>

          <div style={{ marginBottom: 30 }}>
            <h1 style={titleStyle}>{t("registerPage.title")}</h1>

            <p style={subtitleStyle}>
              {t("registerPage.subtitle")}
            </p>
          </div>

          {error && <div style={errorBoxStyle}>{error}</div>}

          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>{t("registerPage.companyName")}</label>
              <input
                style={inputStyle}
                placeholder={t("registerPage.companyNamePlaceholder")}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>{t("registerPage.fullName")}</label>
              <input
                style={inputStyle}
                placeholder={t("registerPage.fullNamePlaceholder")}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>{t("registerPage.phone")}</label>
              <input
                style={inputStyle}
                placeholder="05XXXXXXXXX"
                value={phone}
                inputMode="numeric"
                maxLength={11}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 11);
                  setPhone(value);
                }}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>{t("registerPage.email")}</label>
              <input
                type="email"
                style={inputStyle}
                placeholder="ornek@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>{t("registerPage.membershipType")}</label>
              <select
                style={inputStyle}
                value={membershipType}
                onChange={(e) =>
                  setMembershipType(e.target.value as MembershipType)
                }
              >
                <option value="BUYER">{t("registerPage.buyer")}</option>
                <option value="SELLER">{t("registerPage.seller")}</option>
                <option value="LOGISTICS">{t("registerPage.logistics")}</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>{t("registerPage.companyType")}</label>
              <select
                style={inputStyle}
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value)}
              >
                <option value="Şahıs">{t("registerPage.soleProprietorship")}</option>
                <option value="Limited">{t("registerPage.limited")}</option>
                <option value="Anonim">{t("registerPage.jointStock")}</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>{t("registerPage.categories")}</label>

              <div
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 10,
                  padding: 12,
                  maxHeight: 220,
                  overflowY: "auto",
                  background: "#fff",
                }}
              >
                {sectors.map((sector) => {
                  const checked = categories.includes(sector.name);
                  const sectorKey = sector.id.replace(/-/g, "_");

                  return (
                    <label
                      key={sector.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 0",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setCategories((prev) => {
                            if (prev.includes(sector.name)) {
                              return prev.filter((x) => x !== sector.name);
                            }

                            if (prev.length >= 3) {
                              alert(t("registerPage.maxCategories"));
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

              <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
                {t("registerPage.maxCategories")}
              </div>
            </div>

            <div>
              <label style={labelStyle}>{t("registerPage.city")}</label>
              <select
                style={inputStyle}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="">{t("registerPage.selectCity")}</option>

                {TURKEY_CITIES.map((cityName) => (
                  <option key={cityName} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>{t("registerPage.district")}</label>
              <input
                style={inputStyle}
                placeholder={t("registerPage.districtPlaceholder")}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>{t("registerPage.taxNumber")}</label>
              <input
                style={inputStyle}
                placeholder="1234567890"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>{t("registerPage.taxOffice")}</label>
              <input
                style={inputStyle}
                placeholder={t("registerPage.taxOfficePlaceholder")}
                value={taxOffice}
                onChange={(e) => setTaxOffice(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>{t("registerPage.password")}</label>
              <input
                type="password"
                style={inputStyle}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <label style={labelStyle}>{t("registerPage.address")}</label>
            <textarea
              style={textareaStyle}
              placeholder={t("registerPage.addressPlaceholder")}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div style={recaptchaBoxStyle}>
            <ReCAPTCHA
  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
  onChange={(token: string | null) => setRecaptchaToken(token)}
  onExpired={() => setRecaptchaToken(null)}
/>
          </div>

          <button
            type="button"
            onClick={register}
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? t("registerPage.saving") : t("registerPage.submit")}
          </button>

          <p style={loginTextStyle}>
            {t("registerPage.alreadyAccount")}{" "}
            <Link to="/login" style={loginLinkStyle}>
              {t("registerPage.login")}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top, rgba(37,99,235,0.35), #020617 65%)",
};

const overlayStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 30,
};

const cardStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1100,
  background: "rgba(15,23,42,0.82)",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(18px)",
  borderRadius: 28,
  padding: 34,
  boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
  color: "#fff",
};

const topRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 24,
};

const badgeStyle: CSSProperties = {
  background: "rgba(59,130,246,0.18)",
  border: "1px solid rgba(59,130,246,0.35)",
  color: "#93c5fd",
  padding: "8px 14px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 700,
};

const backLinkStyle: CSSProperties = {
  color: "#cbd5e1",
  textDecoration: "none",
  fontWeight: 700,
};

const titleStyle: CSSProperties = {
  fontSize: 46,
  fontWeight: 900,
  margin: 0,
  marginBottom: 10,
  letterSpacing: "-1px",
};

const subtitleStyle: CSSProperties = {
  color: "#94a3b8",
  fontSize: 16,
  margin: 0,
};

const errorBoxStyle: CSSProperties = {
  background: "rgba(220,38,38,0.16)",
  border: "1px solid rgba(248,113,113,0.35)",
  color: "#fecaca",
  padding: 14,
  borderRadius: 14,
  marginBottom: 20,
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 18,
};

const labelStyle: CSSProperties = {
  display: "block",
  marginBottom: 8,
  fontWeight: 700,
  color: "#e2e8f0",
  fontSize: 14,
};

const inputStyle: CSSProperties = {
  width: "100%",
  height: 52,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  padding: "0 16px",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
};

const textareaStyle: CSSProperties = {
  width: "100%",
  minHeight: 120,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  padding: 16,
  fontSize: 15,
  outline: "none",
  resize: "vertical",
  boxSizing: "border-box",
};

const recaptchaBoxStyle: CSSProperties = {
  marginTop: 20,
  display: "flex",
  justifyContent: "center",
};

const buttonStyle: CSSProperties = {
  width: "100%",
  height: 56,
  border: "none",
  borderRadius: 16,
  marginTop: 24,
  background: "linear-gradient(135deg,#2563eb,#3b82f6)",
  color: "#fff",
  fontSize: 16,
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 18px 35px rgba(37,99,235,0.35)",
};

const loginTextStyle: CSSProperties = {
  textAlign: "center",
  marginTop: 20,
  color: "#cbd5e1",
};

const loginLinkStyle: CSSProperties = {
  color: "#60a5fa",
  textDecoration: "none",
  fontWeight: 800,
};