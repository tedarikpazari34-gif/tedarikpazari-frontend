import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!/^[a-f0-9]{64}$/.test(token)) {
      setMessage(t("passwordReset.invalidLink"));
      return;
    }
    if (password.length < 12 || password.length > 128) {
      setMessage(t("accountSecurity.passwordLength"));
      return;
    }
    if (password !== confirm) {
      setMessage(t("accountSecurity.passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      if (!response.ok) throw new Error("Reset failed");
      setSuccess(true);
      setPassword("");
      setConfirm("");
      window.history.replaceState({}, "", "/reset-password");
      setMessage(t("passwordReset.resetSuccess"));
    } catch {
      setMessage(t("passwordReset.resetFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 460, margin: "48px auto", padding: 24 }}>
      <h1>{t("passwordReset.resetTitle")}</h1>
      {!success && (
        <form onSubmit={submit}>
          <input type="password" required autoComplete="new-password"
            aria-label={t("accountSecurity.newPassword")}
            placeholder={t("accountSecurity.newPassword")}
            value={password} onChange={e => setPassword(e.target.value)}
            style={inputStyle} />
          <input type="password" required autoComplete="new-password"
            aria-label={t("accountSecurity.confirmPassword")}
            placeholder={t("accountSecurity.confirmPassword")}
            value={confirm} onChange={e => setConfirm(e.target.value)}
            style={inputStyle} />
          <button type="submit" disabled={loading}
            style={{ marginTop: 14, padding: 12, background: "#f97316",
              color: "white", border: 0, borderRadius: 8 }}>
            {t("passwordReset.resetSubmit")}
          </button>
        </form>
      )}
      {message && <p role="status">{message}</p>}
      {success && <Link to="/login">{t("passwordReset.backToLogin")}</Link>}
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: 12, marginTop: 12,
  boxSizing: "border-box", border: "1px solid #cbd5e1",
  borderRadius: 8,
};
