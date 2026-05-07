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
        <div style={formWrapStyle}>
          <div style={{ marginBottom: 18 }}>
            <Link to="/" style={backLinkStyle}>
              ← Ana sayfaya dön
            </Link>
          </div>

          <h1 style={titleStyle}>Üye Ol</h1>

          {error && <div style={errorBoxStyle}>{error}</div>}

          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>Firma *</label>
              <input
                style={inputStyle}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Ad Soyad</label>
              <input
                style={inputStyle}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Telefon *</label>
              <input
                style={inputStyle}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Email *</label>
              <input
                type="email"
                style={inputStyle}
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
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>İlçe</label>
              <input
                style={inputStyle}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Vergi No</label>
              <input
                style={inputStyle}
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Vergi Dairesi</label>
              <input
                style={inputStyle}
                value={taxOffice}
                onChange={(e) => setTaxOffice(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Şifre *</label>
              <input
                type="password"
                style={inputStyle}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Adres</label>
            <textarea
              style={textareaStyle}
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
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Kaydediliyor..." : "Başvuruyu Gönder"}
          </button>

          <p style={loginTextStyle}>
            Zaten hesabın var mı?{" "}
            <Link to="/login" style={loginLinkStyle}>
              Giriş yap
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  backgroundImage:
    "linear-gradient(rgba(8,15,35,0.78), rgba(8,15,35,0.78)), url('/images/hero-b2b.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
};

const overlayStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
};

const formWrapStyle: CSSProperties = {
  width: "100%",
  maxWidth: 980,
  color: "#fff",
};

const backLinkStyle: CSSProperties = {
  color: "#c7d2fe",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: 14,
};

const titleStyle: CSSProperties = {
  fontSize: 54,
  lineHeight: 1,
  margin: "0 0 20px 0",
  fontWeight: 800,
};

const errorBoxStyle: CSSProperties = {
  background: "rgba(127,29,29,0.88)",
  color: "#fff",
  border: "1px solid rgba(252,165,165,0.5)",
  borderRadius: 10,
  padding: 12,
  marginBottom: 16,
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
};

const labelStyle: CSSProperties = {
  display: "block",
  marginBottom: 6,
  fontWeight: 700,
  fontSize: 15,
};

const inputStyle: CSSProperties = {
  width: "100%",
  height: 42,
  borderRadius: 8,
  border: "none",
  outline: "none",
  padding: "0 12px",
  fontSize: 14,
  boxSizing: "border-box",
};

const textareaStyle: CSSProperties = {
  width: "100%",
  minHeight: 110,
  borderRadius: 8,
  border: "none",
  outline: "none",
  padding: 12,
  fontSize: 14,
  resize: "vertical",
  boxSizing: "border-box",
};

const buttonStyle: CSSProperties = {
  marginTop: 18,
  width: "100%",
  height: 48,
  borderRadius: 10,
  border: "none",
  background: "#4ade80",
  color: "#fff",
  fontWeight: 800,
  fontSize: 16,
};

const loginTextStyle: CSSProperties = {
  marginTop: 16,
  textAlign: "center",
  color: "#dbeafe",
  fontWeight: 600,
};

const loginLinkStyle: CSSProperties = {
  color: "#93c5fd",
  textDecoration: "none",
  fontWeight: 800,
};