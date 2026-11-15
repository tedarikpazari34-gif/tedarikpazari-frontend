import { useState } from "react";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

export default function AccountSecurityPage() {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage(t("accountSecurity.passwordMismatch"));
      return;
    }

    if (newPassword.length < 12 || newPassword.length > 128) {
      setMessage(t("accountSecurity.passwordLength"));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        setMessage(t("accountSecurity.changeFailed"));
        return;
      }

      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("emailVerified");
      localStorage.removeItem("companyVerified");
      window.dispatchEvent(new Event("storage"));
      window.location.replace("/login");
    } catch {
      setMessage(t("accountSecurity.changeFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 520, margin: "32px auto", padding: 24,
      background: "#fff", border: "1px solid #dbe5ec", borderRadius: 16 }}>
      <h1 style={{ color: "#0f2742" }}>{t("accountSecurity.title")}</h1>
      <form onSubmit={submit}>
        <input type="password" autoComplete="current-password"
          placeholder={t("accountSecurity.currentPassword")}
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          required style={inputStyle} />
        <input type="password" autoComplete="new-password"
          placeholder={t("accountSecurity.newPassword")}
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required style={inputStyle} />
        <input type="password" autoComplete="new-password"
          placeholder={t("accountSecurity.confirmPassword")}
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required style={inputStyle} />
        <button disabled={loading} type="submit"
          style={{ ...inputStyle, background: "#f97316", color: "white",
            border: 0, fontWeight: 700, cursor: "pointer" }}>
          {t("accountSecurity.submit")}
        </button>
      </form>
      {message && <p role="alert">{message}</p>}
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: 12, marginTop: 12,
  border: "1px solid #cbd5e1", borderRadius: 8,
  boxSizing: "border-box",
};
