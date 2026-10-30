import { useState, type FormEvent } from "react";

const API =
  import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

export default function BuyerDisputeAction({
  orderId,
}: {
  orderId: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Oturum süreniz dolmuş. Tekrar giriş yapın.");
      return;
    }

    const cleanReason = reason.trim();
    const cleanDescription = description.trim();

    if (!cleanReason || cleanReason.length > 200) {
      setError("Gerekçe 1-200 karakter olmalıdır.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const response = await fetch(
        `${API}/disputes/${encodeURIComponent(orderId)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: cleanReason,
            description: cleanDescription,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = data?.message;
        throw new Error(
          typeof message === "string"
            ? message
            : Array.isArray(message)
              ? message.join(", ")
              : "Talep oluşturulamadı."
        );
      }

      setSuccess(true);
      setOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Bağlantı hatası oluştu."
      );
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <p role="status" style={{ color: "#047857", fontWeight: 700 }}>
        Uyuşmazlık talebiniz alındı. İnceleme süreci başlayacak.
      </p>
    );
  }

  return (
    <div style={{ marginTop: 12 }}>
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          setError("");
        }}
        style={{
          background: "#fff7ed",
          color: "#9a3412",
          border: "1px solid #fdba74",
          borderRadius: 10,
          padding: "10px 14px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Sorun Bildir / Uyuşmazlık Aç
      </button>

      {open && (
        <form
          onSubmit={submit}
          style={{
            display: "grid",
            gap: 10,
            marginTop: 12,
            padding: 16,
            border: "1px solid #cbd5e1",
            borderRadius: 12,
            background: "#f8fafc",
          }}
        >
          <label>
            Sorun gerekçesi
            <input
              required
              minLength={1}
              maxLength={200}
              value={reason}
              disabled={busy}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Örn. Eksik veya hasarlı ürün"
              style={{ width: "100%", padding: 10, boxSizing: "border-box" }}
            />
          </label>

          <label>
            Açıklama (isteğe bağlı)
            <textarea
              value={description}
              maxLength={5000}
              disabled={busy}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ width: "100%", padding: 10, boxSizing: "border-box" }}
            />
          </label>

          <small>
            Talebiniz incelemeye alınır. Otomatik para iadesi yapılmaz.
          </small>

          {error && (
            <p role="alert" style={{ color: "#b91c1c" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !reason.trim()}
            style={{
              background: "#0d9488",
              color: "#fff",
              padding: 11,
              border: 0,
              borderRadius: 10,
              fontWeight: 700,
              cursor: busy ? "wait" : "pointer",
            }}
          >
            {busy ? "Gönderiliyor..." : "Uyuşmazlık Talebini Gönder"}
          </button>
        </form>
      )}
    </div>
  );
}
