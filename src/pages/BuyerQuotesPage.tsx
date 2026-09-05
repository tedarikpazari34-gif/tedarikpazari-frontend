import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

type Quote = {
  id: string;
  unitPrice: string;
  deliveryDays: number;
  sellerNote?: string;
  status: string;
  seller?: {
    name?: string;
  };
};

type RFQ = {
  id: string;
  quantity: number;
  note?: string;
  status: string;
  product?: {
    title: string;
  };
  quotes?: Quote[];
};

const TOKEN = localStorage.getItem("token");

export default function BuyerRfqDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const rfqId = params?.id as string;

  const [rfq, setRfq] = useState<RFQ | null>(null);

  const statusText = (status?: string) => {
    switch (status) {
      case "OPEN":
        return t("buyerQuotesPage.statusOpen");
      case "CLOSED":
        return t("buyerQuotesPage.statusClosed");
      case "PENDING":
        return t("buyerQuotesPage.statusPending");
      case "ACCEPTED":
        return t("buyerQuotesPage.statusAccepted");
      case "REJECTED":
        return t("buyerQuotesPage.statusRejected");
      case "CANCELLED":
        return t("buyerQuotesPage.statusCancelled");
      default:
        return status || "-";
    }
  };

  useEffect(() => {
    fetch("https://tedarik-backend.onrender.com/api/rfqs/mine", {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const safeData = Array.isArray(data) ? data : [];
const found = safeData.find((r: RFQ) => r.id === rfqId);
setRfq(found || null);
      });
  }, [rfqId]);

  if (!rfq) {
    return (
      <main style={{ padding: 40, color: "white" }}>
        {t("buyerQuotesPage.notFound")}
      </main>
    );
  }

  return (
    <main style={{ padding: 40, color: "white" }}>
      <h1>{t("buyerQuotesPage.title")}</h1>

      <h2>{rfq.product?.title}</h2>
      <p>{t("buyerQuotesPage.quantity")}: {rfq.quantity}</p>
      <p>{t("buyerQuotesPage.status")}: {statusText(rfq.status)}</p>
      <p>{t("buyerQuotesPage.note")}: {rfq.note}</p>

      <h3 style={{ marginTop: 30 }}>{t("buyerQuotesPage.incomingQuotes")}</h3>

      {rfq.quotes && rfq.quotes.length > 0 ? (
        rfq.quotes.map((q) => (
          <div
            key={q.id}
            style={{
              border: "1px solid #334155",
              padding: 20,
              borderRadius: 10,
              marginTop: 20,
              background: "#0f172a",
            }}
          >
            <p>{t("buyerQuotesPage.seller")}: {q.seller?.name || t("buyerQuotesPage.supplierFallback")}</p>
            <p>{t("buyerQuotesPage.price")}: {q.unitPrice} ₺</p>
            <p>{t("buyerQuotesPage.delivery")}: {q.deliveryDays} {t("buyerQuotesPage.days")}</p>
            <p>{t("buyerQuotesPage.note")}: {q.sellerNote}</p>
            <p>{t("buyerQuotesPage.status")}: {statusText(q.status)}</p>
          </div>
        ))
      ) : (
        <p>{t("buyerQuotesPage.noQuotes")}</p>
      )}
    </main>
  );
}
