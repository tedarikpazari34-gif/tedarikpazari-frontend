import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import AdminSidebar from "../components/admin/AdminSidebar";

const API = import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api";

type PaymentReview = {
  id: string;
  orderId: string;
  status: string;
  conversationId?: string | null;
  iyzicoPaymentId?: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string | null;
  callbackVerifiedAt?: string | null;
  order: {
    status: string;
    totalAmount: string | number;
    iyzicoPaymentId?: string | null;
    iyzicoPaymentTransactionId?: string | null;
    iyzicoPaidAt?: string | null;
    buyer?: { name?: string } | null;
    seller?: { name?: string } | null;
  };
};

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

function money(value: number | string, locale: string) {
  return `${Number(value || 0).toLocaleString(locale)} ₺`;
}

export default function AdminFinancePage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";

  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentReviews, setPaymentReviews] = useState<PaymentReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

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
        alert(data?.message || t("adminFinancePage.loadFailed"));
        setLedger([]);
        return;
      }

      setLedger(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert(t("adminFinancePage.loadError"));
    } finally {
      setLoading(false);
    }
  }

  async function loadPaymentReviews() {
    try {
      setReviewsLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/payments/iyzico/reviews`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data?.message || "iyzico mutabakat kayıtları yüklenemedi");
        setPaymentReviews([]);
        return;
      }

      setPaymentReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setPaymentReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }

  async function inspectPaymentReview(paymentAttemptId: string) {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API}/payments/iyzico/inspect/${paymentAttemptId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || "iyzico ödeme incelemesi başarısız.");
        return;
      }

      const result = data?.result ?? data;

      alert(
        [
          "iyzico kontrol sonucu",
          `Durum: ${result?.status ?? "-"}`,
          `Ödeme durumu: ${result?.paymentStatus ?? "-"}`,
          `Payment ID: ${result?.paymentId ?? "-"}`,
          `Hata kodu: ${result?.errorCode ?? "-"}`,
          `Hata mesajı: ${result?.errorMessage ?? "-"}`,
        ].join("\n"),
      );
    } catch (err) {
      console.error(err);
      alert("iyzico ödeme incelemesi sırasında bağlantı hatası oluştu.");
    }
  }

  async function resolvePaymentReviewAsFailed(paymentAttemptId: string) {
    const reason = window.prompt(
      "Bu ödeme kaydını FAILED olarak sonuçlandırma gerekçesini yazın (en az 10 karakter):",
    );

    if (reason === null) return;

    const normalizedReason = reason.trim();

    if (normalizedReason.length < 10) {
      alert("Gerekçe en az 10 karakter olmalıdır.");
      return;
    }

    if (
      !window.confirm(
        "Bu REVIEW kaydı FAILED olarak sonuçlandırılacak. Devam etmek istiyor musunuz?",
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API}/payments/iyzico/resolve-review-failed/${paymentAttemptId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: normalizedReason }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || "Ödeme incelemesi sonuçlandırılamadı.");
        return;
      }

      alert("Ödeme incelemesi FAILED olarak sonuçlandırıldı.");
      await loadPaymentReviews();
    } catch (err) {
      console.error(err);
      alert("Ödeme incelemesi sonuçlandırılırken bağlantı hatası oluştu.");
    }
  }

  useEffect(() => {
    loadLedger();
    loadPaymentReviews();
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
            {t("adminFinancePage.title")}
          </h1>
          <p style={{ color: "#64748b", marginTop: 8 }}>
            {t("adminFinancePage.description")}
          </p>
        </div>

        <section style={gridStyle}>
          <MetricCard
            title={t("adminFinancePage.totalVolume")}
            value={money(totals.totalVolume, locale)}
          />
          <MetricCard
            title={t("adminFinancePage.totalCommission")}
            value={money(totals.commission, locale)}
          />
          <MetricCard
            title={t("adminFinancePage.sellerRelease")}
            value={money(totals.sellerRelease, locale)}
          />
          <MetricCard
            title={t("adminFinancePage.refunded")}
            value={money(totals.refund, locale)}
          />
          <MetricCard
            title={t("adminFinancePage.payoutRequested")}
            value={money(totals.payoutRequested, locale)}
          />
          <MetricCard
            title={t("adminFinancePage.payoutApproved")}
            value={money(totals.payoutApproved, locale)}
          />
          <MetricCard
            title={t("adminFinancePage.payoutRejected")}
            value={money(totals.payoutRejected, locale)}
          />
          <MetricCard
            title={t("adminFinancePage.adjustment")}
            value={money(totals.adjustment, locale)}
          />
        </section>

        <section style={{ ...panelStyle, marginBottom: 24 }}>
          <div style={panelHeaderStyle}>
            <div>
              <h2 style={{ margin: 0, fontSize: 24 }}>iyzico Mutabakat</h2>
              <p style={{ margin: "6px 0 0", color: "#64748b" }}>
                Manuel inceleme bekleyen iyzico ödeme kayıtları
              </p>
            </div>

            <button onClick={loadPaymentReviews} style={refreshButtonStyle}>
              Yenile
            </button>
          </div>

          {reviewsLoading ? (
            <div style={emptyStyle}>Mutabakat kayıtları yükleniyor...</div>
          ) : paymentReviews.length === 0 ? (
            <div style={emptyStyle}>İnceleme bekleyen ödeme bulunmuyor.</div>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {paymentReviews.map((review) => (
                <article key={review.id} style={ledgerCardStyle}>
                  <div style={ledgerTopStyle}>
                    <strong>{review.status}</strong>
                    <span style={{ fontWeight: 900 }}>
                      {money(review.order.totalAmount, locale)}
                    </span>
                  </div>

                  <div style={metaStyle}>
                    Sipariş: <strong>{review.orderId}</strong>
                  </div>

                  <div style={metaStyle}>
                    Alıcı: {review.order.buyer?.name || "-"} · Satıcı:{" "}
                    {review.order.seller?.name || "-"}
                  </div>

                  <div style={metaStyle}>
                    Sipariş durumu: {review.order.status}
                  </div>

                  <div style={metaStyle}>
                    Ödeme Attempt ID: {review.id}
                  </div>

                  <div style={metaStyle}>
                    iyzico Payment ID: {review.iyzicoPaymentId || "-"}
                  </div>

                  <div style={metaStyle}>
                    İncelemeye alınma:{" "}
                    {review.reviewedAt
                      ? new Date(review.reviewedAt).toLocaleString(locale)
                      : "-"}
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <button
                      type="button"
                      onClick={() => inspectPaymentReview(review.id)}
                      style={refreshButtonStyle}
                    >
                      iyzico’da Kontrol Et
                    </button>

                    {review.status === "REVIEW" && (
                      <button
                        type="button"
                        onClick={() => resolvePaymentReviewAsFailed(review.id)}
                        style={{ ...refreshButtonStyle, marginLeft: 10 }}
                      >
                        FAILED Olarak Sonuçlandır
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section style={panelStyle}>
          <div style={panelHeaderStyle}>
            <div>
              <h2 style={{ margin: 0, fontSize: 24 }}>
                {t("adminFinancePage.ledgerMovements")}
              </h2>
              <p style={{ margin: "6px 0 0", color: "#64748b" }}>
                {t("adminFinancePage.ledgerDescription")}
              </p>
            </div>

            <button onClick={loadLedger} style={refreshButtonStyle}>
              {t("adminFinancePage.refresh")}
            </button>
          </div>

          {loading ? (
            <div style={emptyStyle}>{t("adminFinancePage.loading")}</div>
          ) : ledger.length === 0 ? (
            <div style={emptyStyle}>{t("adminFinancePage.empty")}</div>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {ledger.map((item) => (
                <article key={item.id} style={ledgerCardStyle}>
                  <div style={ledgerTopStyle}>
                    <strong>{item.type}</strong>
                    <span style={amountStyle}>{money(item.amount, locale)}</span>
                  </div>

                  <div style={metaStyle}>
                    {item.note || t("adminFinancePage.noDescription")}
                  </div>

                  <div style={metaStyle}>
                    {t("adminFinancePage.date")}{" "}
                    {new Date(item.createdAt).toLocaleString(locale)}
                  </div>

                  {(item.fromCompany?.name || item.toCompany?.name) && (
                    <div style={metaStyle}>
                      {item.fromCompany?.name && (
                        <span>
                          {t("adminFinancePage.from")} {item.fromCompany.name}
                        </span>
                      )}
                      {item.fromCompany?.name && item.toCompany?.name && " · "}
                      {item.toCompany?.name && (
                        <span>
                          {t("adminFinancePage.to")} {item.toCompany.name}
                        </span>
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