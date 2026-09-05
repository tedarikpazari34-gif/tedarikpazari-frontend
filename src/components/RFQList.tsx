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
  const { t } = useTranslation();

  return (
    <>
      {role === "BUYER" && (
        <>
          <h2>{t("rfqList.myRfqs")} ({rfqs.length})</h2>

          {rfqs.map((r) => (
            <div key={r.id} style={panelCardStyle}>
              <b>{t("rfqList.rfq")}:</b> {r.id}
              <div>{t("rfqList.product")}: {r.product?.title || r.productId}</div>
              <div>{t("rfqList.quantity")}: {r.quantity}</div>
              <div>{t("rfqList.status")}: {r.status}</div>
            </div>
          ))}
        </>
      )}

      {role === "SELLER" && (
        <>
          <h2>{t("rfqList.openRfqs")} ({openRfqs.length})</h2>

          {openRfqs.map((r) => (
            <div key={r.id} style={panelCardStyle}>
              <b>{t("rfqList.rfq")}:</b> {r.id}
              <div>{t("rfqList.product")}: {r.product?.title || r.productId}</div>
              <div>{t("rfqList.buyer")}: {r.buyer?.name || t("rfqList.verifiedBuyer")}</div>
              <div>{t("rfqList.quantity")}: {r.quantity}</div>
              <div>{t("rfqList.status")}: {r.status}</div>

              <button
                style={{ marginTop: 8 }}
                onClick={() => openQuoteModal(r)}
              >
                {t("rfqList.makeOffer")}
              </button>
            </div>
          ))}
        </>
      )}
    </>
  );
}