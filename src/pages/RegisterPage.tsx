import { useState, type CSSProperties } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const API =
  import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api";

type MembershipType = "BUYER" | "SELLER" | "LOGISTICS";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [membershipType, setMembershipType] =
    useState<MembershipType>("BUYER");
  const [companyType, setCompanyType] = useState("Şahıs");
  const [category, setCategory] = useState("Gıda");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [taxOffice, setTaxOffice] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const register = async () => {
    if (!companyName.trim() || !email.trim() || !password.trim()) {
      setError("Firma, email ve şifre zorunlu");
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
        fullName,
        phone,
        companyType,
        category,
        city,
        district,
        taxNumber,
        taxOffice,
        address,
      });

      alert("Kayıt başarılı. Şimdi giriş yapabilirsiniz.");
      navigate("/login");
    } catch (err: any) {
      console.error("REGISTER ERROR =>", err?.response || err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Kayıt sırasında hata oluştu"
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
              ← Ana Sayfa
            </Link>

            <div style={badgeStyle}>B2B Marketplace</div>
          </div>

          <div style={{ marginBottom: 30 }}>
            <h1 style={titleStyle}>Tedarik Pazarı'na Katılın</h1>

            <p style={subtitleStyle}>
              Toptancılar, satıcılar ve lojistik firmaları için modern B2B
              platformu.
            </p>
          </div>

          {error && <div style={errorBoxStyle}>{error}</div>}

          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>Firma Adı *</label>

              <input
                style={inputStyle}
                placeholder="Firma adını girin"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Yetkili Ad Soyad</label>

              <input
                style={inputStyle}
                placeholder="Ad Soyad"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Telefon *</label>

              <input
                style={inputStyle}
                placeholder="0555 555 55 55"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Email *</label>

              <input
                type="email"
                style={inputStyle}
                placeholder="ornek@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Üyelik Türü *</label>

              <select
                style={inputStyle}
                value={membershipType}
                onChange={(e) =>
                  setMembershipType(e.target.value as MembershipType)
                }
              >
                <option value="BUYER">Toptancı</option>
                <option value="SELLER">Satıcı</option>
                <option value="LOGISTICS">Nakliyeci</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Şirket Türü</label>

              <select
                style={inputStyle}
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value)}
              >
                <option>Şahıs</option>
                <option>Limited</option>
                <option>Anonim</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Kategori</label>

              <select
                style={inputStyle}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>Gıda</option>
                <option>Temizlik</option>
                <option>Ambalaj</option>
                <option>Elektrik</option>
                <option>İş Güvenliği</option>
                <option>Lojistik</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>İl</label>

              <input
                style={inputStyle}
                placeholder="İstanbul"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>İlçe</label>

              <input
                style={inputStyle}
                placeholder="Kadıköy"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Vergi No</label>

              <input
                style={inputStyle}
                placeholder="1234567890"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Vergi Dairesi</label>

              <input
                style={inputStyle}
                placeholder="Kadıköy VD"
                value={taxOffice}
                onChange={(e) => setTaxOffice(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Şifre *</label>

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
            <label style={labelStyle}>Adres</label>

            <textarea
              style={textareaStyle}
              placeholder="Firma adresinizi girin"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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
            {loading ? "Kaydediliyor..." : "Başvuruyu Gönder"}
          </button>

          <p style={loginTextStyle}>
            Zaten hesabınız var mı?{" "}
            <Link to="/login" style={loginLinkStyle}>
              Giriş Yap
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