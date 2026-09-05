import { useEffect, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";

const API =
  import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api";

type Wallet = {
  available: string | number;
  locked: string | number;
};

type WalletHistoryItem = {
  id: string;
  type: string;
  amount: string | number;
  currency: string;
  note?: string | null;
  createdAt: string;
  direction: "IN" | "OUT" | "INFO";
  orderId?: string | null;
};

type PayoutRequest = {
  id: string;
  amount: string | number;
  iban: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNote?: string | null;
  createdAt: string;
  processedAt?: string | null;
};

function formatMoney(value: string | number | undefined, locale: string) {
  return `${Number(value || 0).toLocaleString(locale)} ₺`;
}

function getHistoryLabel(
  type: string,
  t: (key: string) => string
) {
  if (type === "ESCROW_RELEASE_SELLER") return t("walletPage.orderIncome");
  if (type === "ESCROW_DEPOSIT") return t("walletPage.escrowPayment");
  if (type === "COMMISSION") return t("walletPage.platformCommission");
  if (type === "PAYOUT_REQUEST") return t("walletPage.payoutRequest");
  if (type === "PAYOUT_APPROVE") return t("walletPage.payoutApprove");
  if (type === "PAYOUT_REJECT") return t("walletPage.payoutReject");
  if (type === "ADJUSTMENT") return t("walletPage.adjustment");
  return type;
}
function getHistoryNote(
  note: string | null | undefined,
  t: (key: string) => string
) {
  if (!note) return "";

  const translations: Record<string, string> = {
    "Escrow released to seller after commission deduction":
      t("walletPage.noteSellerRelease"),
    "Platform commission reserved":
      t("walletPage.noteCommission"),
    "Buyer payment deposited into escrow":
      t("walletPage.noteBuyerEscrow"),
    "Iyzico payment deposited into escrow":
      t("walletPage.notePaymentEscrow"),
    "Seller payout request created":
      t("walletPage.notePayoutCreated"),
    "Payout request approved":
      t("walletPage.notePayoutApproved"),
    "Admin wallet top-up":
      t("walletPage.noteAdminTopup"),
  };

  if (translations[note]) {
    return translations[note];
  }

  const normalized = note.toLocaleLowerCase("tr-TR");

  if (
    normalized.includes("payment deposited into escrow") ||
    (normalized.includes("ödeme") && normalized.includes("escrow"))
  ) {
    return t("walletPage.notePaymentEscrow");
  }

  return note;
}
function getHistoryPrefix(direction: WalletHistoryItem["direction"]) {
  if (direction === "IN") return "+";
  if (direction === "OUT") return "-";
  return "";
}

function getStatusLabel(
  status: PayoutRequest["status"],
  t: (key: string) => string
) {
  if (status === "PENDING") return t("walletPage.pending");
  if (status === "APPROVED") return t("walletPage.approved");
  if (status === "REJECTED") return t("walletPage.rejected");
  return status;
}

export default function WalletPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";

  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= 768
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [requests, setRequests] = useState<PayoutRequest[]>([]);
  const [history, setHistory] = useState<WalletHistoryItem[]>([]);
  const [amount, setAmount] = useState("");
  const [iban, setIban] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWallet = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError(t("walletPage.loginRequired"));
        return;
      }

      const res = await fetch(`${API}/wallet/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || t("walletPage.loadFailed"));
        return;
      }

      setWallet(data.wallet);

      const payoutRes = await fetch(`${API}/payouts/me/requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (payoutRes.ok) {
        const payoutData = await payoutRes.json();
        setRequests(Array.isArray(payoutData) ? payoutData : []);
      }

      const historyRes = await fetch(`${API}/wallet/me/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(
          Array.isArray(historyData?.history) ? historyData.history : []
        );
      }
    } catch (err) {
      console.error(err);
      setError(t("walletPage.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handlePayoutRequest = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert(t("walletPage.pleaseLogin"));
        return;
      }

      const numericAmount = Number(amount);

      if (!numericAmount || numericAmount <= 0) {
        alert(t("walletPage.invalidAmount"));
        return;
      }

      if (!iban.trim()) {
        alert(t("walletPage.enterIban"));
        return;
      }

      const res = await fetch(`${API}/payouts/request`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: numericAmount,
          iban: iban.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || t("walletPage.payoutFailed"));
        return;
      }

      alert(t("walletPage.payoutSuccess"));
      setAmount("");
      setIban("");
      await loadWallet();
    } catch (err) {
      console.error(err);
      alert(t("walletPage.payoutError"));
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={emptyCardStyle}>{t("walletPage.loading")}</div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section
        style={{
          ...heroStyle,
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          padding: isMobile ? 24 : 32,
        }}
      >
        <div>
          <div style={eyebrowStyle}>{t("walletPage.financePanel")}</div>
          <h1 style={titleStyle}>{t("walletPage.title")}</h1>
          <p style={descStyle}>{t("walletPage.description")}</p>
        </div>

        <div
          style={{
            ...heroAmountStyle,
            width: isMobile ? "100%" : "auto",
            minWidth: isMobile ? 0 : 190,
            boxSizing: "border-box",
            marginTop: isMobile ? 16 : 0,
          }}
        >
          <span>{t("walletPage.available")}</span>
          <strong>{formatMoney(wallet?.available, locale)}</strong>
        </div>
      </section>

      {error ? (
        <div style={errorCardStyle}>{error}</div>
      ) : wallet ? (
        <>
          <section style={gridStyle}>
            <div style={balanceCardStyle}>
              <div style={cardIconStyle}>₺</div>
              <p style={labelStyle}>{t("walletPage.availableBalance")}</p>
              <h2 style={greenAmountStyle}>{formatMoney(wallet.available, locale)}</h2>
              <span style={hintStyle}>{t("walletPage.availableHint")}</span>
            </div>

            <div style={lockedCardStyle}>
              <div style={cardIconStyle}>🔒</div>
              <p style={labelStyle}>{t("walletPage.lockedEscrow")}</p>
              <h2 style={blueAmountStyle}>{formatMoney(wallet.locked, locale)}</h2>
              <span style={hintStyle}>{t("walletPage.lockedHint")}</span>
            </div>
          </section>

          <section style={infoPanelStyle}>
            <div>
              <div style={smallLabelStyle}>{t("walletPage.platformSecurity")}</div>
              <h2 style={panelTitleStyle}>{t("walletPage.escrowFlow")}</h2>
              <p style={panelTextStyle}>{t("walletPage.escrowDescription")}</p>
            </div>

            <div style={stepGridStyle}>
              <Step number="1" title={t("walletPage.step1")} />
              <Step number="2" title={t("walletPage.step2")} />
              <Step number="3" title={t("walletPage.step3")} />
            </div>
          </section>

          <section style={{ ...historyPanelStyle, marginTop: 24 }}>
            <div>
              <div style={smallLabelStyle}>{t("walletPage.walletTransactions")}</div>
              <h2 style={panelTitleStyle}>{t("walletPage.transactionHistory")}</h2>
              <p style={panelTextStyle}>{t("walletPage.historyDescription")}</p>
            </div>

            {history.length === 0 ? (
              <p style={panelTextStyle}>{t("walletPage.noHistory")}</p>
            ) : (
              <div style={historyListStyle}>
                {history.map((item) => (
                  <div key={item.id} style={historyItemStyle}>
                    <div style={historyTopStyle}>
                      <div>
                        <strong style={historyTitleStyle}>
                          {getHistoryLabel(item.type, t)}
                        </strong>

                        {item.orderId && (
                          <div style={requestMetaStyle}>
                            {t("walletPage.order")}: {item.orderId}
                          </div>
                        )}
                      </div>

                      <strong
                        style={
                          item.direction === "IN"
                            ? historyInStyle
                            : item.direction === "OUT"
                            ? historyOutStyle
                            : historyInfoStyle
                        }
                      >
                        {getHistoryPrefix(item.direction)}
                        {formatMoney(item.amount, locale)}
                      </strong>
                    </div>

                    <div style={requestMetaStyle}>
                      {new Date(item.createdAt).toLocaleString(locale)}
                    </div>

                    {item.note && (
                      <div style={requestMetaStyle}>
                        {getHistoryNote(item.note, t)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section style={{ ...infoPanelStyle, marginTop: 24 }}>
            <div>
              <div style={smallLabelStyle}>{t("walletPage.withdrawal")}</div>
              <h2 style={panelTitleStyle}>{t("walletPage.createWithdrawal")}</h2>
              <p style={panelTextStyle}>{t("walletPage.withdrawalDescription")}</p>

              <div style={{ marginTop: 18 }}>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={t("walletPage.amount")}
                  style={inputStyle}
                />

                <input
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  placeholder={t("walletPage.iban")}
                  style={inputStyle}
                />

                <button
                  style={withdrawButtonStyle}
                  onClick={handlePayoutRequest}
                >
                  {t("walletPage.sendWithdrawal")}
                </button>
              </div>
            </div>

            <div>
              <div style={smallLabelStyle}>{t("walletPage.requestHistory")}</div>
              <h2 style={panelTitleStyle}>{t("walletPage.myWithdrawalRequests")}</h2>

              {requests.length === 0 ? (
                <p style={panelTextStyle}>{t("walletPage.noWithdrawalRequests")}</p>
              ) : (
                <div style={requestListStyle}>
                  {requests.map((request) => (
                    <div key={request.id} style={requestItemStyle}>
                      <div style={requestTopStyle}>
                        <strong>{formatMoney(request.amount, locale)}</strong>
                        <span style={statusBadgeStyle}>
                          {getStatusLabel(request.status, t)}
                        </span>
                      </div>

                      <div style={requestMetaStyle}>{request.iban}</div>

                      <div style={requestMetaStyle}>
                        {t("walletPage.created")}:{" "}
                        {new Date(request.createdAt).toLocaleString(locale)}
                      </div>

                      {request.processedAt && (
                        <div style={requestMetaStyle}>
                          {t("walletPage.processed")}:{" "}
                          {new Date(request.processedAt).toLocaleString(locale)}
                        </div>
                      )}

                      {request.adminNote && (
                        <div style={requestNoteStyle}>{request.adminNote}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        <div style={emptyCardStyle}>{t("walletPage.walletNotFound")}</div>
      )}
    </main>
  );
}

function Step({ number, title }: { number: string; title: string }) {
  return (
    <div style={stepStyle}>
      <span style={stepNumberStyle}>{number}</span>
      <strong>{title}</strong>
    </div>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: 40,
};

const heroStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
  background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
  color: "white",
  borderRadius: 28,
  padding: 32,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  boxShadow: "0 24px 50px rgba(15,23,42,0.18)",
};

const eyebrowStyle: CSSProperties = {
  color: "#93c5fd",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 8,
};

const titleStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: 40,
  fontWeight: 900,
};

const descStyle: CSSProperties = {
  margin: 0,
  maxWidth: 720,
  color: "#cbd5e1",
  lineHeight: 1.7,
};

const heroAmountStyle: CSSProperties = {
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 20,
  padding: 20,
  minWidth: 190,
  display: "grid",
  gap: 6,
};

const gridStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 20,
};

const balanceCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #bbf7d0",
  borderRadius: 24,
  padding: 26,
  boxShadow: "0 14px 34px rgba(15,23,42,0.10)",
};

const lockedCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #bfdbfe",
  borderRadius: 24,
  padding: 26,
  boxShadow: "0 14px 34px rgba(15,23,42,0.10)",
};

const cardIconStyle: CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 16,
  background: "#eff6ff",
  display: "grid",
  placeItems: "center",
  fontWeight: 900,
  marginBottom: 14,
};

const labelStyle: CSSProperties = {
  color: "#64748b",
  fontWeight: 900,
  margin: "0 0 8px",
};

const greenAmountStyle: CSSProperties = {
  color: "#16a34a",
  fontSize: 36,
  margin: 0,
  fontWeight: 900,
};

const blueAmountStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 36,
  margin: 0,
  fontWeight: 900,
};

const hintStyle: CSSProperties = {
  display: "block",
  color: "#64748b",
  marginTop: 10,
};

const infoPanelStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 24,
  padding: 28,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 24,
  boxShadow: "0 14px 34px rgba(15,23,42,0.08)",
};

const smallLabelStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 8,
};

const panelTitleStyle: CSSProperties = {
  color: "#0f172a",
  margin: "0 0 8px",
  fontSize: 28,
  fontWeight: 900,
};

const panelTextStyle: CSSProperties = {
  color: "#64748b",
  lineHeight: 1.7,
  margin: 0,
};

const stepGridStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const stepStyle: CSSProperties = {
  background: "#f8fafc",
  borderRadius: 16,
  padding: 16,
  display: "flex",
  alignItems: "center",
  gap: 12,
  color: "#0f172a",
};

const stepNumberStyle: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 999,
  background: "#dbeafe",
  color: "#1d4ed8",
  display: "grid",
  placeItems: "center",
  fontWeight: 900,
};

const emptyCardStyle: CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 24,
  padding: 32,
  boxShadow: "0 14px 34px rgba(15,23,42,0.10)",
};

const errorCardStyle: CSSProperties = {
  ...emptyCardStyle,
  color: "#991b1b",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  marginBottom: 10,
  fontSize: 15,
  boxSizing: "border-box",
};

const withdrawButtonStyle: CSSProperties = {
  padding: "12px 16px",
  border: "none",
  borderRadius: 12,
  background: "#2563eb",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
};

const historyPanelStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 24,
  padding: 28,
  boxShadow: "0 14px 34px rgba(15,23,42,0.08)",
};

const historyListStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  marginTop: 20,
};

const historyItemStyle: CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 16,
  display: "grid",
  gap: 6,
};

const historyTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
};

const historyTitleStyle: CSSProperties = {
  color: "#0f172a",
};

const historyInStyle: CSSProperties = {
  color: "#16a34a",
};

const historyOutStyle: CSSProperties = {
  color: "#dc2626",
};

const historyInfoStyle: CSSProperties = {
  color: "#64748b",
};

const requestListStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const requestItemStyle: CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 14,
  display: "grid",
  gap: 6,
};

const requestTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
};

const statusBadgeStyle: CSSProperties = {
  background: "#e0f2fe",
  color: "#0369a1",
  borderRadius: 999,
  padding: "5px 9px",
  fontSize: 12,
  fontWeight: 900,
};

const requestMetaStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 13,
};

const requestNoteStyle: CSSProperties = {
  background: "#fff7ed",
  color: "#9a3412",
  borderRadius: 10,
  padding: 10,
  fontSize: 13,
};