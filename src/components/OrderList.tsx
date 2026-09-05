import React from "react";
import { useTranslation } from "react-i18next";

interface OrderItem {
  id: string;
  status: string;
  totalAmount: string;
  commissionAmount: string;
  escrowAmount: string;
  quoteId?: string;
  rfq?: {
    quantity?: number;
    product?: {
      title?: string;
    };
  };
  quote?: {
    id?: string;
    unitPrice?: number | string;
    deliveryDays?: number;
  };
}

interface Props {
  orders: OrderItem[];
  role: string;
  payOrder: (id: string) => void;
  prepareOrder: (id: string) => void;
  shipOrder: (id: string) => void;
  completeOrder: (id: string) => void;
  openDispute: (id: string) => void;
  statusBadgeStyle: (status: string) => React.CSSProperties;
  panelCardStyle: React.CSSProperties;
}

export default function OrderList({
  orders,
  role,
  payOrder,
  prepareOrder,
  shipOrder,
  completeOrder,
  openDispute,
  statusBadgeStyle,
  panelCardStyle,
}: Props) {
  const { t } = useTranslation();

  return (
    <>
      <h2>{t("orderList.title")}</h2>

      {orders.map((o) => (
        <div key={o.id} style={panelCardStyle}>
          <div>{t("orderList.product")}: {o.rfq?.product?.title || "-"}</div>
          <div>{t("orderList.quantity")}: {o.rfq?.quantity || "-"}</div>
          <div>{t("orderList.quoteId")}: {o.quote?.id || o.quoteId || "-"}</div>
          <div>{t("orderList.unitPrice")}: {o.quote?.unitPrice || "-"}</div>
          <div>{t("orderList.deliveryTime")}: {o.quote?.deliveryDays || "-"} {t("orderList.days")}</div>
          <div>{t("orderList.total")}: {o.totalAmount}</div>
          <div>{t("orderList.commission")}: {o.commissionAmount}</div>
          <div>{t("orderList.escrow")}: {o.escrowAmount}</div>

          <div style={{ marginTop: 8 }}>
            {t("orderList.status")}:{" "}
            <span style={statusBadgeStyle(o.status)}>{o.status}</span>
          </div>

          {role === "BUYER" && o.status === "PENDING_PAYMENT" && (
            <button style={{ marginTop: 10 }} onClick={() => payOrder(o.id)}>
              {t("orderList.pay")}
            </button>
          )}

          {role === "SELLER" && o.status === "PAID" && (
            <button style={{ marginTop: 10 }} onClick={() => prepareOrder(o.id)}>
              {t("orderList.prepare")}
            </button>
          )}

          {role === "SELLER" && o.status === "PREPARING" && (
            <button style={{ marginTop: 10 }} onClick={() => shipOrder(o.id)}>
              {t("orderList.ship")}
            </button>
          )}

          {role === "BUYER" && o.status === "SHIPPED" && (
            <div style={{ marginTop: 10 }}>
              <button
                style={{ marginRight: 8 }}
                onClick={() => completeOrder(o.id)}
              >
                {t("orderList.received")}
              </button>
              <button onClick={() => openDispute(o.id)}>{t("orderList.openDispute")}</button>
            </div>
          )}
        </div>
      ))}
    </>
  );
}