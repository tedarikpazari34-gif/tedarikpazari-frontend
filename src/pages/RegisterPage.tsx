import { useState, type CSSProperties } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API =
  import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"BUYER" | "SELLER" | "LOGISTICS">("BUYER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const register = async () => {
    if (!companyName.trim() || !email.trim() || !password.trim()) {
      setError("Firma adı, email ve şifre zorunlu");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await axios.post(`${API}/auth/register`, {
        companyName: companyName.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
      });

      alert("Kayıt başarılı");
      navigate("/login");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Kayıt sırasında hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={page}>
      <section style={left}>
        <div style={badge}>B2B TEDARİK PLATFORMU</div>

        <h1 style={headline}>
          Tedarik, teklif ve sipariş süreçlerini tek panelden yönetin.
        </h1>

        <p style={desc}>
          Toptancılar ve satıcılar için hızlı RFQ, teklif, sipariş ve lojistik
          yönetimi.
        </p>

        <div style={stats}>
          <div style={statCard}>
            <strong>RFQ</strong>
            <span>Hızlı teklif akışı</span>
          </div>
          <div style={statCard}>
            <strong>Order</strong>
            <span>Sipariş yönetimi</span>
          </div>
          <div style={statCard}>
            <strong>Logistics</strong>
            <span>Nakliye takibi</span>
          </div>
        </div>
      </section>

      <section style={right}>
        <div style={card}>
          <div style={cardTop}>
            <h2 style={title}>Ücretsiz Başla</h2>
            <p style={subtitle}>Dakikalar içinde hesabını oluştur.</p>
          </div>

          {error && <div style={errorBox}>{error}</div>}

          <label style={label}>Firma Adı</label>
          <input
            style={input}
            placeholder="Örn: ABC Tedarik Ltd."
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />

          <label style={label}>Email</label>
          <input
            style={input}
            placeholder="firma@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label style={label}>Şifre</label>
          <input
            type="password"
            style={input}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label style={label}>Üyelik Türü</label>
          <div style={roleGrid}>
            <button
              type="button"
              onClick={() => setRole("BUYER")}
              style={role === "BUYER" ? roleActive : roleButton}
            >
              <span style={roleIcon}>🛒</span>
              <span>Toptancı</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("SELLER")}
              style={role === "SELLER" ? roleActive : roleButton}
            >
              <span style={roleIcon}>🏪</span>
              <span>Satıcı</span>
            </button>
          </div>

          <button
            type="button"
            onClick={register}
            disabled={loading}
            style={submitButton}
          >
            {loading ? "Başvuru gönderiliyor..." : "Başvuruyu Gönder"}
          </button>

          <button
  type="button"
  onClick={() => setRole("LOGISTICS")}
  style={role === "LOGISTICS" ? roleActive : roleButton}
>
  <span style={roleIcon}>🚚</span>
  <span>Nakliyeci</span>
</button>

          <p style={loginText}>
            Zaten hesabın var mı?{" "}
            <span style={loginLink} onClick={() => navigate("/login")}>
              Giriş yap
            </span>
          </p>
        </div>
      </section>
    </main>
  );
}

const page: CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  gridTemplateColumns: "1.2fr 0.8fr",
  background:
    "radial-gradient(circle at top left, #1d4ed8 0, transparent 32%), linear-gradient(135deg, #020617 0%, #0f172a 55%, #111827 100%)",
  color: "white",
};

const left: CSSProperties = {
  padding: "80px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const badge: CSSProperties = {
  width: "fit-content",
  padding: "8px 14px",
  borderRadius: 999,
  background: "rgba(37,99,235,0.18)",
  color: "#93c5fd",
  fontWeight: 900,
  fontSize: 13,
  letterSpacing: 1,
  marginBottom: 28,
};

const headline: CSSProperties = {
  fontSize: 56,
  lineHeight: 1.05,
  maxWidth: 760,
  margin: 0,
  fontWeight: 950,
};

const desc: CSSProperties = {
  marginTop: 24,
  maxWidth: 560,
  color: "#cbd5e1",
  fontSize: 18,
  lineHeight: 1.7,
};

const stats: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 14,
  maxWidth: 720,
  marginTop: 42,
};

const statCard: CSSProperties = {
  padding: 18,
  borderRadius: 18,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  display: "flex",
  flexDirection: "column",
  gap: 6,
  color: "#cbd5e1",
};

const right: CSSProperties = {
  padding: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const card: CSSProperties = {
  width: "100%",
  maxWidth: 460,
  padding: 34,
  borderRadius: 26,
  background: "rgba(15, 23, 42, 0.88)",
  border: "1px solid rgba(148, 163, 184, 0.25)",
  boxShadow: "0 28px 90px rgba(0,0,0,0.45)",
  backdropFilter: "blur(18px)",
};

const cardTop: CSSProperties = {
  marginBottom: 24,
};

const title: CSSProperties = {
  fontSize: 34,
  margin: 0,
  fontWeight: 950,
};

const subtitle: CSSProperties = {
  marginTop: 8,
  marginBottom: 0,
  color: "#94a3b8",
};

const label: CSSProperties = {
  display: "block",
  marginBottom: 7,
  color: "#e5e7eb",
  fontSize: 13,
  fontWeight: 800,
};

const input: CSSProperties = {
  width: "100%",
  height: 48,
  marginBottom: 16,
  borderRadius: 14,
  border: "1px solid #334155",
  background: "#020617",
  color: "white",
  padding: "0 15px",
  boxSizing: "border-box",
  outline: "none",
};

const roleGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 12,
  marginBottom: 18,
};

const roleButton: CSSProperties = {
  height: 58,
  borderRadius: 16,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#cbd5e1",
  fontWeight: 900,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

const roleActive: CSSProperties = {
  ...roleButton,
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  border: "1px solid #60a5fa",
  color: "white",
};

const roleIcon: CSSProperties = {
  fontSize: 18,
};

const submitButton: CSSProperties = {
  width: "100%",
  height: 52,
  borderRadius: 16,
  border: "none",
  background: "linear-gradient(135deg, #22c55e, #16a34a)",
  color: "white",
  fontWeight: 950,
  cursor: "pointer",
  boxShadow: "0 14px 35px rgba(34,197,94,0.25)",
};

const errorBox: CSSProperties = {
  background: "rgba(127, 29, 29, 0.9)",
  border: "1px solid #ef4444",
  color: "white",
  padding: 12,
  borderRadius: 14,
  marginBottom: 18,
};

const loginText: CSSProperties = {
  textAlign: "center",
  color: "#cbd5e1",
  marginTop: 20,
  marginBottom: 0,
  fontSize: 14,
};

const loginLink: CSSProperties = {
  color: "#60a5fa",
  cursor: "pointer",
  fontWeight: 900,
};