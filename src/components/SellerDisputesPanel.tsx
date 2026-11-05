import { useEffect, useState } from "react";
import InvoiceUploadForm from "./InvoiceUploadForm";
import { invoiceDisputeEligible } from "../lib/invoiceDisputeEligible";
import { invoiceApi, type InvoiceRecord } from "../lib/invoiceApi";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api";

type Evidence = { id: string; fileName?: string };
type Dispute = {
  id: string;
  orderId: string;
  reason: string;
  status: string;
  resolution?: string | null;
  resolvedAt?: string | null;
  order?: { status?: string | null } | null;
  sellerNote?: string | null;
  files?: Evidence[];
};

export default function SellerDisputesPanel() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Dispute[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [invoiceError, setInvoiceError] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const reloadInvoices = async () => {
    try {
      const result = await invoiceApi.mine();
      setInvoices(Array.isArray(result) ? result : []);
      setInvoiceError("");
    } catch {
      setInvoiceError(t("invoice.loadFailed"));
    }
  };

  const getToken = () => localStorage.getItem("token");

  const load = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API}/disputes/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Uyuşmazlıklar alınamadı");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError(t("disputeList.genericError"));
    }
  };

  useEffect(() => {
    void load();
    void reloadInvoices();
  }, []);

  const request = async (url: string, body: BodyInit, contentType?: string) => {
    const token = getToken();
    if (!token) throw new Error("Oturum bulunamadı");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(contentType ? { "Content-Type": contentType } : {}),
      },
      body,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(
        typeof data?.message === "string" ? data.message : "İşlem başarısız",
      );
    }
  };

  const respond = async (id: string) => {
    const note = window.prompt(t("sellerOrdersPage.disputeReasonPrompt"));
    if (!note?.trim() || busy) return;
    setBusy(true);
    try {
      await request(
        `${API}/disputes/${encodeURIComponent(id)}/respond`,
        JSON.stringify({ sellerNote: note.trim() }),
        "application/json",
      );
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "İşlem başarısız");
    } finally { setBusy(false); }
  };

  const upload = async (id: string, file?: File) => {
    if (!file || busy) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      await request(`${API}/disputes/${encodeURIComponent(id)}/evidence`, form);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Yükleme başarısız");
    } finally { setBusy(false); }
  };

  const download = async (id: string, fileId: string) => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(
        `${API}/disputes/${encodeURIComponent(id)}/evidence/${encodeURIComponent(fileId)}/download`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Dosya açılamadı");
      const data = await res.json();
      if (typeof data.url !== "string" || !data.url.startsWith("https://"))
        throw new Error("Geçersiz dosya bağlantısı");
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      alert(t("disputeList.genericError"));
    }
  };

  return (
    <section style={{ margin: "24px 0", padding: 20, border: "1px solid #99d9d4", borderRadius: 12 }}>
      <h2>{t("disputeList.title")}</h2>
      {error && <p role="alert">{error}</p>}
      {invoiceError && <p role="alert">{invoiceError}</p>}
      {items.map((d) => (
        <article key={d.id} style={{ padding: 12, marginBottom: 12, borderBottom: "1px solid #ddd" }}>
          <p><strong>{t("disputeList.order")}:</strong> {d.orderId}</p>
          <p><strong>{t("disputeList.reason")}:</strong> {d.reason}</p>
          <p><strong>{t("disputeList.status")}:</strong> {d.status}</p>
          {d.sellerNote && <p>{d.sellerNote}</p>}
          {(d.status === "OPEN" || d.status === "SELLER_RESPONDED") && (
            <>
              {d.status === "OPEN" && (
                <button disabled={busy} onClick={() => respond(d.id)}>
                  {t("sellerOrdersPage.respondToDispute")}
                </button>
              )}
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
                disabled={busy}
                onChange={(e) => {
                  const f = e.currentTarget.files?.[0];
                  void upload(d.id, f);
                  e.currentTarget.value = "";
                }}
              />
            </>
          )}
          {invoiceDisputeEligible(d) &&
            invoices.some(invoice =>
              invoice.orderId === d.orderId &&
              invoice.kind === "SALE" &&
              invoice.status === "RECORDED"
            ) &&
              !invoices.some(invoice =>
                invoice.orderId === d.orderId &&
                invoice.kind === "CREDIT_NOTE" &&
                (invoice.status === "PENDING_REVIEW" ||
                  invoice.status === "RECORDED")
              ) && (
                <InvoiceUploadForm
                role="SELLER"
                returnOnly
                orderId={d.orderId}
                disputeId={d.id}
                invoices={invoices}
                onUploaded={() => { void reloadInvoices(); }}
              />
            )}
          {d.files?.map((f) => (
            <div key={f.id}>
              <button type="button" onClick={() => download(d.id, f.id)}>
                {f.fileName || t("disputeList.openFile")}
              </button>
            </div>
          ))}
        </article>
      ))}
    </section>
  );
}
