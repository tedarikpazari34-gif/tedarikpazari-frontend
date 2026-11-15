import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!response.ok) throw new Error("Request failed");
      setMessage(t("passwordReset.requestSent"));
    } catch {
      setMessage(t("passwordReset.requestFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 460, margin: "48px auto", padding: 24 }}>
      <h1>{t("passwordReset.forgotTitle")}</h1>
      <form onSubmit={submit}>
        <input type="email" required autoComplete="email"
          aria-label={t("passwordReset.email")}
          placeholder={t("passwordReset.email")}
          value={email} onChange={e => setEmail(e.target.value)}
          style={{ width: "100%", padding: 12, boxSizing: "border-box" }} />
        <button type="submit" disabled={loading}
          style={{ marginTop: 14, padding: 12, background: "#f97316",
            color: "white", border: 0, borderRadius: 8 }}>
          {t("passwordReset.sendLink")}
        </button>
      </form>
      {message && <p role="status">{message}</p>}
    </main>
  );
}
