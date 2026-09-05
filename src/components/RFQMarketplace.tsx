import React from "react";
import { useTranslation } from "react-i18next";

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
  rfqs: RFQ[];
  openQuoteModal: (rfq: RFQ) => void;
}

export default function RFQMarketplace({
  rfqs,
  openQuoteModal,
}: Props) {
  const { t } = useTranslation();

  if (!rfqs.length) {
    return <div>{t("rfqMarketplace.empty")}</div>;
  }

  return (
    <div style={{ marginTop: 40 }}>
      <h2>{t("rfqMarketplace.title")}</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,300px)",
          gap: 20,
        }}
      >
        {rfqs.map((rfq) => (
          <div
            key={rfq.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 16,
              background: "#fff",
            }}
          >
            <div style={{ fontWeight: 600 }}>
              {rfq.product?.title || t("rfqMarketplace.productFallback")}
            </div>

            <div style={{ marginTop: 6 }}>
              {t("rfqMarketplace.buyer")}: {rfq.buyer?.name || "-"}
            </div>

            <div style={{ marginTop: 6 }}>
              {t("rfqMarketplace.quantity")}: {rfq.quantity}
            </div>

            <div style={{ marginTop: 6 }}>
              {t("rfqMarketplace.status")}: {rfq.status}
            </div>

            <button
              style={{
                marginTop: 12,
                padding: "8px 12px",
                background: "#111827",
                color: "#fff",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
              }}
              onClick={() => openQuoteModal(rfq)}
            >
              {t("rfqMarketplace.makeOffer")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}