import { useEffect, useState } from "react";
import SellerLayout from "../components/SellerLayout";

type Case = {
  id: string;
  orderId: string;
  disputedAmount: number | string;
  currency: string;
  reason: string;
  status: string;
  notifiedAt: string;
  responseDueAt?: string | null;
};

type Evidence = {
  id: string;
  category: string;
  fileName?: string | null;
  sha256: string;
  createdAt: string;
};

const API = import.meta.env.VITE_CHARGEBACK_ENABLED === "true"
  ? (import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api").replace(/\/$/, "")
  : "";

function sellerBankReference(value: unknown): string {
  if (
    !value ||
    typeof value !== "object" ||
    !("providerReference" in value)
  ) {
    return "";
  }

  const reference = value.providerReference;
  return typeof reference === "string" ? reference.trim() : "";
}

const labels: Record<string, string> = {
  OPEN: "İtiraz açıldı",
  EVIDENCE_PREPARING: "Belgeler hazırlanıyor",
  EVIDENCE_SUBMITTED: "İyzico gönderimi manuel kaydedildi",
  UNDER_REVIEW: "İncelemede",
  WON: "Olumlu karar (manuel kayıt)",
  LOST: "Olumsuz karar (manuel kayıt)",
  CLOSED: "Kapalı",
};

const card: React.CSSProperties = {
  padding: 20,
  marginBottom: 18,
  background: "#fff",
  border: "1px solid #DCE7ED",
  borderRadius: 14,
};

const button: React.CSSProperties = {
  background: "#079B9B",
  color: "#fff",
  border: 0,
  borderRadius: 9,
  padding: "10px 15px",
  cursor: "pointer",
  fontWeight: 700,
};

function dateText(value?: string | null) {
  if (!value) return "Belirtilmedi";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Belirtilmedi"
    : date.toLocaleString("tr-TR");
}

function money(value: number | string, currency: string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currency || "TRY",
  }).format(Number(value || 0));
}

export default function SellerChargebacksPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [selected, setSelected] = useState<Case | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("DELIVERY");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [download, setDownload] = useState("");

  async function api(path: string, options: RequestInit = {}) {
    if (!API) {
      throw new Error("Harcama itirazı modülü henüz etkinleştirilmedi.");
    }

    const token = localStorage.getItem("token");
    if (!token) throw new Error("Oturum bulunamadı.");

    const response = await fetch(API + path, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const detail = data?.message;
      throw new Error(
        Array.isArray(detail)
          ? detail.join(", ")
          : typeof detail === "string"
            ? detail
            : `İşlem başarısız: ${response.status}`,
      );
    }

    return data;
  }

  async function refresh() {
    setError("");
    try {
      const result = await api("/seller/chargebacks");
      if (!Array.isArray(result)) throw new Error("Geçersiz liste yanıtı.");
      setCases(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "İtirazlar yüklenemedi.");
    }
  }

  useEffect(() => {
    if (API) void refresh();
  }, []);

  async function openCase(id: string) {
    if (busy) return;
    setBusy(true);
    setError("");
    setSelected(null);
    setEvidence([]);
    setDownload("");
    setFile(null);

    try {
      const encoded = encodeURIComponent(id);
      const [detail, files] = await Promise.all([
        api(`/seller/chargebacks/${encoded}`),
        api(`/seller/chargebacks/${encoded}/evidence`),
      ]);

      if (!Array.isArray(files) || !detail?.id) {
        throw new Error("İtiraz detayları doğrulanamadı.");
      }

      setSelected(detail);
      setEvidence(files);
    } catch (e) {
      setError(e instanceof Error ? e.message : "İtiraz açılamadı.");
    } finally {
      setBusy(false);
    }
  }

  async function upload() {
    if (!selected || !file || busy) return;

    if (
      file.size < 1 ||
      file.size > 10 * 1024 * 1024 ||
      ![
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(file.type)
    ) {
      setError("En fazla 10 MB PDF, JPG, PNG veya WEBP yükleyin.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("category", category);

      const id = encodeURIComponent(selected.id);

      await api(`/seller/chargebacks/${id}/evidence`, {
        method: "POST",
        body: form,
      });

      const files = await api(`/seller/chargebacks/${id}/evidence`);
      if (!Array.isArray(files)) throw new Error("Belge listesi alınamadı.");

      setEvidence(files);
      setFile(null);
      setMessage(
        "Belge platforma kaydedildi. İyzico'ya otomatik gönderilmedi.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Belge yüklenemedi.");
    } finally {
      setBusy(false);
    }
  }

  async function getDownload(evidenceId: string) {
    if (!selected || busy) return;

    setBusy(true);
    setError("");
    setDownload("");

    try {
      const result = await api(
        `/seller/chargebacks/${encodeURIComponent(selected.id)}` +
        `/evidence/${encodeURIComponent(evidenceId)}/download`,
      );

      const url = new URL(result.url);

      if (
        url.protocol !== "https:" ||
        url.hostname !== "api.cloudinary.com"
      ) {
        throw new Error("Belge bağlantısı doğrulanamadı.");
      }

      setDownload(result.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Belge açılamadı.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SellerLayout title="Harcama İtirazlarım">
      <p>
        Siparişlerinizin banka harcama itirazlarını takip edebilir,
        istenen savunma belgelerini hazırlayabilirsiniz.
      </p>

      {!API && (
        <div style={{ ...card, background: "#FFF8E7" }}>
          İzole API bağlantısı kapalı. Canlı ödeme sistemine
          otomatik bağlantı yapılmaz.
        </div>
      )}

      {error && (
        <p role="alert" style={{ color: "#B42318" }}>{error}</p>
      )}

      {message && (
        <p role="status" style={{ color: "#087F75" }}>{message}</p>
      )}

      <section style={card}>
        <h2>Harcama İtirazları ({cases.length})</h2>

        <button
          style={button}
          disabled={!API || busy}
          onClick={() => void refresh()}
        >
          Listeyi yenile
        </button>

        {cases.length === 0 && <p>Kayıtlı itiraz bulunmuyor.</p>}

        {cases.map((item) => (
          <div
            key={item.id}
            style={{
              padding: "15px 0",
              borderBottom: "1px solid #E2E8F0",
            }}
          >
            <strong>Sipariş: {item.orderId}</strong>
            {sellerBankReference(item) && (
              <p>
                <strong>Banka itiraz referansı:</strong>{" "}
                {sellerBankReference(item)}
              </p>
            )}
            <p>
              {money(item.disputedAmount, item.currency)}
              {" · "}
              {labels[item.status] || item.status}
            </p>
            <p>Belge son tarihi: {dateText(item.responseDueAt)}</p>

            <button
              style={button}
              disabled={!API || busy}
              onClick={() => void openCase(item.id)}
            >
              İncele
            </button>
          </div>
        ))}
      </section>

      {selected && (
        <section style={card}>
          <h2>İtiraz Detayı</h2>
          <p><strong>Sipariş:</strong> {selected.orderId}</p>
          {sellerBankReference(selected) && (
            <p>
              <strong>Banka itiraz referansı:</strong>{" "}
              {sellerBankReference(selected)}
            </p>
          )}
          <p><strong>Neden:</strong> {selected.reason}</p>
          <p><strong>Durum:</strong> {labels[selected.status] || selected.status}</p>
          <p><strong>Bildirim:</strong> {dateText(selected.notifiedAt)}</p>
          <p><strong>Son tarih:</strong> {dateText(selected.responseDueAt)}</p>

          {["OPEN", "EVIDENCE_PREPARING"].includes(selected.status) && (
            <div style={{ marginTop: 20 }}>
              <h3>Savunma Belgesi Yükle</h3>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="DELIVERY">Teslimat belgesi</option>
                <option value="INVOICE">Fatura</option>
                <option value="ORDER">Sipariş belgesi</option>
                <option value="CORRESPONDENCE">Yazışma</option>
                <option value="OTHER">Diğer</option>
              </select>

              <div style={{ margin: "14px 0" }}>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>

              <button
                style={button}
                disabled={!API || busy || !file}
                onClick={() => void upload()}
              >
                {busy ? "İşleniyor..." : "Belgeyi yükle"}
              </button>
            </div>
          )}

          <h3>Yüklediğiniz Belgeler ({evidence.length})</h3>

          {evidence.map((item) => (
            <div
              key={item.id}
              style={{
                padding: "12px 0",
                borderBottom: "1px solid #E2E8F0",
              }}
            >
              <strong>{item.fileName || "Belge"}</strong>
              <p>
                {item.category} — {dateText(item.createdAt)}
              </p>
              <button
                style={button}
                disabled={busy}
                onClick={() => void getDownload(item.id)}
              >
                Güvenli indirme bağlantısı
              </button>
            </div>
          ))}

          {download && (
            <p>
              <a
                href={download}
                target="_blank"
                rel="noopener noreferrer"
              >
                İmzalı belge bağlantısını aç
              </a>
            </p>
          )}

          <p style={{ color: "#9A6700", fontSize: 13 }}>
            Belge yüklemek, iyzico'ya resmi savunma gönderimi
            anlamına gelmez.
          </p>
        </section>
      )}
    </SellerLayout>
  );
}
