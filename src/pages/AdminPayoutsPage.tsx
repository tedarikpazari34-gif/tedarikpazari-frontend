import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";

const API = import.meta.env.VITE_API_URL || "http://localhost:3002/api";

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

function formatMoney(value: string | number) {
  return `${Number(value || 0).toLocaleString("tr-TR")} ₺`;
}

function statusText(status: PayoutRequest["status"]) {
  if (status === "PENDING") return "Bekliyor";
  if (status === "APPROVED") return "Onaylandı";
  if (status === "REJECTED") return "Reddedildi";
  return status;
}

export default function AdminPayoutsPage() {
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
        alert(data?.message || "Payout talepleri alınamadı");
        setPayouts([]);
        return;
      }

      setPayouts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert("Payout talepleri yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  async function approve(id: string) {
    if (!confirm("Bu para çekme talebini onaylamak istiyor musunuz?")) return;

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
        alert(data?.message || "Onaylama başarısız");
        return;
      }

      alert("Talep onaylandı ✅");
      await loadPayouts();
    } catch (err) {
      console.error(err);
      alert("Onaylama sırasında hata oluştu");
    }
  }

  async function reject(id: string) {
    const note = prompt("Red sebebi yazın:", "Admin rejected payout");

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
        alert(data?.message || "Reddetme başarısız");
        return;
      }

      alert("Talep reddedildi");
      await loadPayouts();
    } catch (err) {
      console.error(err);
      alert("Reddetme sırasında hata oluştu");
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
          Para Çekme Talepleri
        </h1>

        <p style={{ color: "#64748b", marginBottom: 24 }}>
          Satıcıların IBAN para çekme taleplerini onaylayın veya reddedin.
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
                {status === "ALL" ? "Tümü" : statusText(status)}
              </button>
            ),
          )}
        </div>

        {loading ? (
          <div>Yükleniyor...</div>
        ) : filteredPayouts.length === 0 ? (
          <div>Payout talebi yok</div>
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
                      <strong>Tutar:</strong> {formatMoney(item.amount)}
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <strong>IBAN:</strong> {item.iban}
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <strong>Oluşturma:</strong>{" "}
                      {new Date(item.createdAt).toLocaleString("tr-TR")}
                    </div>

                    {item.processedAt && (
                      <div style={{ marginTop: 10 }}>
                        <strong>İşlem:</strong>{" "}
                        {new Date(item.processedAt).toLocaleString("tr-TR")}
                      </div>
                    )}

                    {item.adminNote && (
                      <div style={{ marginTop: 10, color: "#991b1b" }}>
                        <strong>Admin Notu:</strong> {item.adminNote}
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
                    {statusText(item.status)}
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
                      Onayla
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
                      Reddet
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