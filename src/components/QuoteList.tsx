import React from "react";

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
  return (
    <>
      <h2>Quotes</h2>

      {quotes.map((q) => (
        <div key={q.id} style={panelCardStyle}>
          <div>Quote ID: {q.id}</div>
          <div>RFQ: {q.rfqId || q.rfq?.id || "-"}</div>
          <div>Fiyat: {q.unitPrice || q.price || "-"}</div>
          <div>Teslim: {q.deliveryDays || "-"} gün</div>
          <div>Durum: {q.status}</div>

          {role === "BUYER" && q.status === "SENT" && (
            <button
              style={{ marginTop: 8 }}
              onClick={() => acceptQuote(q.id)}
            >
              Teklifi Kabul Et
            </button>
          )}
        </div>
      ))}
    </>
  );
}