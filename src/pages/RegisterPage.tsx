import { useState } from "react";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const register = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.post("http://localhost:3002/api/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
      });

      const token =
        res.data?.token ||
        res.data?.access_token ||
        res.data?.data?.token ||
        "";

      const role =
        res.data?.user?.role ||
        res.data?.role ||
        res.data?.data?.user?.role ||
        "";

      if (!token) {
        setError("Kayıt başarılı ama token dönmedi");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      navigate("/panel");
    } catch (err: any) {
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
    <>
      <Helmet>
  <title>Üye Ol | Tedarik Pazarı</title>

  <meta
    name="description"
    content="Tedarik Pazarı'na üye olun, işletmeniz için tedarikçi ve ürün ağına erişin."
  />

  <link rel="canonical" href="https://tedarikpazarı.com/uyelik" />

  <meta property="og:title" content="Üye Ol - Tedarik Pazarı" />
  <meta property="og:url" content="https://tedarikpazarı.com/uyelik" />
</Helmet>

      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 460,
            background: "#fff",
            color: "#111827",
            borderRadius: 20,
            padding: 28,
            boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <Link
              to="/"
              style={{
                color: "#2563eb",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              ← Ana sayfaya dön
            </Link>
          </div>

          <h1 style={{ marginTop: 0, marginBottom: 10 }}>Üye Ol</h1>
          <p style={{ color: "#6b7280", marginBottom: 20 }}>
            Tedarik Pazarı&apos;na kaydolun ve panelinize giriş yapın.
          </p>

          {error && (
            <div
              style={{
                marginBottom: 16,
                background: "#fef2f2",
                color: "#b91c1c",
                border: "1px solid #fecaca",
                borderRadius: 10,
                padding: 12,
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "grid", gap: 14 }}>
            <input
              placeholder="Ad Soyad"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />

            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />

            <input
              placeholder="Şifre"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />

            <button
              onClick={register}
              disabled={loading}
              style={{
                background: loading ? "#86efac" : "#22c55e",
                color: "#fff",
                border: "none",
                padding: "12px",
                borderRadius: 10,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Kaydediliyor..." : "Üye Ol"}
            </button>
          </div>

          <div
            style={{
              marginTop: 18,
              fontSize: 14,
              color: "#6b7280",
            }}
          >
            Zaten hesabınız var mı?{" "}
            <Link
              to="/panel"
              style={{
                color: "#2563eb",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Giriş yap
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  outline: "none",
  fontSize: 14,
};