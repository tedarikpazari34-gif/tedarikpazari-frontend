import { useEffect, useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";

type Status =
  | "OPEN"
  | "EVIDENCE_PREPARING"
  | "EVIDENCE_SUBMITTED"
  | "UNDER_REVIEW"
  | "WON"
  | "LOST"
  | "CLOSED";

type Chargeback = {
  id: string;
  orderId: string;
  providerReference: string;
  disputedAmount: string | number;
  currency: string;
  reason: string;
  status: Status;
  notifiedAt: string;
  responseDueAt?: string | null;
  createdAt: string;
};

type EvidenceItem = {
  id: string;
  category: string;
  fileName?: string | null;
  sha256: string;
  uploadedById: string;
  createdAt: string;
};

type EventItem = {
  id: string;
  action: string;
  previousStatus?: string | null;
  nextStatus?: string | null;
  note?: string | null;
  createdAt: string;
};

const API = import.meta.env.VITE_CHARGEBACK_ENABLED === "true"
  ? (import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api").replace(/\/$/, "")
  : "";

const transitions: Record<Status, Status[]> = {
  OPEN: ["EVIDENCE_PREPARING", "CLOSED"],
  EVIDENCE_PREPARING: ["EVIDENCE_SUBMITTED", "CLOSED"],
  EVIDENCE_SUBMITTED: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["WON", "LOST"],
  WON: ["CLOSED"],
  LOST: ["CLOSED"],
  CLOSED: [],
};

const statusLabels: Record<Status, string> = {
  OPEN: "Açık",
  EVIDENCE_PREPARING: "Deliller hazırlanıyor",
  EVIDENCE_SUBMITTED: "İyzico gönderimi manuel kaydedildi",
  UNDER_REVIEW: "İncelemede",
  WON: "Kazanıldı (manuel kayıt)",
  LOST: "Kaybedildi (manuel kayıt)",
  CLOSED: "Kapalı",
};

const panel: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #DFE9EF",
  borderRadius: 16,
  padding: 22,
  marginBottom: 20,
};

const field: React.CSSProperties = {
  width: "100%",
  border: "1px solid #CBD5E1",
  padding: "11px 12px",
  borderRadius: 9,
  boxSizing: "border-box",
  background: "#FFFFFF",
  color: "#17324D",
};

const primary: React.CSSProperties = {
  background: "#079B9B",
  color: "#FFFFFF",
  border: "none",
  borderRadius: 9,
  padding: "11px 17px",
  cursor: "pointer",
  fontWeight: 700,
};

const label: React.CSSProperties = {
  display: "block",
  fontWeight: 600,
  marginBottom: 6,
  color: "#17324D",
};

function money(value: string | number, currency: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currency || "TRY",
  }).format(amount);
}

function dateText(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("tr-TR");
}

export default function AdminChargebacksPage() {
  const [records, setRecords] = useState<Chargeback[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [orderId, setOrderId] = useState("");
  const [providerReference, setProviderReference] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [notifiedAt, setNotifiedAt] = useState("");
  const [responseDueAt, setResponseDueAt] = useState("");
  const [deadlineValue, setDeadlineValue] = useState("");
  const [deadlineNote, setDeadlineNote] = useState("");

  const [nextStatus, setNextStatus] = useState<Status | "">("");
  const [note, setNote] = useState("");
  const [decisionReference, setDecisionReference] = useState("");
  const [submissionReference, setSubmissionReference] = useState("");
  const [submissionAt, setSubmissionAt] = useState("");
  const [category, setCategory] = useState("DELIVERY");
  const [file, setFile] = useState<File | null>(null);
  const [caseEvidence, setCaseEvidence] = useState<EvidenceItem[]>([]);
  const [caseEvents, setCaseEvents] = useState<EventItem[]>([]);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadExpiry, setDownloadExpiry] = useState("");

  const selected = records.find((record) => record.id === selectedId);

  async function apiRequest(path: string, options: RequestInit = {}) {
    if (!API) throw new Error("Harcama itirazı modülü henüz etkinleştirilmedi.");
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Oturum bulunamadı. Yeniden giriş yapın.");

    const response = await fetch(`${API}${path}`, {
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
            : `İşlem başarısız (HTTP ${response.status})`,
      );
    }
    return data;
  }

  async function loadRecords() {
    if (!API) return;
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/admin/chargebacks");
      if (!Array.isArray(data)) throw new Error("Geçersiz liste yanıtı.");
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Liste yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRecords();
  }, []);

  useEffect(() => {
    setDeadlineValue("");
    setDeadlineNote("");
  }, [selectedId]);

  async function createRecord() {
    if (busy) return;
    setError("");
    setMessage("");

    if (!orderId.trim() || !providerReference.trim() ||
        !reason.trim() || !notifiedAt ||
        !/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(amount) ||
        Number(amount) <= 0) {
      setError("Sipariş, banka referansı, tutar, sebep ve bildirim tarihi gerekli.");
      return;
    }

    if (responseDueAt) {
      const due = new Date(responseDueAt);
      const notified = new Date(`${notifiedAt}T12:00:00`);

      if (!Number.isFinite(due.getTime()) ||
          due.getTime() < notified.getTime()) {
        setError("Resmî son tarih, bildirim tarihinden önce olamaz.");
        return;
      }
    }

    setBusy(true);
    try {
      await apiRequest("/admin/chargebacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderId.trim(),
          providerReference: providerReference.trim(),
          disputedAmount: amount,
          reason: reason.trim(),
          notifiedAt: new Date(`${notifiedAt}T12:00:00`).toISOString(),
          ...(responseDueAt
            ? { responseDueAt: new Date(responseDueAt).toISOString() }
            : {}),
        }),
      });
      setMessage("İtiraz kaydı oluşturuldu.");
      setOrderId("");
      setProviderReference("");
      setAmount("");
      setReason("");
      setResponseDueAt("");
      await loadRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt oluşturulamadı.");
    } finally {
      setBusy(false);
    }
  }

  async function loadDetail(id: string) {
    setSelectedId(id);
    setCaseEvidence([]);
    setCaseEvents([]);
    setDownloadUrl("");
    setDownloadExpiry("");
    setNextStatus("");
    setError("");

    try {
      const detail = await apiRequest(
        `/admin/chargebacks/${encodeURIComponent(id)}`,
      );
      if (!Array.isArray(detail?.evidence) ||
          !Array.isArray(detail?.events)) {
        throw new Error("İtiraz detay yanıtı geçersiz.");
      }

      setCaseEvidence(detail.evidence);
      setCaseEvents(detail.events);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "İtiraz detayları yüklenemedi.",
      );
    }
  }

  async function updateStatus() {
    if (!selected || !nextStatus || busy) return;
    setError("");
    setMessage("");

    if (note.trim().length < 10) {
      setError("Durum değişikliği açıklaması en az 10 karakter olmalı.");
      return;
    }

    if (nextStatus === "EVIDENCE_SUBMITTED") {
      const sentAt = new Date(submissionAt);

      if (
        submissionReference.trim().length < 5 ||
        !submissionAt ||
        Number.isNaN(sentAt.getTime()) ||
        sentAt.getTime() > Date.now()
      ) {
        setError("İyzico gönderim referansı ve tarihi zorunludur.");
        return;
      }

      if (!window.confirm(
        "Belgeler gerçekten iyzico'ya gönderildi mi? " +
        "Bu yalnızca manuel takip kaydıdır.",
      )) return;
    }

    if (["WON", "LOST"].includes(nextStatus)) {
      if (decisionReference.trim().length < 5) {
        setError("Banka karar referansı zorunludur.");
        return;
      }
      if (!window.confirm(
        "Resmi iyzico/banka kararını bağımsız olarak doğruladınız mı? " +
        "Bu işlem yalnızca manuel takip kaydıdır.",
      )) return;
    }

    setBusy(true);
    try {
      await apiRequest(`/admin/chargebacks/${encodeURIComponent(selected.id)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedStatus: selected.status,
          nextStatus,
          note: note.trim(),
          ...(nextStatus === "EVIDENCE_SUBMITTED"
            ? {
                iyzicoSubmissionReference: submissionReference.trim(),
                iyzicoSubmissionAt: new Date(submissionAt).toISOString(),
              }
            : {}),
          ...(["WON", "LOST"].includes(nextStatus)
            ? { bankDecisionReference: decisionReference.trim() }
            : {}),
        }),
      });
      setMessage("Durum güncellendi. Bu işlem banka sonucu doğrulaması değildir.");
      setNextStatus("");
      setNote("");
      setDecisionReference("");
      setSubmissionReference("");
      setSubmissionAt("");
      await loadRecords();
      await loadDetail(selected.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Durum güncellenemedi.");
    } finally {
      setBusy(false);
    }
  }

  async function saveResponseDeadline() {
    if (!selected || busy ||
        !["OPEN", "EVIDENCE_PREPARING"].includes(selected.status)) {
      return;
    }

    setError("");
    setMessage("");

    const due = new Date(deadlineValue);
    const note = deadlineNote.trim();

    if (!deadlineValue ||
        !Number.isFinite(due.getTime()) ||
        note.length < 10 ||
        note.length > 500) {
      setError("Resmî son tarih, saat ve bilgi kaynağı açıklaması zorunludur.");
      return;
    }

    if (due.getTime() < new Date(selected.notifiedAt).getTime()) {
      setError("Son tarih, itiraz bildiriminden önce olamaz.");
      return;
    }

    setBusy(true);

    try {
      await apiRequest(
        `/admin/chargebacks/${encodeURIComponent(selected.id)}/deadline`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            responseDueAt: due.toISOString(),
            note,
          }),
        },
      );

      setDeadlineValue("");
      setDeadlineNote("");
      await loadRecords();
      setMessage("Resmî son tarih ve bilgi kaynağı kaydedildi.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Resmî son tarih kaydedilemedi.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function uploadEvidence() {
    if (!selected || !file || busy) return;
    setError("");
    setMessage("");

    if (file.size === 0 || file.size > 10 * 1024 * 1024 ||
        !["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Yalnızca PDF, JPG, PNG veya WEBP (en fazla 10 MB) yükleyin.");
      return;
    }

    const form = new FormData();
    form.append("file", file);
    form.append("category", category.trim());

    setBusy(true);
    try {
      await apiRequest(
        `/admin/chargebacks/${encodeURIComponent(selected.id)}/evidence`,
        { method: "POST", body: form },
      );
      await loadDetail(selected.id);
      setFile(null);
      setMessage("Delil yüklendi ve SHA-256 kaydı oluşturuldu.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delil yüklenemedi.");
    } finally {
      setBusy(false);
    }
  }

  async function requestDownload(evidenceId: string) {
    if (!selected) return;
    setError("");
    setDownloadUrl("");
    setDownloadExpiry("");

    try {
      const result = await apiRequest(
        `/admin/chargebacks/${encodeURIComponent(selected.id)}/evidence/` +
        `${encodeURIComponent(evidenceId)}/download`,
      );
      const url = new URL(result.url);
      if (url.protocol !== "https:" || url.hostname !== "api.cloudinary.com") {
        throw new Error("Beklenmeyen belge indirme adresi.");
      }
      setDownloadUrl(result.url);
      setDownloadExpiry(result.expiresAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bağlantı oluşturulamadı.");
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F5F9FB" }}>
      <AdminSidebar />
      <main style={{ flex: 1, minWidth: 0, padding: "28px", color: "#17324D" }}>
        <h1 style={{ marginTop: 0, color: "#123456" }}>Harcama İtirazları</h1>
        <p style={{ color: "#526579" }}>
          İyzico ters ibraz kayıtları, delilleri ve yönetici inceleme geçmişi.
          Platformdaki sipariş uyuşmazlıklarından ayrıdır.
        </p>

        {!API && (
          <div style={{ ...panel, borderColor: "#F0C68A", background: "#FFF8EA" }}>
            <strong>Harcama itirazı modülü henüz etkin değil.</strong>
            <p>
              Veritabanı geçişi tamamlandıktan sonra
              VITE_CHARGEBACK_ENABLED=true ile etkinleştirilecektir.
            </p>
          </div>
        )}

        {error && <p role="alert" style={{ color: "#B42318", fontWeight: 700 }}>{error}</p>}
        {message && <p role="status" style={{ color: "#087F75", fontWeight: 700 }}>{message}</p>}

        <section style={panel}>
          <h2 style={{ marginTop: 0 }}>Yeni banka itirazı</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 15 }}>
            <div><label style={label}>Sipariş ID</label><input style={field} value={orderId} onChange={(e) => setOrderId(e.target.value)} /></div>
            <div><label style={label}>İyzico/banka itiraz referansı</label><input style={field} value={providerReference} onChange={(e) => setProviderReference(e.target.value)} /></div>
            <div><label style={label}>İtiraz tutarı (TL)</label><input style={field} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="90.00" /></div>
            <div><label style={label}>Banka bildirim tarihi</label><input style={field} type="date" value={notifiedAt} onChange={(e) => setNotifiedAt(e.target.value)} /></div>
            <div><label style={label}>Resmî son yanıt tarihi ve saati (biliniyorsa)</label><input style={field} type="datetime-local" value={responseDueAt} onChange={(e) => setResponseDueAt(e.target.value)} /></div>
            <div><label style={label}>İtiraz nedeni</label><input style={field} value={reason} onChange={(e) => setReason(e.target.value)} /></div>
          </div>
          <p style={{ fontSize: 13, color: "#64748B" }}>
            Bu kayıt, iyzico'da gerçekten itiraz açıldığını otomatik olarak doğrulamaz.
          </p>
          <button style={primary} disabled={!API || busy} onClick={() => void createRecord()}>
            İtiraz kaydını oluştur
          </button>
        </section>

        <section style={panel}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <h2 style={{ margin: 0 }}>İtiraz kayıtları ({records.length})</h2>
            <button style={primary} disabled={!API || loading} onClick={() => void loadRecords()}>
              {loading ? "Yükleniyor..." : "Yenile"}
            </button>
          </div>
          <div style={{ overflowX: "auto", marginTop: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr>
                  {["Sipariş", "İtiraz referansı", "Tutar", "Durum", "Yanıt tarihi", "İşlem"].map((heading) =>
                    <th key={heading} style={{ padding: 12, borderBottom: "1px solid #DDE7EE" }}>{heading}</th>,
                  )}
                </tr>
              </thead>
              <tbody>
                {records.map((item) => (
                  <tr key={item.id} style={{ background: item.id === selectedId ? "#E7F8F7" : "transparent" }}>
                    <td style={{ padding: 12 }}>{item.orderId}</td>
                    <td style={{ padding: 12 }}>{item.providerReference}</td>
                    <td style={{ padding: 12 }}>{money(item.disputedAmount, item.currency)}</td>
                    <td style={{ padding: 12 }}>{statusLabels[item.status]}</td>
                    <td style={{ padding: 12 }}>
                      {!item.responseDueAt &&
                       ["OPEN", "EVIDENCE_PREPARING"].includes(item.status)
                        ? <strong style={{ color: "#B42318" }}>
                            Son tarih bilinmiyor — acil işlem gerekli
                          </strong>
                        : dateText(item.responseDueAt)}
                    </td>
                    <td style={{ padding: 12 }}>
                      <button style={primary} onClick={() => void loadDetail(item.id)}>İncele</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && records.length === 0 && <p>Görüntülenecek itiraz kaydı yok.</p>}
          </div>
        </section>

        {selected && (
          <section style={panel}>
            <h2 style={{ marginTop: 0 }}>İtiraz incelemesi</h2>
            <p><strong>Sipariş:</strong> {selected.orderId} · <strong>Durum:</strong> {statusLabels[selected.status]}</p>
            <p><strong>Neden:</strong> {selected.reason} · <strong>Bildirim:</strong> {dateText(selected.notifiedAt)}</p>
            <p><strong>Resmî son yanıt tarihi:</strong> {selected.responseDueAt ? dateText(selected.responseDueAt) : "Henüz belirlenmedi"}</p>

            {["OPEN", "EVIDENCE_PREPARING"].includes(selected.status) && (
              <div style={{
                display: "grid",
                gap: 10,
                maxWidth: 680,
                marginBottom: 20,
              }}>
                {!selected.responseDueAt && (
                  <p role="alert" style={{ color: "#B42318", fontWeight: 700 }}>
                    Son tarih bilinmiyor — acil işlem gerekli.
                    İyzico Merchant Panel'den resmî son tarihi ve saatini doğrulayın.
                  </p>
                )}
                <label style={label}>Resmî son tarih ve saat</label>
                <input
                  style={field}
                  type="datetime-local"
                  value={deadlineValue}
                  onChange={(e) => setDeadlineValue(e.target.value)}
                />
                <label style={label}>
                  Bilgi kaynağı ve açıklama (10–500 karakter)
                </label>
                <textarea
                  style={{ ...field, minHeight: 75 }}
                  value={deadlineNote}
                  maxLength={500}
                  onChange={(e) => setDeadlineNote(e.target.value)}
                  placeholder="Örn. iyzico Merchant Panel üzerindeki resmî son tarih"
                />
                <button
                  style={primary}
                  disabled={
                    !API || busy || !deadlineValue ||
                    deadlineNote.trim().length < 10
                  }
                  onClick={() => void saveResponseDeadline()}
                >
                  Resmî son tarihi kaydet / güncelle
                </button>
              </div>
            )}

            {transitions[selected.status].length > 0 && (
              <div style={{ display: "grid", gap: 12, maxWidth: 680 }}>
                <label style={label}>Yeni durum</label>
                <select style={field} value={nextStatus} onChange={(e) => setNextStatus(e.target.value as Status | "")}>
                  <option value="">Durum seçin</option>
                  {transitions[selected.status].map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
                </select>
                <label style={label}>İşlem açıklaması (en az 10 karakter)</label>
                <textarea style={{ ...field, minHeight: 80 }} value={note} onChange={(e) => setNote(e.target.value)} />
                {nextStatus === "EVIDENCE_SUBMITTED" && (
                  <>
                    <label style={label}>İyzico gönderim referansı</label>
                    <input
                      style={field}
                      value={submissionReference}
                      onChange={(e) => setSubmissionReference(e.target.value)}
                    />
                    <label style={label}>Gönderim tarihi ve saati</label>
                    <input
                      type="datetime-local"
                      style={field}
                      value={submissionAt}
                      onChange={(e) => setSubmissionAt(e.target.value)}
                    />
                    <p style={{ color: "#9A6700", fontSize: 13 }}>
                      Yalnızca iyzico'ya gerçekten gönderilmiş
                      belgeleri kaydedin. Bu otomatik doğrulama değildir.
                    </p>
                  </>
                )}
                {(nextStatus === "WON" || nextStatus === "LOST") && (
                  <>
                    <label style={label}>Resmi banka karar referansı</label>
                    <input style={field} value={decisionReference} onChange={(e) => setDecisionReference(e.target.value)} />
                    <p style={{ color: "#9A6700", fontSize: 13 }}>
                      Referansın doğruluğunu iyzico paneliyle karşılaştırın.
                      Sistem otomatik banka doğrulaması yapmıyor.
                    </p>
                  </>
                )}
                <button style={primary} disabled={!API || busy || !nextStatus} onClick={() => void updateStatus()}>
                  Durumu kaydet
                </button>
              </div>
            )}

            {!["WON", "LOST", "CLOSED"].includes(selected.status) && (
              <div style={{ marginTop: 28, borderTop: "1px solid #E2E8F0", paddingTop: 20 }}>
                <h3>Delil yükle</h3>
                <div style={{ display: "grid", gap: 12, maxWidth: 680 }}>
                  <label style={label}>Delil kategorisi</label>
                  <select style={field} value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="DELIVERY">Teslimat belgesi</option>
                    <option value="INVOICE">Fatura</option>
                    <option value="ORDER">Sipariş kaydı</option>
                    <option value="CORRESPONDENCE">Yazışma</option>
                    <option value="OTHER">Diğer</option>
                  </select>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  <button style={primary} disabled={!API || busy || !file} onClick={() => void uploadEvidence()}>
                    Belgeyi yükle
                  </button>
                </div>
              </div>
            )}

            <div style={{ marginTop: 25 }}>
              <h3>Kaydedilmiş deliller ({caseEvidence.length})</h3>
              {caseEvidence.length === 0 && (
                <p style={{ color: "#64748B" }}>
                  Bu itiraz için kayıtlı belge bulunmuyor.
                </p>
              )}
              {caseEvidence.map((item) => (
                <div key={item.id} style={{
                  padding: "12px 0",
                  borderBottom: "1px solid #E2E8F0",
                }}>
                  <strong>{item.fileName || "Belge"}</strong>
                  <div>Kategori: {item.category}</div>
                  <div>Yüklenme: {dateText(item.createdAt)}</div>
                  <div style={{ overflowWrap: "anywhere", fontSize: 12 }}>
                    SHA-256: {item.sha256}
                  </div>
                  <button
                    style={{ ...primary, marginTop: 8 }}
                    onClick={() => void requestDownload(item.id)}
                  >
                    Güvenli indirme bağlantısı
                  </button>
                </div>
              ))}
              {downloadUrl && (
                <p>
                  <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                    İmzalı belge bağlantısını aç
                  </a>
                  {" "}— Geçerlilik: {dateText(downloadExpiry)}
                </p>
              )}
            </div>
          </section>
        )}

        {selected && (
          <section style={panel}>
            <h2>İtiraz işlem geçmişi ({caseEvents.length})</h2>
            {caseEvents.length === 0 && (
              <p>Bu itiraza ait işlem geçmişi bulunmuyor.</p>
            )}
            {caseEvents.map((event) => (
              <div key={event.id} style={{
                padding: "12px 0",
                borderBottom: "1px solid #E2E8F0",
              }}>
                <strong>{event.action}</strong>
                <span style={{ marginLeft: 12, color: "#64748B" }}>
                  {dateText(event.createdAt)}
                </span>
                {(event.previousStatus || event.nextStatus) && (
                  <div>
                    {event.previousStatus || "—"} → {event.nextStatus || "—"}
                  </div>
                )}
                {event.note && <p>{event.note}</p>}
              </div>
            ))}
          </section>
        )}

        <p style={{ color: "#64748B", fontSize: 13 }}>
          Harcama itirazları izleme amaçlıdır. Bu ekrandan otomatik ödeme,
          iade, escrow serbest bırakma veya satıcıya para aktarımı yapılmaz.
        </p>
      </main>
    </div>
  );
}
