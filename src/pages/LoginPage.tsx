import { useState } from "react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.post(`${API_URL}/auth/login`, {
        email: email.trim(),
        password: password.trim(),
      });

      const token = res.data?.token;
      const role = res.data?.user?.role || res.data?.role;

      if (!token) {
        setError("Token gelmedi");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", role || "");

      window.dispatchEvent(new Event("storage"));

      if (role === "LOGISTICS") {
        window.location.href = "/logistics/dashboard";
      } else if (role === "SELLER") {
        window.location.href = "/seller/dashboard";
      } else if (role === "ADMIN") {
        window.location.href = "/admin";
      } else if (role === "BUYER") {
        window.location.href = "/buyer/dashboard";
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Giriş başarısız",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={logoStyle}>TP</div>

        <h1 style={titleStyle}>Tedarik Pazarı</h1>

        <p style={subtitleStyle}>
          Türkiye B2B tedarik ve toptan satın alma platformu
        </p>

        {error && <div style={errorStyle}>{error}</div>}

        <input
          placeholder="Email adresiniz"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Şifreniz"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button onClick={login} disabled={loading} style={buttonStyle}>
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #020617 0%, #0f172a 45%, #1e293b 100%)",
  padding: 20,
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 420,
  background: "rgba(15,23,42,0.92)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 24,
  padding: 36,
  display: "flex",
  flexDirection: "column",
  gap: 16,
  boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
};

const logoStyle: React.CSSProperties = {
  width: 70,
  height: 70,
  borderRadius: 20,
  background: "linear-gradient(135deg, #38bdf8, #2563eb)",
  display: "grid",
  placeItems: "center",
  color: "white",
  fontWeight: 900,
  fontSize: 26,
  margin: "0 auto",
};

const titleStyle: React.CSSProperties = {
  color: "white",
  textAlign: "center",
  margin: 0,
  fontSize: 32,
  fontWeight: 900,
};

const subtitleStyle: React.CSSProperties = {
  color: "#94a3b8",
  textAlign: "center",
  marginTop: -8,
  marginBottom: 10,
  fontSize: 14,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "white",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  color: "white",
  border: "none",
  padding: "15px",
  borderRadius: 14,
  fontWeight: 800,
  fontSize: 15,
  cursor: "pointer",
  marginTop: 8,
};

const errorStyle: React.CSSProperties = {
  background: "rgba(239,68,68,0.12)",
  border: "1px solid rgba(239,68,68,0.35)",
  color: "#fca5a5",
  padding: 12,
  borderRadius: 12,
  fontSize: 14,
};
