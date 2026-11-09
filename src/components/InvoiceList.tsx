import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { invoiceApi, type InvoiceRecord } from "../lib/invoiceApi";

type Props = {
  role: "BUYER" | "SELLER" | "ADMIN";
  orderId?: string;
  refreshKey?: number;
};

export default function InvoiceList({ role, orderId, refreshKey }: Props) {
  const { t } = useTranslation();
  const [records, setRecords] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openingId, setOpeningId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    const load = role === "ADMIN" ? invoiceApi.admin : invoiceApi.mine;

    load()
      .then(data => {
        if (active) setRecords(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        if (active) setError(err.message || t("invoice.loadFailed"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [role, refreshKey, t]);

  const visible = records.filter(
    record => !orderId || record.orderId === orderId,
  );

  const kindLabels: Record<string, string> = {
    SALE: t("invoice.saleInvoice"),
    RETURN: t("invoice.returnInvoice"),
    CREDIT_NOTE: t("invoice.creditNote"),
  };

  const statusLabels: Record<string, string> = {
    PENDING_REVIEW: t("invoice.pendingReview"),
    RECORDED: t("invoice.recorded"),
    REJECTED: t("invoice.rejected"),
    CANCELLED: t("invoice.cancelled"),
  };

  async function openInvoice(id: string) {
    if (openingId) return;
    setOpeningId(id);
    setError("");

    try {
      const data = await invoiceApi.download(id);
      const url = new URL(data.url);

      if (url.protocol !== "https:") {
        throw new Error(t("invoice.downloadFailed"));
      }

      const link = document.createElement("a");
      link.href = url.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("invoice.downloadFailed"));
    } finally {
      setOpeningId(null);
    }
  }

  return (
    <section style={{ padding: 20, background: "#fff", borderRadius: 14 }}>
      <h2 style={{ color: "#123b59", marginTop: 0 }}>{t("invoice.title")}</h2>

      {loading && <p>{t("invoice.submitting")}</p>}
      {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}

      {!loading && visible.length === 0 && !error && (
        <p>{t("invoice.empty")}</p>
      )}

      {visible.map(record => (
        <div
          key={record.id}
          style={{
            borderBottom: "1px solid #e2e8f0",
            padding: "12px 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <strong>{record.invoiceNumber || kindLabels[record.kind] || record.kind}</strong>
            <div style={{ fontSize: 13, color: "#64748b" }}>
              {statusLabels[record.status] || record.status}
              {" · "}
              {record.totalAmount} {record.currency}
            </div>
            {record.status === "REJECTED" && record.reviewNote?.trim() && (
              <p role="note" style={{ color: "#b91c1c", margin: "6px 0 0" }}>
                {record.reviewNote}
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={openingId !== null}
            onClick={() => openInvoice(record.id)}
            style={{
              background: "#0d9488",
              color: "#fff",
              border: 0,
              padding: "10px 14px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            {openingId === record.id ? t("invoice.submitting") : t("invoice.download")}
          </button>
        </div>
      ))}
    </section>
  );
}
