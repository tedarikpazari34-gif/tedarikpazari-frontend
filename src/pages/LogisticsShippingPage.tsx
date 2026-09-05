import { useEffect, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";

const API =
  import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api";

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString(locale);
}

function deliveryText(value: string | null | undefined, t: any) {
  const labels: Record<string, string> = {
    ACIL: t("logisticsShippingPage.deliveryUrgent"),
    "1_3_GUN": t("logisticsShippingPage.deliveryOneThreeDays"),
    "1_HAFTA": t("logisticsShippingPage.deliveryOneWeek"),
    ESNEK: t("logisticsShippingPage.deliveryFlexible"),
  };

  return value ? labels[value] || value : "-";
}

export default function ShippingPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";

  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [selectedRfq, setSelectedRfq] = useState<any | null>(null);
  const [quotePrice, setQuotePrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [quoteNote, setQuoteNote] = useState("");
  const [formError, setFormError] = useState("");

  const load = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/shipping/open`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message || t("logisticsShippingPage.loadFailed"));
        setRfqs([]);
        return;
      }

      setRfqs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("LOAD ERROR:", error);
      setRfqs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openQuoteModal = (rfq: any) => {
    setSelectedRfq(rfq);
    setQuotePrice("");
    setDeliveryDays("");
    setQuoteNote("");
    setFormError("");
  };

  const closeQuoteModal = () => {
    if (busyId) return;

    setSelectedRfq(null);
    setQuotePrice("");
    setDeliveryDays("");
    setQuoteNote("");
    setFormError("");
  };

  const sendQuote = async () => {
    if (!selectedRfq) return;

    const numericPrice = Number(quotePrice);
    const numericDeliveryDays = Number(deliveryDays);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setFormError(t("logisticsShippingPage.invalidPrice"));
      return;
    }

    if (!Number.isInteger(numericDeliveryDays) || numericDeliveryDays <= 0) {
      setFormError(t("logisticsShippingPage.invalidDeliveryDays"));
      return;
    }

    try {
      setFormError("");
      setBusyId(selectedRfq.id);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/shipping/quote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rfqId: selectedRfq.id,
          price: numericPrice,
          deliveryDays: numericDeliveryDays,
          note: quoteNote.trim(),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setFormError(
          Array.isArray(data?.message)
            ? data.message.join(", ")
            : data?.message || t("logisticsShippingPage.quoteFailed"),
        );
        return;
      }

      closeQuoteModal();
      await load();
      alert(t("logisticsShippingPage.quoteSuccess"));
    } catch (error) {
      console.error("SEND QUOTE ERROR:", error);
      setFormError(t("logisticsShippingPage.connectionError"));
    } finally {
      setBusyId("");
    }
  };

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={emptyStyle}>{t("logisticsShippingPage.loading")}</div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <div style={eyebrowStyle}>{t("logisticsShippingPage.eyebrow")}</div>
          <h1 style={titleStyle}>{t("logisticsShippingPage.title")}</h1>
          <p style={heroTextStyle}>
            {t("logisticsShippingPage.description")}
          </p>
        </div>

        <div style={countStyle}>
          <span>{t("logisticsShippingPage.openRequest")}</span>
          <strong>{rfqs.length}</strong>
        </div>
      </section>

      {rfqs.length === 0 ? (
        <div style={emptyStyle}>
          <h2 style={{ marginTop: 0 }}>
            {t("logisticsShippingPage.noOpenRequest")}
          </h2>
          <p style={{ color: "#64748b" }}>
            {t("logisticsShippingPage.noOpenRequestText")}
          </p>
        </div>
      ) : (
        <section style={gridStyle}>
          {rfqs.map((rfq) => (
            <article key={rfq.id} style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div>
                  <div style={smallLabelStyle}>
                    {t("logisticsShippingPage.productToTransport")}
                  </div>
                  <h2 style={productTitleStyle}>
                    {rfq.order?.rfq?.product?.title ||
                      t("logisticsShippingPage.product")}
                  </h2>
                </div>

                <span style={statusStyle}>
                  {rfq.status === "OPEN"
                    ? t("logisticsShippingPage.openForQuote")
                    : rfq.status}
                </span>
              </div>

              <div style={routeStyle}>
                <div>
                  <span style={routeLabelStyle}>
                    {t("logisticsShippingPage.pickup")}
                  </span>
                  <strong>
                    {rfq.fromCity || "-"}
                    {rfq.fromDistrict ? ` / ${rfq.fromDistrict}` : ""}
                  </strong>
                  <small>{rfq.fromOpenAddress || rfq.fromAddress || "-"}</small>
                </div>

                <span style={arrowStyle}>→</span>

                <div>
                  <span style={routeLabelStyle}>
                    {t("logisticsShippingPage.delivery")}
                  </span>
                  <strong>
                    {rfq.toCity || "-"}
                    {rfq.toDistrict ? ` / ${rfq.toDistrict}` : ""}
                  </strong>
                  <small>{rfq.toOpenAddress || rfq.toAddress || "-"}</small>
                </div>
              </div>

              <div style={infoGridStyle}>
                <Info
                  label={t("logisticsShippingPage.vehicleType")}
                  value={rfq.vehicleType || "-"}
                />
                <Info
                  label={t("logisticsShippingPage.weight")}
                  value={
                    rfq.weight
                      ? `${Number(rfq.weight).toLocaleString(locale)} kg`
                      : "-"
                  }
                />
                <Info
                  label={t("logisticsShippingPage.volume")}
                  value={rfq.volume ? `${rfq.volume} m³` : "-"}
                />
                <Info
                  label={t("logisticsShippingPage.pallet")}
                  value={rfq.palletCount ?? "-"}
                />
                <Info
                  label={t("logisticsShippingPage.package")}
                  value={rfq.packageCount ?? "-"}
                />
                <Info
                  label={t("logisticsShippingPage.loadingDate")}
                  value={formatDate(rfq.loadingDate, locale)}
                />
                <Info
                  label={t("logisticsShippingPage.deliveryRequest")}
                  value={
                    rfq.requestedDeliveryDate
                      ? formatDate(rfq.requestedDeliveryDate, locale)
                      : deliveryText(rfq.deliveryExpectation, t)
                  }
                />
                <Info
                  label={t("logisticsShippingPage.quoteCount")}
                  value={rfq.quotes?.length || 0}
                />
              </div>

              <div style={featureGridStyle}>
                {rfq.isFragile && (
                  <Feature>{t("logisticsShippingPage.fragile")}</Feature>
                )}
                {rfq.isDangerous && (
                  <Feature>{t("logisticsShippingPage.dangerous")}</Feature>
                )}
                {rfq.coldChain && (
                  <Feature>{t("logisticsShippingPage.coldChain")}</Feature>
                )}
                {!rfq.stackable && (
                  <Feature>{t("logisticsShippingPage.notStackable")}</Feature>
                )}
                {rfq.needForklift && (
                  <Feature>{t("logisticsShippingPage.forkliftRequired")}</Feature>
                )}
                {rfq.needCrane && (
                  <Feature>{t("logisticsShippingPage.craneRequired")}</Feature>
                )}
              </div>

              {rfq.note && (
                <div style={noteStyle}>
                  <strong>{t("logisticsShippingPage.loadingNote")}</strong>
                  <p>{rfq.note}</p>
                </div>
              )}

              <button
                onClick={() => openQuoteModal(rfq)}
                disabled={Boolean(busyId)}
                style={{
                  ...quoteButtonStyle,
                  opacity: busyId ? 0.65 : 1,
                }}
              >
                {t("logisticsShippingPage.submitShippingQuote")}
              </button>
            </article>
          ))}
        </section>
      )}

      {selectedRfq && (
        <div
          style={modalOverlayStyle}
          onClick={closeQuoteModal}
          role="presentation"
        >
          <section
            style={modalStyle}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shipping-quote-title"
          >
            <div style={modalHeaderStyle}>
              <div>
                <div style={modalEyebrowStyle}>
                  {t("logisticsShippingPage.modalEyebrow")}
                </div>

                <h2 id="shipping-quote-title" style={modalTitleStyle}>
                  {t("logisticsShippingPage.modalTitle")}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeQuoteModal}
                disabled={Boolean(busyId)}
                style={closeButtonStyle}
                aria-label={t("logisticsShippingPage.closeForm")}
              >
                ×
              </button>
            </div>

            <div style={modalRouteStyle}>
              <div>
                <span style={modalRouteLabelStyle}>
                  {t("logisticsShippingPage.pickup")}
                </span>
                <strong>
                  {selectedRfq.fromCity || "-"}
                  {selectedRfq.fromDistrict
                    ? ` / ${selectedRfq.fromDistrict}`
                    : ""}
                </strong>
              </div>

              <span style={modalArrowStyle}>→</span>

              <div>
                <span style={modalRouteLabelStyle}>
                  {t("logisticsShippingPage.delivery")}
                </span>
                <strong>
                  {selectedRfq.toCity || "-"}
                  {selectedRfq.toDistrict ? ` / ${selectedRfq.toDistrict}` : ""}
                </strong>
              </div>
            </div>

            <label style={fieldStyle}>
              <span style={fieldLabelStyle}>
                {t("logisticsShippingPage.quotePrice")}
              </span>

              <div style={moneyInputWrapStyle}>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  inputMode="decimal"
                  value={quotePrice}
                  onChange={(event) => setQuotePrice(event.target.value)}
                  placeholder={t("logisticsShippingPage.pricePlaceholder")}
                  style={moneyInputStyle}
                  autoFocus
                />

                <span style={currencyStyle}>₺</span>
              </div>
            </label>

            <label style={fieldStyle}>
              <span style={fieldLabelStyle}>
                {t("logisticsShippingPage.estimatedDelivery")}
              </span>

              <div style={moneyInputWrapStyle}>
                <input
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={deliveryDays}
                  onChange={(event) => setDeliveryDays(event.target.value)}
                  placeholder={t("logisticsShippingPage.daysPlaceholder")}
                  style={moneyInputStyle}
                />

                <span style={currencyStyle}>
                  {t("logisticsShippingPage.day")}
                </span>
              </div>
            </label>

            <label style={fieldStyle}>
              <span style={fieldLabelStyle}>
                {t("logisticsShippingPage.quoteNote")}
              </span>

              <textarea
                value={quoteNote}
                onChange={(event) => setQuoteNote(event.target.value)}
                placeholder={t("logisticsShippingPage.notePlaceholder")}
                maxLength={500}
                style={textareaStyle}
              />

              <small style={characterStyle}>{quoteNote.length}/500</small>
            </label>

            {formError && <div style={formErrorStyle}>{formError}</div>}

            <div style={modalActionsStyle}>
              <button
                type="button"
                onClick={closeQuoteModal}
                disabled={Boolean(busyId)}
                style={cancelButtonStyle}
              >
                {t("logisticsShippingPage.cancel")}
              </button>

              <button
                type="button"
                onClick={sendQuote}
                disabled={Boolean(busyId)}
                style={{
                  ...submitButtonStyle,
                  opacity: busyId ? 0.65 : 1,
                }}
              >
                {busyId
                  ? t("logisticsShippingPage.sending")
                  : t("logisticsShippingPage.submitQuote")}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={infoStyle}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return <span style={featureStyle}>{children}</span>;
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: "40px 20px",
  background: "#f8fafc",
};

const heroStyle: CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto 24px",
  padding: 30,
  borderRadius: 26,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  flexWrap: "wrap",
  color: "#ffffff",
  background: "linear-gradient(135deg, #0f172a, #0f766e)",
  boxShadow: "0 22px 48px rgba(15,23,42,0.18)",
};

const eyebrowStyle: CSSProperties = {
  color: "#99f6e4",
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 8,
};

const titleStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: 36,
  fontWeight: 900,
};

const heroTextStyle: CSSProperties = {
  maxWidth: 680,
  margin: 0,
  color: "#ccfbf1",
  lineHeight: 1.6,
};

const countStyle: CSSProperties = {
  minWidth: 120,
  padding: 16,
  display: "grid",
  gap: 4,
  borderRadius: 18,
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.16)",
};

const gridStyle: CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  display: "grid",
  gap: 20,
};

const cardStyle: CSSProperties = {
  padding: 24,
  borderRadius: 24,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  boxShadow: "0 14px 34px rgba(15,23,42,0.09)",
};

const cardHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "flex-start",
  marginBottom: 18,
};

const smallLabelStyle: CSSProperties = {
  color: "#0f766e",
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 5,
};

const productTitleStyle: CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: 24,
  fontWeight: 900,
};

const statusStyle: CSSProperties = {
  padding: "7px 11px",
  borderRadius: 999,
  background: "#dcfce7",
  color: "#166534",
  fontSize: 12,
  fontWeight: 900,
};

const routeStyle: CSSProperties = {
  marginBottom: 18,
  padding: 16,
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  gap: 14,
  alignItems: "center",
  borderRadius: 18,
  background: "#f0fdfa",
  border: "1px solid #99f6e4",
};

const routeLabelStyle: CSSProperties = {
  display: "block",
  color: "#0f766e",
  fontSize: 11,
  fontWeight: 900,
  marginBottom: 4,
};

const arrowStyle: CSSProperties = {
  fontSize: 24,
  color: "#0f766e",
  fontWeight: 900,
};

const infoGridStyle: CSSProperties = {
  marginBottom: 16,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
  gap: 10,
};

const infoStyle: CSSProperties = {
  minWidth: 0,
  padding: 12,
  display: "grid",
  gap: 5,
  borderRadius: 14,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  color: "#64748b",
  fontSize: 12,
};

const featureGridStyle: CSSProperties = {
  marginBottom: 14,
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const featureStyle: CSSProperties = {
  padding: "7px 10px",
  borderRadius: 999,
  background: "#fef3c7",
  color: "#92400e",
  fontSize: 12,
  fontWeight: 800,
};

const noteStyle: CSSProperties = {
  marginBottom: 14,
  padding: 14,
  borderRadius: 14,
  background: "#f8fafc",
  color: "#334155",
};

const quoteButtonStyle: CSSProperties = {
  width: "100%",
  minHeight: 48,
  border: "none",
  borderRadius: 13,
  background: "#0f766e",
  color: "#ffffff",
  fontSize: 15,
  fontWeight: 900,
  cursor: "pointer",
};

const emptyStyle: CSSProperties = {
  maxWidth: 700,
  margin: "30px auto",
  padding: 30,
  borderRadius: 22,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
};

const modalOverlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  background: "rgba(15, 23, 42, 0.68)",
  backdropFilter: "blur(5px)",
};

const modalStyle: CSSProperties = {
  width: "100%",
  maxWidth: 540,
  maxHeight: "calc(100vh - 40px)",
  overflowY: "auto",
  padding: 24,
  borderRadius: 24,
  background: "#ffffff",
  boxShadow: "0 30px 80px rgba(15, 23, 42, 0.35)",
};

const modalHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 18,
};

const modalEyebrowStyle: CSSProperties = {
  marginBottom: 5,
  color: "#0f766e",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 0.8,
};

const modalTitleStyle: CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: 25,
  fontWeight: 900,
};

const closeButtonStyle: CSSProperties = {
  width: 38,
  height: 38,
  flexShrink: 0,
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  background: "#f8fafc",
  color: "#334155",
  fontSize: 25,
  lineHeight: 1,
  cursor: "pointer",
};

const modalRouteStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  alignItems: "center",
  gap: 12,
  marginBottom: 20,
  padding: 15,
  border: "1px solid #99f6e4",
  borderRadius: 16,
  background: "#f0fdfa",
  color: "#0f172a",
};

const modalRouteLabelStyle: CSSProperties = {
  display: "block",
  marginBottom: 4,
  color: "#0f766e",
  fontSize: 11,
  fontWeight: 900,
};

const modalArrowStyle: CSSProperties = {
  color: "#0f766e",
  fontSize: 21,
  fontWeight: 900,
};

const fieldStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  marginBottom: 16,
};

const fieldLabelStyle: CSSProperties = {
  color: "#334155",
  fontSize: 14,
  fontWeight: 800,
};

const moneyInputWrapStyle: CSSProperties = {
  display: "flex",
  alignItems: "stretch",
  overflow: "hidden",
  border: "1px solid #cbd5e1",
  borderRadius: 13,
  background: "#ffffff",
};

const moneyInputStyle: CSSProperties = {
  width: "100%",
  minWidth: 0,
  padding: "13px 14px",
  border: "none",
  outline: "none",
  color: "#0f172a",
  fontSize: 16,
};

const currencyStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 58,
  padding: "0 13px",
  borderLeft: "1px solid #e2e8f0",
  background: "#f8fafc",
  color: "#475569",
  fontSize: 14,
  fontWeight: 800,
};

const textareaStyle: CSSProperties = {
  width: "100%",
  minHeight: 110,
  resize: "vertical",
  boxSizing: "border-box",
  padding: 13,
  border: "1px solid #cbd5e1",
  borderRadius: 13,
  outline: "none",
  color: "#0f172a",
  fontFamily: "inherit",
  fontSize: 15,
  lineHeight: 1.5,
};

const characterStyle: CSSProperties = {
  justifySelf: "end",
  color: "#94a3b8",
  fontSize: 12,
};

const formErrorStyle: CSSProperties = {
  marginBottom: 16,
  padding: 12,
  border: "1px solid #fecaca",
  borderRadius: 12,
  background: "#fef2f2",
  color: "#b91c1c",
  fontSize: 14,
  fontWeight: 700,
};

const modalActionsStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginTop: 6,
};

const cancelButtonStyle: CSSProperties = {
  minHeight: 48,
  border: "1px solid #cbd5e1",
  borderRadius: 13,
  background: "#ffffff",
  color: "#334155",
  fontSize: 15,
  fontWeight: 800,
  cursor: "pointer",
};

const submitButtonStyle: CSSProperties = {
  minHeight: 48,
  border: "none",
  borderRadius: 13,
  background: "#0f766e",
  color: "#ffffff",
  fontSize: 15,
  fontWeight: 900,
  cursor: "pointer",
};
