import React from "react";
import { useTranslation } from "react-i18next";

const API = "https://tedarik-backend.onrender.com/api";

interface DisputeFile {
  id: string;
  url: string;
  fileName?: string;
}

interface DisputeItem {
  id: string;
  orderId: string;
  reason: string;
  description?: string;
  status: string;
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

  const uploadFile = async (
    disputeId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const form = new FormData();
      form.append("file", file);

      const token = localStorage.getItem("token");

      // 1- Dosyayı yükle
      const uploadRes = await fetch(`${API}/upload`, {
        method: "POST",
        body: form,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        alert(uploadData.message || t("disputeList.uploadFailed"));
        return;
      }

      // 2- Dispute'e bağla
      const res = await fetch(`${API}/disputes/${disputeId}/files`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: uploadData.imageUrl,
          fileName: file.name,
          fileType: file.type,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || t("disputeList.attachFailed"));
        return;
      }

      alert(t("disputeList.attachSuccess"));

      // Sayfayı yenilemek yerine sonra state güncelleyeceğiz.
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(t("disputeList.genericError"));
    }
  };

  return (
    <>
      <h2>{t("disputeList.title")}</h2>

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
                  <a
                    href={`https://tedarik-backend.onrender.com${f.url}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {f.fileName || t("disputeList.openFile")}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
}