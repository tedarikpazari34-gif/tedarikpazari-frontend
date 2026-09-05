import React from "react";
import { useTranslation } from "react-i18next";

interface QuoteItem {
  id: string;
  rfqId?: string;
  unitPrice?: string | number;
  price?: string | number;
  deliveryDays?: number;
  status: string;
  rfq?: {
    id?: string;
  };
}

interface Props {
  quotes: QuoteItem[];
  role: string;
  acceptQuote: (id: string) => void;
  panelCardStyle: React.CSSProperties;
}

export default function QuoteList({
  quotes,
  role,
  acceptQuote,
  panelCardStyle,
}: Props) {
  const { t } = useTranslation();

  return (
    <>
      <h2>{t("quoteList.title")}</h2>

      {quotes.map((q) => (
        <div key={q.id} style={panelCardStyle}>
          <div>{t("quoteList.quoteId")}: {q.id}</div>
          <div>{t("quoteList.rfq")}: {q.rfqId || q.rfq?.id || "-"}</div>
          <div>{t("quoteList.price")}: {q.unitPrice || q.price || "-"}</div>
          <div>{t("quoteList.delivery")}: {q.deliveryDays || "-"} {t("quoteList.days")}</div>
          <div>{t("quoteList.status")}: {q.status}</div>

          {role === "BUYER" && q.status === "SENT" && (
            <button
              style={{ marginTop: 8 }}
              onClick={() => acceptQuote(q.id)}
            >
              {t("quoteList.acceptQuote")}
            </button>
          )}
        </div>
      ))}
    </>
  );
}