import React from "react";

interface RFQ {
  id: string;
  productId?: string;
  quantity: number;
  note?: string;
  status: string;
  product?: {
    title?: string;
  };
  buyer?: {
    name?: string;
  };
}

interface Props {
  role: string;
  rfqs: RFQ[];
  openRfqs: RFQ[];
  openQuoteModal: (rfq: RFQ) => void;
  panelCardStyle: React.CSSProperties;
}

export default function RFQList({
  role,
  rfqs,
  openRfqs,
  openQuoteModal,
  panelCardStyle,
}: Props) {
  return (
    <>
      {role === "BUYER" && (
        <>
          <h2>RFQ Listem ({rfqs.length})</h2>

          {rfqs.map((r) => (
            <div key={r.id} style={panelCardStyle}>
              <b>RFQ:</b> {r.id}
              <div>Ürün: {r.product?.title || r.productId}</div>
              <div>Miktar: {r.quantity}</div>
              <div>Durum: {r.status}</div>
            </div>
          ))}
        </>
      )}

      {role === "SELLER" && (
        <>
          <h2>OPEN RFQ ({openRfqs.length})</h2>

          {openRfqs.map((r) => (
            <div key={r.id} style={panelCardStyle}>
              <b>RFQ:</b> {r.id}
              <div>Ürün: {r.product?.title || r.productId}</div>
              <div>Buyer: {r.buyer?.name || "Onaylı Alıcı"}</div>
              <div>Miktar: {r.quantity}</div>
              <div>Durum: {r.status}</div>

              <button
                style={{ marginTop: 8 }}
                onClick={() => openQuoteModal(r)}
              >
                Teklif Ver
              </button>
            </div>
          ))}
        </>
      )}
    </>
  );
}