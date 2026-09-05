import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const API =
  import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

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
  company?: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    city?: string | null;
    verified?: boolean;
  };
};

export default function AdminVerificationRequestsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";

  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/admin/verification-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || t("adminVerificationRequestsPage.loadFailed"));
        return;
      }

      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(t("adminVerificationRequestsPage.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const approve = async (id: string) => {
    const note =
      window.prompt(t("adminVerificationRequestsPage.adminNotePrompt")) || "";

    try {
      setActionId(id);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API}/admin/verification-requests/${id}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ adminNote: note }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data?.message || t("adminVerificationRequestsPage.approveFailed"),
        );
        return;
      }

      await loadRequests();
    } catch (err) {
      console.error(err);
      alert(t("adminVerificationRequestsPage.actionFailed"));
    } finally {
      setActionId("");
    }
  };

  const reject = async (id: string) => {
    const note =
      window.prompt(t("adminVerificationRequestsPage.rejectReasonPrompt")) || "";

    try {
      setActionId(id);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API}/admin/verification-requests/${id}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ adminNote: note }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data?.message || t("adminVerificationRequestsPage.rejectFailed"),
        );
        return;
      }

      await loadRequests();
    } catch (err) {
      console.error(err);
      alert(t("adminVerificationRequestsPage.actionFailed"));
    } finally {
      setActionId("");
    }
  };

  if (loading) {
    return (
      <main style={pageStyle}>
        {t("adminVerificationRequestsPage.loading")}
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <div style={eyebrowStyle}>
            {t("adminVerificationRequestsPage.eyebrow")}
          </div>
          <h1 style={titleStyle}>
            {t("adminVerificationRequestsPage.title")}
          </h1>
          <p style={descStyle}>
            {t("adminVerificationRequestsPage.description")}
          </p>
        </div>
      </section>

      {error && <div style={errorStyle}>{error}</div>}

      <section style={listStyle}>
        {requests.length === 0 ? (
          <div style={emptyStyle}>
            {t("adminVerificationRequestsPage.empty")}
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} style={cardStyle}>
              <div style={topStyle}>
                <div>
                  <h2 style={companyStyle}>
                    {request.company?.name ||
                      t("adminVerificationRequestsPage.unnamedCompany")}
                  </h2>
                  <div style={mutedStyle}>
                    {request.company?.email || "-"}
                  </div>
                  <div style={mutedStyle}>
                    {request.company?.city || "-"}
                  </div>
                </div>

                <span style={statusStyle(request.status)}>
                  {request.status === "PENDING"
                    ? t("adminVerificationRequestsPage.statusPending")
                    : request.status === "APPROVED"
                      ? t("adminVerificationRequestsPage.statusApproved")
                      : t("adminVerificationRequestsPage.statusRejected")}
                </span>
              </div>

              <div style={infoGridStyle}>
                <Info
                  label={t("adminVerificationRequestsPage.documentType")}
                  value={request.documentType || "-"}
                />
                <Info
                  label={t("adminVerificationRequestsPage.file")}
                  value={request.fileName || "-"}
                />
                <Info
                  label={t("adminVerificationRequestsPage.applicationDate")}
                  value={new Date(request.createdAt).toLocaleString(locale)}
                />
                <Info
                  label={t("adminVerificationRequestsPage.note")}
                  value={request.note || "-"}
                />
                <Info
                  label={t("adminVerificationRequestsPage.adminNote")}
                  value={request.adminNote || "-"}
                />
              </div>

              <div style={actionsStyle}>
                <a
                  href={request.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={documentButtonStyle}
                >
                  {t("adminVerificationRequestsPage.viewDocument")}
                </a>

                {request.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => approve(request.id)}
                      disabled={actionId === request.id}
                      style={approveButtonStyle}
                    >
                      {t("adminVerificationRequestsPage.verify")}
                    </button>

                    <button
                      onClick={() => reject(request.id)}
                      disabled={actionId === request.id}
                      style={rejectButtonStyle}
                    >
                      {t("adminVerificationRequestsPage.reject")}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={infoStyle}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function statusStyle(status: string) {
  if (status === "APPROVED") {
    return { ...badgeStyle, background: "#dcfce7", color: "#166534" };
  }

  if (status === "REJECTED") {
    return { ...badgeStyle, background: "#fee2e2", color: "#991b1b" };
  }

  return { ...badgeStyle, background: "#fef3c7", color: "#92400e" };
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: 32,
} as const;

const heroStyle = {
  maxWidth: 1100,
  margin: "0 auto 24px",
  background: "linear-gradient(135deg,#020617,#1e3a8a)",
  color: "white",
  borderRadius: 24,
  padding: 28,
} as const;

const eyebrowStyle = {
  color: "#93c5fd",
  fontSize: 13,
  fontWeight: 900,
} as const;

const titleStyle = {
  margin: "8px 0",
  fontSize: 34,
  fontWeight: 900,
} as const;

const descStyle = {
  margin: 0,
  color: "#cbd5e1",
} as const;

const listStyle = {
  maxWidth: 1100,
  margin: "0 auto",
  display: "grid",
  gap: 18,
} as const;

const cardStyle = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 20,
  padding: 22,
} as const;

const topStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 18,
} as const;

const companyStyle = {
  margin: 0,
  fontSize: 22,
  fontWeight: 900,
} as const;

const mutedStyle = {
  color: "#64748b",
  marginTop: 4,
} as const;

const badgeStyle = {
  padding: "8px 12px",
  borderRadius: 999,
  fontWeight: 900,
  height: "fit-content",
} as const;

const infoGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 12,
} as const;

const infoStyle = {
  background: "#f8fafc",
  padding: 14,
  borderRadius: 12,
  display: "grid",
  gap: 5,
} as const;

const actionsStyle = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginTop: 18,
} as const;

const documentButtonStyle = {
  textDecoration: "none",
  background: "#eff6ff",
  color: "#1d4ed8",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 900,
} as const;

const approveButtonStyle = {
  border: "none",
  background: "#0f766e",
  color: "white",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 900,
  cursor: "pointer",
} as const;

const rejectButtonStyle = {
  border: "none",
  background: "#dc2626",
  color: "white",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 900,
  cursor: "pointer",
} as const;

const emptyStyle = {
  background: "white",
  borderRadius: 18,
  padding: 24,
  border: "1px solid #e2e8f0",
} as const;

const errorStyle = {
  maxWidth: 1100,
  margin: "0 auto 20px",
  color: "#991b1b",
  background: "#fee2e2",
  padding: 14,
  borderRadius: 12,
} as const;
