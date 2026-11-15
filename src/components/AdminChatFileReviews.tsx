import { useEffect, useState } from "react";
import {
  adminChatFileReviewLabels,
  parsePendingChatFileReviews,
  type PendingChatFileReview,
} from "../lib/adminChatFileReviews";

type Props = {
  apiBase: string;
  language: string;
};

export default function AdminChatFileReviews({
  apiBase,
  language,
}: Props) {
  const labels = adminChatFileReviewLabels(language);

  const [items, setItems] = useState<PendingChatFileReview[]>([]);
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const [page, setPage] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<"reason" | "failed" | null>(null);
  const [saved, setSaved] = useState(false);

  const cursor = cursors[page] ?? null;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setLoadError(false);
    setItems([]);
    setNextCursor(null);

    const token = localStorage.getItem("token");

    if (!token) {
      setLoadError(true);
      setLoading(false);
      return () => {
        active = false;
        controller.abort();
      };
    }

    const endpoint =
      apiBase.replace(/\/+$/, "") +
      "/chat/admin/files/pending" +
      (cursor ? `?cursor=${encodeURIComponent(cursor)}` : "");

    void fetch(endpoint, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Review list failed");
        return response.json() as Promise<unknown>;
      })
      .then((payload) => {
        if (!active) return;

        const result = parsePendingChatFileReviews(payload);
        setItems(result.items);
        setNextCursor(result.nextCursor);
      })
      .catch(() => {
        if (!active || controller.signal.aborted) return;
        setItems([]);
        setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [apiBase, cursor, revision]);

  const rejectReview = async (reviewId: string) => {
    if (busyId || loading) return;

    const note = (notes[reviewId] ?? "").trim();

    setActionError(null);
    setSaved(false);

    if (!note || note.length > 500) {
      setActionError("reason");
      return;
    }

    if (!window.confirm(labels.confirm)) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setActionError("failed");
      return;
    }

    setBusyId(reviewId);

    try {
      const response = await fetch(
        apiBase.replace(/\/+$/, "") +
          `/chat/admin/files/${encodeURIComponent(reviewId)}/review`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            decision: "REJECTED",
            note,
          }),
        },
      );

      if (!response.ok) throw new Error("Review decision failed");

      const result: unknown = await response.json();

      if (
        !result ||
        typeof result !== "object" ||
        (result as { id?: unknown }).id !== reviewId ||
        (result as { status?: unknown }).status !== "REJECTED" ||
        typeof (result as { reviewedAt?: unknown }).reviewedAt !== "string"
      ) {
        throw new Error("Invalid decision response");
      }

      setNotes({});
      setSaved(true);
      setCursors([null]);
      setPage(0);
      setRevision((value) => value + 1);
    } catch {
      setActionError("failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section
      aria-label={labels.title}
      style={{
        marginBottom: 24,
        padding: 18,
        border: "1px solid #99f6e4",
        borderRadius: 16,
        background: "#f0fdfa",
        color: "#0f172a",
      }}
    >
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>{labels.title}</h2>
        <button
          type="button"
          disabled={loading || busyId !== null}
          onClick={() => setRevision((value) => value + 1)}
        >
          {labels.refresh}
        </button>
      </div>

      <p style={{ fontSize: 13, color: "#9a3412" }}>
        {labels.caution}
      </p>

      {saved && <p role="status">{labels.saved}</p>}

      {actionError && (
        <p role="alert" style={{ color: "#b91c1c" }}>
          {labels[actionError]}
        </p>
      )}

      {loading ? (
        <p>{labels.loading}</p>
      ) : loadError ? (
        <p role="alert">{labels.error}</p>
      ) : items.length === 0 ? (
        <p>{labels.empty}</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((item) => (
            <article
              key={item.id}
              style={{
                background: "white",
                border: "1px solid #ccfbf1",
                borderRadius: 12,
                padding: 14,
              }}
            >
              <div style={{ fontSize: 13, marginBottom: 8 }}>
                <strong>{item.fileType ?? "Dosya"}</strong>
                {" · "}
                {new Date(item.createdAt).toLocaleString(language)}
              </div>

              <div style={{
                fontSize: 12,
                color: "#475569",
                overflowWrap: "anywhere",
                marginBottom: 8,
              }}>
                {item.id}
              </div>

              <textarea
                aria-label={labels.note}
                placeholder={labels.note}
                value={notes[item.id] ?? ""}
                maxLength={500}
                disabled={busyId !== null}
                onChange={(event) => {
                  setNotes((current) => ({
                    ...current,
                    [item.id]: event.target.value,
                  }));
                }}
                rows={2}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                }}
              />

              <div style={{
                display: "flex",
                gap: 10,
                marginTop: 10,
                flexWrap: "wrap",
              }}>
                <button
                  type="button"
                  disabled={busyId !== null}
                  onClick={() => void rejectReview(item.id)}
                  style={{
                    background: "#b91c1c",
                    color: "white",
                    border: 0,
                    borderRadius: 8,
                    padding: "9px 14px",
                    cursor: "pointer",
                  }}
                >
                  {labels.reject}
                </button>

                <button
                  type="button"
                  disabled
                  title={labels.caution}
                  style={{
                    borderRadius: 8,
                    padding: "9px 14px",
                    opacity: 0.55,
                    cursor: "not-allowed",
                  }}
                >
                  {labels.approval}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: 14,
      }}>
        <button
          type="button"
          disabled={page === 0 || loading || busyId !== null}
          onClick={() => setPage((value) => Math.max(0, value - 1))}
        >
          {labels.previous}
        </button>

        <button
          type="button"
          disabled={!nextCursor || loading || busyId !== null}
          onClick={() => {
            if (!nextCursor) return;
            setCursors((current) => [
              ...current.slice(0, page + 1),
              nextCursor,
            ]);
            setPage((value) => value + 1);
          }}
        >
          {labels.next}
        </button>
      </div>
    </section>
  );
}
