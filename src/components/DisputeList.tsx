import InvoiceUploadForm from "./InvoiceUploadForm";
import { invoiceDisputeEligible } from "../lib/invoiceDisputeEligible";
import { invoiceApi, type InvoiceRecord } from "../lib/invoiceApi";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api";

interface DisputeFile {
  id: string;
  fileName?: string;
}

interface DisputeItem {
  id: string;
  orderId: string;
  reason: string;
  description?: string;
  status: string;
  resolution?: string | null;
  resolvedAt?: string | null;
  order?: { status?: string | null } | null;
  files?: DisputeFile[];
}

interface Props {
  disputes: DisputeItem[];
  panelCardStyle: React.CSSProperties;
}

export default function DisputeList({
  disputes,
  panelCardStyle,
}: Props) {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [invoiceError, setInvoiceError] = useState("");

  const reloadInvoices = async () => {
    try {
      const data = await invoiceApi.mine();
      setInvoices(Array.isArray(data) ? data : []);
      setInvoiceError("");
    } catch (error) {
      setInvoiceError(
        error instanceof Error ? error.message : "Faturalar yüklenemedi",
      );
    }
  };

  useEffect(() => {
    void reloadInvoices();
  }, []);


  const openEvidence = async (disputeId: string, fileId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Oturum bulunamadı");

      const res = await fetch(
        `${API}/disputes/${encodeURIComponent(disputeId)}/evidence/${encodeURIComponent(fileId)}/download`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Kanıt dosyası açılamadı");

      const data = await res.json();
      if (typeof data?.url !== "string" ||
          !data.url.startsWith("https://")) {
        throw new Error("Geçersiz indirme bağlantısı");
      }
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error(error);
      alert("Kanıt dosyası açılamadı.");
    }
  };

  const uploadFile = async (
    disputeId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert(t("disputeList.genericError"));
        return;
      }

      const form = new FormData();
      form.append("file", file);

      const res = await fetch(`${API}/disputes/${disputeId}/evidence`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message || t("disputeList.uploadFailed"));
        return;
      }

      alert(t("disputeList.attachSuccess"));
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(t("disputeList.genericError"));
    }
  };

  return (
    <>
      <h2>{t("disputeList.title")}</h2>

      {invoiceError && <p role="alert">{invoiceError}</p>}
      {disputes.map((d) => (
        <div key={d.id} style={panelCardStyle}>
          <div>
            <strong>{t("disputeList.order")}:</strong> {d.orderId}
          </div>

          <div>
            <strong>{t("disputeList.reason")}:</strong> {d.reason}
          </div>

          <div>
            <strong>{t("disputeList.status")}:</strong> {d.status}
          </div>

          {d.description && (
            <div>
              <strong>{t("disputeList.description")}:</strong> {d.description}
            </div>
          )}

          {invoiceDisputeEligible(d) &&
            invoices.some(
              item =>
                item.orderId === d.orderId &&
                item.kind === "SALE" &&
                item.status === "RECORDED",
            ) &&
              !invoices.some(invoice =>
                invoice.orderId === d.orderId &&
                invoice.kind === "RETURN" &&
                (invoice.status === "PENDING_REVIEW" ||
                  invoice.status === "RECORDED")
              ) && (
                <InvoiceUploadForm
                role="BUYER"
                orderId={d.orderId}
                disputeId={d.id}
                invoices={invoices}
                onUploaded={() => { void reloadInvoices(); }}
              />
            )}

          <div style={{ marginTop: 10 }}>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => uploadFile(d.id, e)}
            />
          </div>

          {d.files && d.files.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <strong>{t("disputeList.attachments")}</strong>

              {d.files.map((f) => (
                <div key={f.id}>
                  <button
                    type="button"
                    onClick={() => openEvidence(d.id, f.id)}
                    style={{ cursor: "pointer" }}
                  >
                    {f.fileName || t("disputeList.openFile")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
}