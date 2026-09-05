import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const API = "https://tedarik-backend.onrender.com/api";

type VerificationRequest = {
  id: string;
  documentUrl: string;
  documentType?: string | null;
  fileName?: string | null;
  note?: string | null;
  adminNote?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  reviewedAt?: string | null;
};

export default function CompanyVerificationPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";

  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("VERGI_LEVHASI");
  const [note, setNote] = useState("");
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const loadRequests = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API}/verification/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setRequests(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const submitVerification = async () => {
    if (!file) {
      setMessage(t("companyVerificationPage.selectDocument"));
      return;
    }

    if (!token) {
      setMessage(t("companyVerificationPage.sessionMissing"));
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch(`${API}/upload/verification`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        setMessage(uploadData?.message || t("companyVerificationPage.uploadFailed"));
        return;
      }

      const createRes = await fetch(`${API}/verification`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentUrl: uploadData.documentUrl,
          documentType,
          fileName: uploadData.originalName,
          publicId: uploadData.publicId,
          note,
        }),
      });

      const createData = await createRes.json();

      if (!createRes.ok) {
        setMessage(createData?.message || t("companyVerificationPage.applicationFailed"));
        return;
      }

      setMessage(t("companyVerificationPage.applicationReceived"));
      setFile(null);
      setNote("");
      await loadRequests();
    } catch (err) {
      console.error(err);
      setMessage(t("companyVerificationPage.processError"));
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = (status: string) => {
    if (status === "APPROVED") return t("companyVerificationPage.approved");
    if (status === "REJECTED") return t("companyVerificationPage.rejected");
    return t("companyVerificationPage.pending");
  };

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <h1 style={titleStyle}>{t("companyVerificationPage.title")}</h1>

        <p style={descStyle}>
          {t("companyVerificationPage.description")}
        </p>

        <div style={formGridStyle}>
          <label style={labelStyle}>
            {t("companyVerificationPage.documentType")}
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              style={inputStyle}
            >
              <option value="VERGI_LEVHASI">
                {t("companyVerificationPage.taxCertificate")}
              </option>
              <option value="FAALIYET_BELGESI">
                {t("companyVerificationPage.activityCertificate")}
              </option>
              <option value="TICARET_SICIL">
                {t("companyVerificationPage.tradeRegistry")}
              </option>
              <option value="DIGER">
                {t("companyVerificationPage.other")}
              </option>
            </select>
          </label>

          <label style={labelStyle}>
            {t("companyVerificationPage.document")}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            {t("companyVerificationPage.note")}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("companyVerificationPage.notePlaceholder")}
              style={{ ...inputStyle, minHeight: 100 }}
            />
          </label>
        </div>

        <button
          onClick={submitVerification}
          disabled={loading}
          style={buttonStyle}
        >
          {loading
            ? t("companyVerificationPage.sending")
            : t("companyVerificationPage.submit")}
        </button>

        {message && <div style={messageStyle}>{message}</div>}
      </section>

      <section style={cardStyle}>
        <h2 style={subTitleStyle}>
          {t("companyVerificationPage.myApplications")}
        </h2>

        {requests.length === 0 ? (
          <div style={emptyStyle}>
            {t("companyVerificationPage.noApplications")}
          </div>
        ) : (
          <div style={listStyle}>
            {requests.map((request) => (
              <div key={request.id} style={requestStyle}>
                <div>
                  <strong>{statusLabel(request.status)}</strong>
                  <div style={mutedStyle}>
                    {request.fileName ||
                      request.documentType ||
                      t("companyVerificationPage.documentFallback")}
                  </div>
                  <div style={mutedStyle}>
                    {new Date(request.createdAt).toLocaleString(locale)}
                  </div>
                </div>

                <a
                  href={request.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={linkStyle}
                >
                  {t("companyVerificationPage.viewDocument")}
                </a>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: 32,
} as const;

const cardStyle = {
  maxWidth: 900,
  margin: "0 auto 24px",
  background: "white",
  borderRadius: 24,
  padding: 28,
  border: "1px solid #e2e8f0",
} as const;

const titleStyle = {
  margin: "0 0 10px",
  fontSize: 34,
  fontWeight: 900,
} as const;

const subTitleStyle = {
  margin: "0 0 16px",
  fontSize: 24,
  fontWeight: 900,
} as const;

const descStyle = {
  color: "#475569",
  lineHeight: 1.7,
  marginBottom: 24,
} as const;

const formGridStyle = {
  display: "grid",
  gap: 16,
} as const;

const labelStyle = {
  display: "grid",
  gap: 8,
  fontWeight: 800,
  color: "#0f172a",
} as const;

const inputStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
} as const;

const buttonStyle = {
  marginTop: 20,
  border: "none",
  background: "#1d4ed8",
  color: "white",
  padding: "12px 18px",
  borderRadius: 12,
  fontWeight: 900,
  cursor: "pointer",
} as const;

const messageStyle = {
  marginTop: 16,
  padding: 12,
  borderRadius: 12,
  background: "#eff6ff",
  color: "#1d4ed8",
  fontWeight: 800,
} as const;

const emptyStyle = {
  color: "#64748b",
} as const;

const listStyle = {
  display: "grid",
  gap: 12,
} as const;

const requestStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 16,
} as const;

const mutedStyle = {
  color: "#64748b",
  marginTop: 4,
  fontSize: 14,
} as const;

const linkStyle = {
  color: "#2563eb",
  fontWeight: 800,
  textDecoration: "none",
} as const;
