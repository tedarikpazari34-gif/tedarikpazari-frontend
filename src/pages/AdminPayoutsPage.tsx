import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import AdminSidebar from "../components/admin/AdminSidebar";

const API = import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api";

type PayoutRequest = {
  id: string;
  companyId: string;
  amount: string | number;
  iban: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNote?: string | null;
  createdAt: string;
  processedAt?: string | null;
  company?: {
    name?: string;
    email?: string;
  };
};

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

function formatMoney(value: string | number, locale: string) {
  return `${Number(value || 0).toLocaleString(locale)} ₺`;
}

function statusText(status: PayoutRequest["status"], t: any) {
  if (status === "PENDING") return t("adminPayoutsPage.statusPending");
  if (status === "APPROVED") return t("adminPayoutsPage.statusApproved");
  if (status === "REJECTED") return t("adminPayoutsPage.statusRejected");
  return status;
}

export default function AdminPayoutsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";

  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const filteredPayouts = useMemo(() => {
    if (statusFilter === "ALL") return payouts;
    return payouts.filter((payout) => payout.status === statusFilter);
  }, [payouts, statusFilter]);

  async function loadPayouts() {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/payouts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || t("adminPayoutsPage.loadFailed"));
        setPayouts([]);
        return;
      }

      setPayouts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert(t("adminPayoutsPage.loadError"));
    } finally {
      setLoading(false);
    }
  }

  async function approve(id: string) {
    if (!confirm(t("adminPayoutsPage.approveConfirm"))) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/payouts/${id}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || t("adminPayoutsPage.approveFailed"));
        return;
      }

      alert(t("adminPayoutsPage.approveSuccess"));
      await loadPayouts();
    } catch (err) {
      console.error(err);
      alert(t("adminPayoutsPage.approveError"));
    }
  }

  async function reject(id: string) {
    const note = prompt(
      t("adminPayoutsPage.rejectPrompt"),
      t("adminPayoutsPage.rejectDefaultNote"),
    );

    if (note === null) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/payouts/${id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ note }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || t("adminPayoutsPage.rejectFailed"));
        return;
      }

      alert(t("adminPayoutsPage.rejectSuccess"));
      await loadPayouts();
    } catch (err) {
      console.error(err);
      alert(t("adminPayoutsPage.rejectError"));
    }
  }

  useEffect(() => {
    loadPayouts();
  }, []);

  return (
    <div style={{ display: "flex", background: "#f4f7fb" }}>
      <AdminSidebar />

      <main style={{ flex: 1, minHeight: "100vh", padding: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
          {t("adminPayoutsPage.title")}
        </h1>

        <p style={{ color: "#64748b", marginBottom: 24 }}>
          {t("adminPayoutsPage.description")}
        </p>

        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          {(["ALL", "PENDING", "APPROVED", "REJECTED"] as StatusFilter[]).map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 999,
                  border: "1px solid #cbd5e1",
                  background: statusFilter === status ? "#2563eb" : "white",
                  color: statusFilter === status ? "white" : "#0f172a",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {status === "ALL"
                  ? t("adminPayoutsPage.filterAll")
                  : statusText(status, t)}
              </button>
            ),
          )}
        </div>

        {loading ? (
          <div>{t("adminPayoutsPage.loading")}</div>
        ) : filteredPayouts.length === 0 ? (
          <div>{t("adminPayoutsPage.empty")}</div>
        ) : (
          <div style={{ display: "grid", gap: 20 }}>
            {filteredPayouts.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "#fff",
                  borderRadius: 18,
                  padding: 24,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 20,
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <h2 style={{ margin: 0 }}>
                      {item.company?.name || item.companyId}
                    </h2>

                    <div style={{ marginTop: 10 }}>
                      <strong>{t("adminPayoutsPage.amount")}</strong>{" "}
                      {formatMoney(item.amount, locale)}
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <strong>{t("adminPayoutsPage.iban")}</strong> {item.iban}
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <strong>{t("adminPayoutsPage.createdAt")}</strong>{" "}
                      {new Date(item.createdAt).toLocaleString(locale)}
                    </div>

                    {item.processedAt && (
                      <div style={{ marginTop: 10 }}>
                        <strong>{t("adminPayoutsPage.processedAt")}</strong>{" "}
                        {new Date(item.processedAt).toLocaleString(locale)}
                      </div>
                    )}

                    {item.adminNote && (
                      <div style={{ marginTop: 10, color: "#991b1b" }}>
                        <strong>{t("adminPayoutsPage.adminNote")}</strong>{" "}
                        {item.adminNote}
                      </div>
                    )}
                  </div>

                  <span
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                      fontWeight: 800,
                      background:
                        item.status === "APPROVED"
                          ? "#dcfce7"
                          : item.status === "REJECTED"
                            ? "#fee2e2"
                            : "#fef3c7",
                      color:
                        item.status === "APPROVED"
                          ? "#166534"
                          : item.status === "REJECTED"
                            ? "#991b1b"
                            : "#92400e",
                    }}
                  >
                    {statusText(item.status, t)}
                  </span>
                </div>

                {item.status === "PENDING" && (
                  <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                    <button
                      onClick={() => approve(item.id)}
                      style={{
                        background: "#16a34a",
                        color: "#fff",
                        border: "none",
                        padding: "12px 18px",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      {t("adminPayoutsPage.approve")}
                    </button>

                    <button
                      onClick={() => reject(item.id)}
                      style={{
                        background: "#dc2626",
                        color: "#fff",
                        border: "none",
                        padding: "12px 18px",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      {t("adminPayoutsPage.reject")}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}