import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API =
  import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("E-posta adresiniz doğrulanıyor...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("Doğrulama bağlantısı geçersiz.");
      return;
    }

    fetch(`${API}/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.message || "E-posta doğrulanamadı.");
        }

        setStatus("✅ E-posta adresiniz başarıyla doğrulandı.");
      })
      .catch((err) => {
        setStatus(err.message || "E-posta doğrulanamadı.");
      });
  }, [searchParams]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f5f8fc",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#fff",
          borderRadius: 20,
          padding: 36,
          boxShadow: "0 12px 35px rgba(15, 23, 42, 0.08)",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginTop: 0 }}>Tedarik Pazarı</h1>

        <p
          style={{
            fontSize: 18,
            lineHeight: 1.6,
            color: "#334155",
          }}
        >
          {status}
        </p>

        <Link
          to="/login"
          style={{
            display: "inline-block",
            marginTop: 20,
            padding: "12px 22px",
            borderRadius: 10,
            background: "#2563eb",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Giriş Yap
        </Link>
      </div>
    </main>
  );
}
