import { useEffect, useState } from "react";
import {
  parseSenderFileReviews,
  senderFileReviewLabels,
  type SenderFileReview,
} from "../lib/chatFileReviewStatus";

type Props = {
  apiBase: string;
  token: string | null;
  threadId: string;
  language: string;
  refreshSignal: number;
};

export default function ChatMyFileReviews({
  apiBase,
  token,
  threadId,
  language,
  refreshSignal,
}: Props) {
  const [items, setItems] = useState<SenderFileReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);

  const labels = senderFileReviewLabels(language);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setItems([]);
    setError(false);

    if (!token || !threadId) {
      setLoading(false);
      return () => {
        active = false;
        controller.abort();
      };
    }

    setLoading(true);

    const endpoint =
      apiBase.replace(/\/+$/, "") +
      "/chat/threads/" +
      encodeURIComponent(threadId) +
      "/my-file-reviews";

    void fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("File review status request failed");
        }

        return response.json() as Promise<unknown>;
      })
      .then((data) => {
        if (!active) return;
        setItems(parseSenderFileReviews(data));
      })
      .catch(() => {
        if (!active || controller.signal.aborted) return;
        setItems([]);
        setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [apiBase, token, threadId, revision, refreshSignal]);

  // No unnecessary panel when the sender has no files.
  if (!error && items.length === 0) return null;

  const statusText = {
    PENDING_REVIEW: labels.pending,
    APPROVED: labels.approved,
    REJECTED: labels.rejected,
  };

  return (
    <section
      aria-label={labels.title}
      style={{
        margin: "8px 16px",
        padding: 12,
        border: "1px solid #99f6e4",
        borderRadius: 12,
        background: "#f0fdfa",
        color: "#0f172a",
        maxHeight: 180,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <strong style={{ fontSize: 13 }}>{labels.title}</strong>
        <button
          type="button"
          disabled={loading}
          onClick={() => setRevision((value) => value + 1)}
          style={{
            border: "1px solid #0d9488",
            background: "white",
            color: "#0f766e",
            borderRadius: 8,
            padding: "4px 10px",
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? labels.loading : labels.refresh}
        </button>
      </div>

      {error && (
        <p role="alert" style={{ fontSize: 12 }}>
          {labels.error}
        </p>
      )}

      {items.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
            paddingTop: 8,
            fontSize: 12,
          }}
        >
          <span>
            {item.fileName} ·{" "}
            {new Date(item.createdAt).toLocaleString(language)}
          </span>
          <strong>{statusText[item.status]}</strong>
        </div>
      ))}
    </section>
  );
}
