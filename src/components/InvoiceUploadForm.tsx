import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  invoiceApi,
  type InvoiceRecord,
} from "../lib/invoiceApi";

type Props = {
  role: "BUYER" | "SELLER";
  orderId: string;
  invoices: InvoiceRecord[];
  disputeId?: string;
  returnOnly?: boolean;
  onUploaded?: () => void;
};

type Channel = "E_INVOICE" | "E_ARCHIVE" | "PAPER";

export default function InvoiceUploadForm({
  role,
  orderId,
  invoices,
  disputeId,
  returnOnly = false,
  onUploaded,
}: Props) {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [channel, setChannel] = useState<Channel>("E_INVOICE");
  const [issuedAt, setIssuedAt] = useState("");
  const [kind] = useState<"SALE" | "RETURN" | "CREDIT_NOTE">(
    role === "SELLER" ? (returnOnly ? "CREDIT_NOTE" : "SALE") : "RETURN",
  );
  const [originalSaleInvoiceId, setOriginalSaleInvoiceId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const saleInvoices = invoices.filter(
    item =>
      item.orderId === orderId &&
      item.kind === "SALE" &&
      item.status === "RECORDED",
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    if (!file || file.type !== "application/pdf" ||
        file.size > 10 * 1024 * 1024 || file.size < 5) {
      setMessage(t("invoice.invalidPdf"));
      return;
    }

    if (!/^[A-Za-z0-9._/-]{1,64}$/.test(invoiceNumber.trim())) {
      setMessage(t("invoice.invalidNumber"));
      return;
    }

    if (!issuedAt || issuedAt > new Date().toISOString().slice(0, 10)) {
      setMessage(t("invoice.invalidDate"));
      return;
    }

    if (kind !== "SALE" && (!disputeId || !originalSaleInvoiceId)) {
      setMessage(t("invoice.missingReturnInfo"));
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      if (kind === "SALE") {
        await invoiceApi.uploadSale(
          orderId, file, invoiceNumber.trim(), channel, issuedAt,
        );
      } else {
        await invoiceApi.uploadReturn(
          orderId, file, kind, disputeId!,
          originalSaleInvoiceId, invoiceNumber.trim(),
          channel, issuedAt,
        );
      }

      setMessage(t("invoice.submitted"));
      setFile(null);
      setInvoiceNumber("");
      onUploaded?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("invoice.uploadFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{
      padding: 20, background: "#fff",
      border: "1px solid #e2e8f0", borderRadius: 14,
      display: "grid", gap: 12,
    }}>
      <h3 style={{ margin: 0, color: "#123b59" }}>{t("invoice.uploadTitle")}</h3>

      <p style={{ color: "#123b59", margin: 0 }}>
        {kind === "SALE"
          ? t("invoice.saleInvoice")
          : kind === "RETURN"
            ? t("invoice.returnInvoice")
            : t("invoice.creditNote")}
      </p>

      <label>
        {t("invoice.invoiceNumber")}
        <input required maxLength={64} value={invoiceNumber}
          onChange={e => setInvoiceNumber(e.target.value)} />
      </label>

      <label>
        {t("invoice.channel")}
        <select value={channel}
          onChange={e => setChannel(e.target.value as Channel)}>
          <option value="E_INVOICE">E-Fatura</option>
          <option value="E_ARCHIVE">E-Arşiv</option>
          <option value="PAPER">Kağıt</option>
        </select>
      </label>

      <label>
        {t("invoice.issuedAt")}
        <input type="date" required value={issuedAt}
          onChange={e => setIssuedAt(e.target.value)} />
      </label>

      {kind !== "SALE" && (
        <label>
          {t("invoice.originalSaleInvoice")}
          <select required value={originalSaleInvoiceId}
            onChange={e => setOriginalSaleInvoiceId(e.target.value)}>
            <option value="">{t("invoice.select")}</option>
            {saleInvoices.map(item => (
              <option key={item.id} value={item.id}>
                {item.invoiceNumber || item.id}
              </option>
            ))}
          </select>
        </label>
      )}

      <label>
        {t("invoice.pdfFile")}
        <input type="file" accept="application/pdf,.pdf"
          required onChange={e => setFile(e.target.files?.[0] || null)} />
      </label>

      {message && <p role="status">{message}</p>}

      <button type="submit" disabled={busy}
        style={{
          background: "#0d9488", color: "#fff",
          padding: 12, border: 0, borderRadius: 8,
        }}>
        {busy ? t("invoice.submitting") : t("invoice.submit")}
      </button>
    </form>
  );
}
