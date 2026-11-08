import { useEffect, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";

type FlaggedMessage = {
  id: string;
  content: string;
  createdAt: string;
  reviewedAt?: string | null;
  reviewedById?: string | null;
  reviewDecision?: string | null;
  reviewNote?: string | null;
  sender?: {
    email?: string;
    role?: string;
  };
  thread?: {
    rfq?: {
      product?: {
        title?: string;
      };
    };
    order?: {
      id?: string;
    };
  };
};

const API =
  import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

export default function AdminChatModerationPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";

  const [messages, setMessages] = useState<FlaggedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loadMessages = async () => {
    setLoadError(false);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API}/chat/admin/flagged`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected flagged messages response");
      }
      setMessages(data);
    } catch (err) {
      console.error(err);
      setLoadError(true);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };


  const reviewMessage = async (
    message: FlaggedMessage,
    decision: "VIOLATION_CONFIRMED" | "NO_VIOLATION"
  ) => {
    if (busyId || message.reviewedAt) return;

    const note = (notes[message.id] || "").trim();

    if (note.length > 500) {
      setErrorKey("reviewNoteTooLong");
      return;
    }

    const promptKey = decision === "VIOLATION_CONFIRMED"
      ? "confirmViolationPrompt"
      : "confirmNoViolationPrompt";

    if (!window.confirm(t(`adminChatModerationPage.${promptKey}`))) {
      return;
    }

    setBusyId(message.id);
    setErrorKey(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Missing authentication");

      const response = await fetch(
        `${API}/chat/admin/flagged/${encodeURIComponent(message.id)}/review`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ decision, note }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (
        result?.id !== message.id ||
        result?.reviewDecision !== decision ||
        !result?.reviewedAt
      ) {
        throw new Error("Unexpected review response");
      }

      setMessages((current) =>
        current.map((item) =>
          item.id === message.id
            ? { ...item, ...result }
            : item
        )
      );

      setSuccess(true);
    } catch (error) {
      console.error(error);
      setErrorKey("reviewFailed");
    } finally {
      setBusyId(null);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  return (
    <main style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>
            {t("adminChatModerationPage.eyebrow")}
          </div>

          <h1 style={titleStyle}>
            {t("adminChatModerationPage.title")}
          </h1>
        </div>
      </div>

      {errorKey && (
        <div role="alert" style={{ color: "#b91c1c", marginBottom: 12 }}>
          {t(`adminChatModerationPage.${errorKey}`)}
        </div>
      )}
      {success && (
        <div role="status" style={{ color: "#166534", marginBottom: 12 }}>
          {t("adminChatModerationPage.reviewSaved")}
        </div>
      )}
      {loading ? (
        <div style={emptyStyle}>
          {t("adminChatModerationPage.loading")}
        </div>
      ) : loadError ? (
        <div role="alert" style={emptyStyle}>
          {t("adminChatModerationPage.loadFailed")}
        </div>
      ) : messages.length === 0 ? (
        <div style={emptyStyle}>
          {t("adminChatModerationPage.empty")}
        </div>
      ) : (
        <section style={gridStyle}>
          {messages.map((msg) => (
            <article
              key={msg.id}
              style={cardStyle}
            >
              <div style={topStyle}>
                <span style={dangerBadgeStyle}>
                  {t(
                    msg.reviewedAt
                      ? "adminChatModerationPage.reviewed"
                      : "adminChatModerationPage.flagged"
                  )}
                </span>

                <span style={dateStyle}>
                  {new Date(
                    msg.createdAt
                  ).toLocaleString(locale)}
                </span>
              </div>

              <div style={metaStyle}>
                <strong>
                  {msg.sender?.email}
                </strong>

                <span>
                  {msg.sender?.role}
                </span>
              </div>

              <div style={productStyle}>
                {msg.thread?.rfq?.product
                  ?.title ||
                  (msg.thread?.order?.id
                    ? `${t("adminChatModerationPage.order")} #${msg.thread.order.id.slice(
                        0,
                        8
                      )}`
                    : t("adminChatModerationPage.chat"))}
              </div>

              <div style={messageBoxStyle}>
                {msg.content}
              </div>
              {msg.reviewedAt ? (
                <div style={{ marginTop: 16, lineHeight: 1.8 }}>
                  <strong>
                    {t(
                      msg.reviewDecision === "VIOLATION_CONFIRMED"
                        ? "adminChatModerationPage.violationConfirmed"
                        : "adminChatModerationPage.noViolation"
                    )}
                  </strong>
                  <div>
                    {t("adminChatModerationPage.reviewedAt")}:{" "}
                    {new Date(msg.reviewedAt).toLocaleString(locale)}
                  </div>
                  {msg.reviewedById && (
                    <div>
                      {t("adminChatModerationPage.reviewedBy")}:{" "}
                      {msg.reviewedById.slice(0, 8)}
                    </div>
                  )}
                  {msg.reviewNote && (
                    <div style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                      {t("adminChatModerationPage.reviewNoteLabel")}:{" "}
                      {msg.reviewNote}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
                  <label htmlFor={`review-note-${msg.id}`}>
                    {t("adminChatModerationPage.reviewNoteLabel")}
                  </label>
                  <textarea
                    id={`review-note-${msg.id}`}
                    rows={2}
                    maxLength={500}
                    value={notes[msg.id] || ""}
                    placeholder={t("adminChatModerationPage.reviewNotePlaceholder")}
                    disabled={busyId !== null}
                    onChange={(event) =>
                      setNotes((previous) => ({
                        ...previous,
                        [msg.id]: event.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: 10,
                      border: "1px solid #cbd5e1",
                      borderRadius: 8,
                      boxSizing: "border-box",
                    }}
                  />
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      disabled={busyId !== null}
                      onClick={() =>
                        void reviewMessage(msg, "VIOLATION_CONFIRMED")
                      }
                      style={{
                        padding: "10px 14px",
                        border: 0,
                        borderRadius: 8,
                        background: "#b91c1c",
                        color: "white",
                      }}
                    >
                      {t("adminChatModerationPage.confirmViolation")}
                    </button>
                    <button
                      type="button"
                      disabled={busyId !== null}
                      onClick={() =>
                        void reviewMessage(msg, "NO_VIOLATION")
                      }
                      style={{
                        padding: "10px 14px",
                        border: 0,
                        borderRadius: 8,
                        background: "#0f766e",
                        color: "white",
                      }}
                    >
                      {t("adminChatModerationPage.markNoViolation")}
                    </button>
                  </div>
                </div>
              )}

            </article>
          ))}
        </section>
      )}
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: 24,
};

const headerStyle: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto 24px",
};

const eyebrowStyle: CSSProperties = {
  color: "#dc2626",
  fontSize: 12,
  fontWeight: 900,
};

const titleStyle: CSSProperties = {
  fontSize: 38,
  fontWeight: 900,
  margin: "6px 0 0",
};

const gridStyle: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fill, minmax(320px, 1fr))",
  gap: 18,
};

const cardStyle: CSSProperties = {
  background: "white",
  borderRadius: 22,
  padding: 20,
  border: "1px solid #fecaca",
  boxShadow:
    "0 12px 28px rgba(15,23,42,0.08)",
  display: "grid",
  gap: 14,
};

const topStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const dangerBadgeStyle: CSSProperties = {
  background: "#fee2e2",
  color: "#b91c1c",
  borderRadius: 999,
  padding: "6px 10px",
  fontSize: 11,
  fontWeight: 900,
};

const dateStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 12,
};

const metaStyle: CSSProperties = {
  display: "grid",
  gap: 4,
  color: "#334155",
};

const productStyle: CSSProperties = {
  background: "#eff6ff",
  color: "#1d4ed8",
  borderRadius: 12,
  padding: 10,
  fontWeight: 800,
};

const messageBoxStyle: CSSProperties = {
  background: "#fff1f2",
  border: "1px solid #fecdd3",
  borderRadius: 14,
  padding: 14,
  color: "#881337",
  lineHeight: 1.6,
};

const emptyStyle: CSSProperties = {
  background: "white",
  borderRadius: 20,
  padding: 30,
  textAlign: "center",
  maxWidth: 720,
  margin: "0 auto",
};