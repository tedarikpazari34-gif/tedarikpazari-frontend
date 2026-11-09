import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { invoiceApi, type InvoiceRecord } from "../lib/invoiceApi";
import InvoiceList from "./InvoiceList";

export default function AdminInvoiceManager() {
  const { t } = useTranslation();
  const [records, setRecords] = useState<InvoiceRecord[]>([]);
  const [invoiceRefreshKey, setInvoiceRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [inspectedIds, setInspectedIds] = useState<string[]>([]);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await invoiceApi.admin();
      setRecords(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("invoice.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { void reload(); }, [reload]);

  async function inspectPdf(id: string) {
    if (openingId || busyId) return;

    const tab = window.open("about:blank", "_blank");
    if (!tab) {
      setError(t("invoice.popupBlocked"));
      return;
    }

    setOpeningId(id);
    setError("");

    try {
      const result = await invoiceApi.download(id);
      const url = new URL(result.url);

      if (url.protocol !== "https:") {
        throw new Error(t("invoice.unsafePdf"));
      }

      if (tab.closed) {
        throw new Error(t("invoice.tabClosed"));
      }

      tab.opener = null;
      tab.location.replace(url.href);
      setInspectedIds(current =>
        current.includes(id) ? current : [...current, id],
      );
    } catch (err) {
      if (!tab.closed) tab.close();
      setError(err instanceof Error ? err.message : t("invoice.downloadFailed"));
    } finally {
      setOpeningId(null);
    }
  }

  async function review(id: string, action: "APPROVE" | "REJECT") {
    if (busyId || openingId) return;
    if (action === "APPROVE" && !inspectedIds.includes(id)) {
      setError(t("invoice.inspectFirst"));
      return;
    }

    const reason = action === "REJECT"
      ? window.prompt(t("invoice.reasonPrompt"))
      : undefined;

    if (action === "REJECT" && (reason == null || reason.trim().length < 10)) {
      return;
    }

    if (!window.confirm(action === "APPROVE"
      ? t("invoice.approveConfirm")
      : t("invoice.rejectConfirm"))) {
      return;
    }

    setBusyId(id);
    setError("");
    setMessage("");

    try {
      await invoiceApi.review(id, action, reason?.trim());
      setInspectedIds(current => current.filter(value => value !== id));
      setMessage(action === "APPROVE" ? t("invoice.approvedMessage") : t("invoice.rejectedMessage"));
      await reload();
      setInvoiceRefreshKey(value => value + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("invoice.reviewFailed"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section style={{ marginTop: 24 }}>
      <InvoiceList role="ADMIN" refreshKey={invoiceRefreshKey} />
      <h2 style={{ color: "#123b59" }}>{t("invoice.reviewTitle")}</h2>
      {loading && <p>{t("invoice.loading")}</p>}
      {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
      {message && <p role="status" style={{ color: "#0d9488" }}>{message}</p>}

      {!loading && records.filter(r => r.status === "PENDING_REVIEW").map(r => (
        <article key={r.id} style={{
          background: "#fff", border: "1px solid #e2e8f0",
          borderRadius: 12, padding: 16, marginBottom: 12,
        }}>
          <strong>{r.invoiceNumber || r.id}</strong>
          <p>Sipariş: {r.orderId} · Tür: {r.kind} · Tutar: {r.totalAmount} {r.currency}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              disabled={busyId !== null || openingId !== null}
              onClick={() => { void inspectPdf(r.id); }}
            >
              {openingId === r.id ? t("invoice.openingPdf") : t("invoice.inspectPdf")}
            </button>
            <button type="button"
              disabled={busyId !== null || openingId !== null ||
                !inspectedIds.includes(r.id)}
              onClick={() => review(r.id, "APPROVE")}>
              {t("invoice.approve")}
            </button>
            <button type="button" disabled={busyId !== null}
              onClick={() => review(r.id, "REJECT")}>
              {t("invoice.reject")}
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
