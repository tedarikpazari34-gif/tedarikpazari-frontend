import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";

const API = import.meta.env.VITE_API_URL || "http://localhost:3002/api";

type LedgerEntry = {
  id: string;
  type: string;
  amount: string | number;
  currency?: string;
  note?: string | null;
  createdAt: string;
  fromCompany?: { name?: string } | null;
  toCompany?: { name?: string } | null;
};

function money(value: number | string) {
  return `${Number(value || 0).toLocaleString("tr-TR")} ₺`;
}

export default function AdminFinancePage() {
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadLedger() {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/admin/ledger`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || "Ledger kayıtları alınamadı");
        setLedger([]);
        return;
      }

      setLedger(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert("Finans verileri yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLedger();
  }, []);

  const totals = useMemo(() => {
    const sumByType = (type: string) =>
      ledger
        .filter((item) => item.type === type)
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return {
      totalVolume: sumByType("ESCROW_DEPOSIT"),
      commission: sumByType("COMMISSION"),
      sellerRelease: sumByType("ESCROW_RELEASE_SELLER"),
      refund: sumByType("ESCROW_REFUND_BUYER"),
      payoutRequested: sumByType("PAYOUT_REQUEST"),
      payoutApproved: sumByType("PAYOUT_APPROVE"),
      payoutRejected: sumByType("PAYOUT_REJECT"),
      adjustment: sumByType("ADJUSTMENT"),
    };
  }, [ledger]);

  return (
    <div style={{ display: "flex", background: "#f4f7fb" }}>
      <AdminSidebar />

      <main style={{ flex: 1, minHeight: "100vh", padding: 40 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>
            Finans Yönetimi
          </h1>
          <p style={{ color: "#64748b", marginTop: 8 }}>
            Ledger kayıtları, komisyonlar, escrow hareketleri ve payout
            işlemlerini buradan takip edin.
          </p>
        </div>

        <section style={gridStyle}>
          <MetricCard title="Toplam İşlem Hacmi" value={money(totals.totalVolume)} />
          <MetricCard title="Toplam Komisyon" value={money(totals.commission)} />
          <MetricCard title="Satıcıya Aktarılan" value={money(totals.sellerRelease)} />
          <MetricCard title="İade Edilen" value={money(totals.refund)} />
          <MetricCard title="Payout Talep" value={money(totals.payoutRequested)} />
          <MetricCard title="Payout Onay" value={money(totals.payoutApproved)} />
          <MetricCard title="Payout Red" value={money(totals.payoutRejected)} />
          <MetricCard title="Admin Ayarlama" value={money(totals.adjustment)} />
        </section>

        <section style={panelStyle}>
          <div style={panelHeaderStyle}>
            <div>
              <h2 style={{ margin: 0, fontSize: 24 }}>Ledger Hareketleri</h2>
              <p style={{ margin: "6px 0 0", color: "#64748b" }}>
                Tüm finansal kayıtların işlem geçmişi.
              </p>
            </div>

            <button onClick={loadLedger} style={refreshButtonStyle}>
              Yenile
            </button>
          </div>

          {loading ? (
            <div style={emptyStyle}>Yükleniyor...</div>
          ) : ledger.length === 0 ? (
            <div style={emptyStyle}>Ledger kaydı yok</div>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {ledger.map((item) => (
                <article key={item.id} style={ledgerCardStyle}>
                  <div style={ledgerTopStyle}>
                    <strong>{item.type}</strong>
                    <span style={amountStyle}>{money(item.amount)}</span>
                  </div>

                  <div style={metaStyle}>
                    {item.note || "Açıklama bulunmuyor"}
                  </div>

                  <div style={metaStyle}>
                    Tarih: {new Date(item.createdAt).toLocaleString("tr-TR")}
                  </div>

                  {(item.fromCompany?.name || item.toCompany?.name) && (
                    <div style={metaStyle}>
                      {item.fromCompany?.name && (
                        <span>Çıkış: {item.fromCompany.name}</span>
                      )}
                      {item.fromCompany?.name && item.toCompany?.name && " · "}
                      {item.toCompany?.name && (
                        <span>Giriş: {item.toCompany.name}</span>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <div style={metricCardStyle}>
      <span style={metricTitleStyle}>{title}</span>
      <strong style={metricValueStyle}>{value}</strong>
    </div>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
  marginBottom: 24,
};

const metricCardStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 18,
  padding: 22,
  boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
};

const metricTitleStyle = {
  color: "#64748b",
  fontWeight: 800,
  fontSize: 13,
};

const metricValueStyle = {
  display: "block",
  marginTop: 8,
  color: "#0f172a",
  fontSize: 26,
  fontWeight: 900,
};

const panelStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 22,
  padding: 24,
  boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
};

const panelHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  marginBottom: 22,
};

const refreshButtonStyle = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 800,
};

const emptyStyle = {
  color: "#64748b",
  padding: 20,
};

const ledgerCardStyle = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 18,
};

const ledgerTopStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
};

const amountStyle = {
  color: "#16a34a",
  fontWeight: 900,
};

const metaStyle = {
  color: "#64748b",
  fontSize: 14,
  marginTop: 8,
};